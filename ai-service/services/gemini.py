import os
import json
import google.generativeai as genai
from fastapi import HTTPException
from dotenv import load_dotenv

from core.prompts import (
    build_review_prompt,
    build_diff_prompt,
    build_annotation_prompt,
)

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


def _strip_markdown(text: str) -> str:
    """Remove markdown code fences that Gemini sometimes wraps around JSON."""
    text = text.strip()
    if text.startswith("```"):
        # Remove opening fence (```json or ```)
        text = text.split("\n", 1)[-1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    return text.strip()


async def call_gemini(code: str, language: str) -> dict:
    """Send a single-version review prompt to Gemini and return parsed JSON."""
    try:
        prompt = build_review_prompt(code, language)
        response = model.generate_content(prompt)
        raw = _strip_markdown(response.text)
        return json.loads(raw)
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
        response = model.generate_content(prompt)
        raw = _strip_markdown(response.text)
        return json.loads(raw)
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
