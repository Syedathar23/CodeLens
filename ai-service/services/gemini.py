import os
import json
import google.generativeai as genai
from fastapi import HTTPException
from dotenv import load_dotenv
import groq

from core.prompts import (
    build_review_prompt,
    build_diff_prompt,
    build_annotation_prompt,
)

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


def _strip_markdown(text: str) -> str:
    """Remove markdown code fences that Gemini sometimes wraps around JSON."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    return text.strip()


def remove_comments(code: str, language: str = "") -> str:
    """Strip all comment lines and inline comments from generated code."""
    import re
    lines = code.split("\n")
    clean = []
    in_block = False
    for line in lines:
        stripped = line.strip()
        if "/*" in stripped:
            in_block = True
        if in_block:
            if "*/" in stripped:
                in_block = False
            continue
        if stripped.startswith("//") or stripped.startswith("#"):
            continue
        line = re.sub(r"\s*//.*$", "", line)
        line = re.sub(r"\s*#.*$", "", line)
        if line.strip():
            clean.append(line)
    return "\n".join(clean)


async def call_gemini(code: str, language: str) -> dict:
    """Send a single-version review prompt to Gemini and return parsed JSON."""
    try:
        prompt = build_review_prompt(code, language)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0.2)
        )
        raw = _strip_markdown(response.text)
        result = json.loads(raw)
        result["improved_code"] = remove_comments(
            result.get("improved_code", ""), language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini review failed: {str(e)}")


async def call_gemini_diff(
    old_code: str,
    new_code: str,
    language: str,
    prev_issues: list,
) -> dict:
    """Send a diff-based review prompt to Gemini and return parsed JSON."""
    try:
        prompt = build_diff_prompt(old_code, new_code, language, prev_issues)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0.2)
        )
        raw = _strip_markdown(response.text)
        result = json.loads(raw)
        result["improved_code"] = remove_comments(
            result.get("improved_code", ""), language
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Gemini diff review failed: {str(e)}"
        )


async def call_gemini_annotation(selected_text: str, message: str) -> str:
    """Send an annotation prompt to Gemini and return the plain text response."""
    try:
        prompt = build_annotation_prompt(selected_text, message)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Gemini annotation failed: {str(e)}"
        )


async def call_llama_sidechat(selected_text: str, message: str) -> str:
    if not GROQ_API_KEY:
        raise Exception("GROQ_API_KEY not configured")
    try:
        client = groq.Groq(api_key=GROQ_API_KEY)
        system_prompt = "You are CodeLens AI. Help the user understand or improve their code."
        if selected_text:
            system_prompt += f"\n\nContext block:\n```\n{selected_text}\n```"
        
        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.5,
            max_tokens=1024,
        )
        return completion.choices[0].message.content
    except Exception as e:
        raise Exception(f"Llama sidechat failed: {str(e)}")


async def update_skill_profile(
    user_id: int,
    language: str,
    score: float,
    conn,
) -> None:
    """Upsert the skill_profile row for a user+language pair after a review."""
    try:
        cursor = conn.cursor()

        # Check for an existing profile
        cursor.execute(
            """
            SELECT id, avg_score, total_reviews, xp_points
            FROM skill_profiles
            WHERE user_id = %s AND language = %s
            """,
            (user_id, language),
        )
        existing = cursor.fetchone()

        if existing:
            profile_id, avg_score, total_reviews, xp_points = existing
            new_total = total_reviews + 1
            new_avg = ((avg_score * total_reviews) + score) / new_total
            new_xp = xp_points + int(score * 10)

            if new_avg < 4:
                skill_level = "beginner"
            elif new_avg < 6:
                skill_level = "intermediate"
            elif new_avg < 8:
                skill_level = "advanced"
            else:
                skill_level = "expert"

            cursor.execute(
                """
                UPDATE skill_profiles
                SET avg_score = %s,
                    total_reviews = %s,
                    xp_points = %s,
                    skill_level = %s,
                    updated_at = NOW()
                WHERE id = %s
                """,
                (new_avg, new_total, new_xp, skill_level, profile_id),
            )
        else:
            if score < 4:
                skill_level = "beginner"
            elif score < 6:
                skill_level = "intermediate"
            elif score < 8:
                skill_level = "advanced"
            else:
                skill_level = "expert"

            cursor.execute(
                """
                INSERT INTO skill_profiles
                    (user_id, language, avg_score, total_reviews, xp_points, skill_level)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (user_id, language, score, 1, int(score * 10), skill_level),
            )

        conn.commit()
        cursor.close()
    except Exception as e:
        conn.rollback()
        # Non-fatal — log but don't crash the endpoint
        print(f"update_skill_profile error: {e}")
async def call_llama_sidechat(selected_text: str, message: str) -> str:
    from groq import Groq
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    groq_key = os.getenv("GROQ_API_KEY")
    
    if groq_key:
        try:
            client = Groq(api_key=groq_key)
            response = client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful code assistant. Give clear, concise explanations."
                    },
                    {
                        "role": "user",
                        "content": f"Context: '{selected_text}'\nQuestion: {message}"
                    }
                ],
                max_tokens=500,
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Groq failed: {e}, falling back to Gemini")
    
    # Fallback to Gemini if no Groq key
    try:
        import google.generativeai as genai
        load_dotenv()
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"Context from code: '{selected_text}'\nQuestion: {message}\nAnswer concisely."
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise Exception(f"Both Groq and Gemini failed: {e}")
