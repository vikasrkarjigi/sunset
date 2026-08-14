"""
The verdict loop -- the heart of the product. Everything else is
scaffolding around this.

    determinism pre-check: run the ORIGINAL twice, fresh sandboxes each
        original != itself -> UNVERIFIABLE, never enter the repair loop

    for attempt in 1..MAX_ATTEMPTS:
        candidate = rewriter.generate(original, history)
        run original vs candidate in a fresh sandbox pair
        diff empty? -> GREEN_LIGHT
        else -> append structured feedback to history

    exhausted -> ESCALATED, full divergence report
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from daytona import AsyncDaytona

from sunset.differ import Divergence, compare
from sunset.feedback import format_feedback
from sunset.rewriter import Rewriter
from sunset.runner import RunResult, run_pair, run_script

MAX_ATTEMPTS = 3


class Verdict(str, Enum):
    GREEN_LIGHT = "green_light"
    ESCALATED = "escalated"
    UNVERIFIABLE = "unverifiable"


@dataclass
class AttemptRecord:
    attempt: int
    candidate_script: bytes
    legacy_result: RunResult
    candidate_result: RunResult
    divergence: Divergence
    feedback: str


@dataclass
class JobResult:
    verdict: Verdict
    fixture_name: str
    legacy_image: str
    modern_image: str
    determinism_check_passed: bool
    attempts: list[AttemptRecord] = field(default_factory=list)
    final_candidate: bytes | None = None


async def check_determinism(
    daytona: AsyncDaytona,
    legacy_image: str,
    legacy_script: bytes,
    input_files: dict[str, bytes],
    output_filenames: list[str],
    timeout: int,
) -> tuple[bool, Divergence]:
    """Run the ORIGINAL against itself, in two fresh sandboxes. If it
    disagrees with itself, it's not a rewrite-equivalence problem -- the
    script itself is non-deterministic, and diffing a rewrite against it
    would be meaningless. Report that, don't burn a repair attempt on it."""
    run_a, run_b = await run_pair(
        daytona,
        legacy_image, legacy_script,
        legacy_image, legacy_script,
        input_files, output_filenames, timeout,
    )
    divergence = compare(run_a, run_b)
    return divergence.is_empty(), divergence


async def verify(
    daytona: AsyncDaytona,
    fixture_name: str,
    legacy_image: str,
    modern_image: str,
    legacy_script: bytes,
    rewriter: Rewriter,
    input_files: dict[str, bytes] | None = None,
    output_filenames: list[str] | None = None,
    timeout: int = 60,
    max_attempts: int = MAX_ATTEMPTS,
) -> JobResult:
    input_files = input_files or {}
    output_filenames = output_filenames or []

    is_deterministic, self_divergence = await check_determinism(
        daytona, legacy_image, legacy_script, input_files, output_filenames, timeout
    )
    if not is_deterministic:
        return JobResult(
            verdict=Verdict.UNVERIFIABLE,
            fixture_name=fixture_name,
            legacy_image=legacy_image,
            modern_image=modern_image,
            determinism_check_passed=False,
            attempts=[
                AttemptRecord(
                    attempt=0,
                    candidate_script=legacy_script,
                    legacy_result=RunResult("", "", 0),
                    candidate_result=RunResult("", "", 0),
                    divergence=self_divergence,
                    feedback=format_feedback(
                        self_divergence, 0,
                        "The ORIGINAL script disagreed with itself across two "
                        "fresh runs. This script is non-deterministic and "
                        "cannot be verified by output diffing.",
                    ),
                )
            ],
        )

    history: list[str] = []
    attempts: list[AttemptRecord] = []

    for attempt in range(1, max_attempts + 1):
        candidate_script = rewriter.generate(legacy_script, history)

        legacy_result, candidate_result = await run_pair(
            daytona,
            legacy_image, legacy_script,
            modern_image, candidate_script,
            input_files, output_filenames, timeout,
        )
        divergence = compare(legacy_result, candidate_result)
        feedback_text = format_feedback(divergence, attempt)

        attempts.append(
            AttemptRecord(
                attempt=attempt,
                candidate_script=candidate_script,
                legacy_result=legacy_result,
                candidate_result=candidate_result,
                divergence=divergence,
                feedback=feedback_text,
            )
        )

        if divergence.is_empty():
            return JobResult(
                verdict=Verdict.GREEN_LIGHT,
                fixture_name=fixture_name,
                legacy_image=legacy_image,
                modern_image=modern_image,
                determinism_check_passed=True,
                attempts=attempts,
                final_candidate=candidate_script,
            )

        history.append(feedback_text)

    return JobResult(
        verdict=Verdict.ESCALATED,
        fixture_name=fixture_name,
        legacy_image=legacy_image,
        modern_image=modern_image,
        determinism_check_passed=True,
        attempts=attempts,
    )
