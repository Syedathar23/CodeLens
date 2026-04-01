def build_review_prompt(code: str, language: str) -> str:
    """Build the prompt for a standard single-version code review."""
    return (
        f"You are an expert code reviewer with 10 years of experience. "
        f"Review the following {language} code and respond ONLY in this exact JSON format "
        f"with no markdown, no backticks, just raw JSON:\n"
        f'{{\n'
        f'  "score": float between 0-10,\n'
        f'  "summary": "string (2-3 sentences)",\n'
        f'  "issues": [\n'
        f'    {{\n'
        f'      "type": "bug or suggestion or security",\n'
        f'      "description": "string"\n'
        f'    }}\n'
        f'  ]\n'
        f'}}\n'
        f"Code to review:\n{code}"
    )


def build_diff_prompt(
    old_code: str,
    new_code: str,
    language: str,
    prev_issues: list,
) -> str:
    """Build the prompt for a diff-based review comparing two code versions."""
    return (
        f"You are an expert code reviewer. Compare these two versions of {language} code "
        f"and respond ONLY in raw JSON with no markdown:\n"
        f'{{\n'
        f'  "score": float 0-10,\n'
        f'  "improvement_score": float (-10 to +10),\n'
        f'  "summary": "string",\n'
        f'  "fixed_issues": ["string"],\n'
        f'  "issues": [{{"type": "string", "description": "string"}}]\n'
        f'}}\n'
        f"Previous issues: {prev_issues}\n"
        f"Old code: {old_code}\n"
        f"New code: {new_code}"
    )


def build_annotation_prompt(selected_text: str, message: str) -> str:
    """Build the prompt for answering an inline annotation question."""
    return (
        f"You are a helpful code review assistant.\n"
        f"The user is asking about this specific part of a code review: '{selected_text}'\n"
        f"Their question is: '{message}'\n"
        f"Give a clear, concise explanation."
    )
