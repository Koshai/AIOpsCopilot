import re
from typing import Optional

_DEGREE_PATTERN = re.compile(
    r"(?i)\b(ms|bs|be|ba|mba|phd|m\.s\.|b\.s\.|b\.e\.|b\.a\.|"
    r"bachelor|master|degree|university|college|institute|school)\b"
)

_SECTION_STOP_PATTERN = re.compile(
    r"(?i)^(skills|experience|work experience|clearance|certification|"
    r"projects|summary|professional experience|employment)\b"
)


def _looks_like_degree_line(line: str) -> bool:
    return bool(_DEGREE_PATTERN.search(line))


def looks_like_degree_line(line: str) -> bool:
    return _looks_like_degree_line(line)


def infer_education_from_context(context: str) -> Optional[str]:
    """Best-effort education extraction when the LLM leaves the field empty."""
    if not context or not context.strip():
        return None

    lines = context.replace("\r\n", "\n").split("\n")

    for index, line in enumerate(lines):
        header = line.strip().strip(" \t\u2022\u25cf\u25cb\u25aa-*")
        if header.lower() != "education":
            continue

        education_lines: list[str] = []
        for follow in lines[index + 1 :]:
            cleaned = follow.strip().strip(" \t\u2022\u25cf\u25cb\u25aa-*")
            if not cleaned:
                if education_lines:
                    break
                continue
            if _SECTION_STOP_PATTERN.match(cleaned):
                break
            education_lines.append(cleaned)

        degree_lines = [line for line in education_lines if _looks_like_degree_line(line)]
        candidates = degree_lines or education_lines
        if candidates:
            return "; ".join(candidates[:3])

    degree_lines = [
        line.strip().strip(" \t\u2022\u25cf\u25cb\u25aa-*")
        for line in lines
        if _looks_like_degree_line(line)
        and "|" in line
        and not _SECTION_STOP_PATTERN.match(line.strip())
    ]
    if degree_lines:
        return "; ".join(dict.fromkeys(degree_lines[:3]))

    return None
