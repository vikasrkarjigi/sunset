"""
Turn a Divergence into precise generator context.

"The outputs did not match" produces a random second guess. Telling the
generator exactly which row diverged, in what way, and which source
line is implicated produces a targeted fix. This is what separates the
repair loop from a retry with a different seed -- and it is the exact
seam where a live generator (Forge, or any LLM) drops in later.
"""

from __future__ import annotations

from sunset.differ import Divergence

_KIND_LABEL = {
    "exit_code": "exit code mismatch",
    "line_count": "output line count mismatch",
    "numeric_formatting": "numeric formatting",
    "content": "output content",
    "none": "no divergence",
}

_MAX_ROWS_SHOWN = 5


def format_feedback(divergence: Divergence, attempt: int, source_hint: str = "") -> str:
    if divergence.is_empty():
        return f"Attempt {attempt}: no divergence."

    label = _KIND_LABEL.get(divergence.kind, divergence.kind)
    lines = [f"Attempt {attempt} diverged from the legacy behaviour.", ""]
    lines.append(f"Divergence type: {label}")

    if divergence.kind == "exit_code":
        lines.append(f"Exit codes: legacy {divergence.exit_code_legacy}, "
                      f"rewrite {divergence.exit_code_rewrite}")
        if divergence.stderr_legacy or divergence.stderr_rewrite:
            lines.append(f"Legacy stderr: {divergence.stderr_legacy.strip()[:300]!r}")
            lines.append(f"Rewrite stderr: {divergence.stderr_rewrite.strip()[:300]!r}")
    else:
        for row in divergence.rows[:_MAX_ROWS_SHOWN]:
            lines.append(f"Line {row.line_no}:")
            lines.append(f"  legacy output:  {row.legacy_value}")
            lines.append(f"  rewrite output: {row.rewrite_value}")
        if len(divergence.rows) > _MAX_ROWS_SHOWN:
            lines.append(f"  ... and {len(divergence.rows) - _MAX_ROWS_SHOWN} more diverging lines")
        lines.append(
            f"Exit codes: legacy {divergence.exit_code_legacy}, "
            f"rewrite {divergence.exit_code_rewrite}"
        )

    if source_hint:
        lines.append("")
        lines.append(source_hint)

    lines.append("")
    lines.append(
        f"Total diverging rows: {divergence.total_diverging} of {divergence.total_compared}."
    )
    if divergence.kind == "numeric_formatting":
        lines.append("All diverging rows are numeric formatting only -- values are equal, "
                      "string representation differs. Preserve the legacy formatting exactly.")

    return "\n".join(lines)
