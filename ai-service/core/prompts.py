def build_review_prompt(code: str, language: str = "auto") -> str:
    return f"""You are an expert code reviewer.

First, automatically detect the programming language 
of the following code.

Then review it and respond ONLY with raw JSON 
(no markdown, no backticks, no comments):

{{
  "detected_language": "<the detected language name>",
  "score": <float 0-10>,
  "summary": "<2-3 sentence assessment>",
  "improved_code": "<complete clean improved code, 
                    NO comments, NO JavaDoc>",
  "issues": [
    {{
      "type": "bug|suggestion|security|performance",
      "description": "<issue with line reference>"
    }}
  ]
}}

Code to review:
{code}"""


def build_diff_prompt(old_code: str, new_code: str, language: str, prev_issues: list) -> str:
    prev_issues_str = "\n".join(
        f"- [{i.get('type','?')}] {i.get('description','')}" for i in prev_issues
    ) if prev_issues else "None"

    return f"""You are an expert {language} code reviewer comparing two versions of code.

Previous issues found:
{prev_issues_str}

Old version:
```{language}
{old_code}
```

New version:
```{language}
{new_code}
```

Return ONLY valid JSON, no markdown, no backticks:
{{"score": <float 0-10>, "improvement_score": <float -10 to +10, positive means improved>, "summary": "<what changed and whether it improved>", "improved_code": "<the best possible final version with all remaining issues fixed>", "fixed_issues": ["<description of what was fixed>"], "issues": [{{"type": "<bug|suggestion|security>", "description": "<what still needs fixing>"}}]}}"""


def build_annotation_prompt(selected_text: str, message: str) -> str:
    return f"""You are a helpful code review assistant. Be concise and practical.

The user selected this text from a code review:
\"\"\"{selected_text}\"\"\"

Their question: {message}

Give a clear, direct answer in 2-4 sentences. No fluff."""


async def call_gemini(code: str, language: str) -> dict:
    try:
        prompt = build_review_prompt(code, language)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0.2)
        )
        raw = _strip_markdown(response.text)
        result = json.loads(raw)

        # Safety checks — ensure required fields exist
        if "improved_code" not in result or not result["improved_code"]:
            result["improved_code"] = code  # fallback to original
        if "issues" not in result:
            result["issues"] = []
        if "score" not in result:
            result["score"] = 5.0

        return result
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Gemini returned invalid JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini review failed: {str(e)}")