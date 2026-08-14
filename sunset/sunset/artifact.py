"""
Serializes a JobResult into the frozen JSON contract the Forge UI is
built against. This schema is frozen deliberately -- changing it after
Forge has started consuming it costs rework neither side has time for.
"""

from __future__ import annotations

import json
from typing import Any

from sunset.differ import Divergence, RowDiff
from sunset.runner import RunResult
from sunset.verify import AttemptRecord, JobResult


def _run_result_to_dict(r: RunResult) -> dict[str, Any]:
    return {
        "stdout": r.stdout,
        "stderr": r.stderr,
        "exit_code": r.exit_code,
        "files": r.files,
        "duration_ms": r.duration_ms,
        "sandbox_id": r.sandbox_id,
    }


def _row_diff_to_dict(row: RowDiff) -> dict[str, Any]:
    return {
        "line_no": row.line_no,
        "legacy_value": row.legacy_value,
        "rewrite_value": row.rewrite_value,
    }


def _divergence_to_dict(d: Divergence) -> dict[str, Any]:
    return {
        "kind": d.kind,
        "rows": [_row_diff_to_dict(r) for r in d.rows],
        "total_diverging": d.total_diverging,
        "total_compared": d.total_compared,
        "exit_code_legacy": d.exit_code_legacy,
        "exit_code_rewrite": d.exit_code_rewrite,
    }


def _attempt_to_dict(a: AttemptRecord) -> dict[str, Any]:
    return {
        "attempt": a.attempt,
        "candidate_script": a.candidate_script.decode("utf-8", errors="replace"),
        "legacy": _run_result_to_dict(a.legacy_result),
        "candidate": _run_result_to_dict(a.candidate_result),
        "divergence": _divergence_to_dict(a.divergence),
        "feedback": a.feedback,
    }


def job_result_to_dict(job: JobResult) -> dict[str, Any]:
    return {
        "verdict": job.verdict.value,
        "fixture_name": job.fixture_name,
        "legacy_image": job.legacy_image,
        "modern_image": job.modern_image,
        "determinism_check_passed": job.determinism_check_passed,
        "attempts": [_attempt_to_dict(a) for a in job.attempts],
        "final_candidate": (
            job.final_candidate.decode("utf-8", errors="replace")
            if job.final_candidate
            else None
        ),
    }


def job_result_to_json(job: JobResult, indent: int = 2) -> str:
    return json.dumps(job_result_to_dict(job), indent=indent)
