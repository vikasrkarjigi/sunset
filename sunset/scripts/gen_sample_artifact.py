"""
Generate sample_job_result.json by running fixture A locally with
subprocess (no Daytona needed) so Forge can start building the UI
against real, accurate divergence data before Step 0 is unblocked.

Uses the p3-fallback legacy variant so it runs under the local Python
3.12 interpreter -- the %.2f-dropped-formatting bug is not Python-2
specific (see fixtures.py), so this is a faithful stand-in for what
Daytona will produce once the sandbox round-trip is proven.
"""

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from sunset.artifact import job_result_to_dict  # noqa: E402
from sunset.differ import compare  # noqa: E402
from sunset.feedback import format_feedback  # noqa: E402
from sunset.runner import RunResult  # noqa: E402
from sunset.verify import AttemptRecord, JobResult, Verdict  # noqa: E402

FIXTURE_DIR = ROOT / "fixtures" / "a_invoice_recon"
PY = sys.executable


def run_local(script_name: str) -> RunResult:
    proc = subprocess.run(
        [PY, script_name],
        cwd=FIXTURE_DIR,
        capture_output=True,
        text=True,
    )
    return RunResult(
        stdout=proc.stdout,
        stderr=proc.stderr,
        exit_code=proc.returncode,
        duration_ms=0,  # not measured locally; real runs populate this
        sandbox_id="sample-local-subprocess",
    )


def main() -> None:
    legacy_result = run_local("legacy_p3_fallback.py")

    # Determinism check: run the legacy side twice, confirm it agrees with itself.
    legacy_result_2 = run_local("legacy_p3_fallback.py")
    determinism_divergence = compare(legacy_result, legacy_result_2)
    assert determinism_divergence.is_empty(), "fixture A legacy side is not deterministic!"

    v1_result = run_local("candidate_v1_buggy.py")
    v1_divergence = compare(legacy_result, v1_result)
    v1_feedback = format_feedback(v1_divergence, 1)
    assert not v1_divergence.is_empty(), "expected attempt 1 to diverge -- fixture is broken"

    v2_result = run_local("candidate_v2_fixed.py")
    v2_divergence = compare(legacy_result, v2_result)
    v2_feedback = format_feedback(v2_divergence, 2)
    assert v2_divergence.is_empty(), "expected attempt 2 to pass -- fixture is broken"

    job = JobResult(
        verdict=Verdict.GREEN_LIGHT,
        fixture_name="a_invoice_recon",
        legacy_image="python:2.7-slim",
        modern_image="python:3.12-slim",
        determinism_check_passed=True,
        attempts=[
            AttemptRecord(1, (FIXTURE_DIR / "candidate_v1_buggy.py").read_bytes(), legacy_result, v1_result, v1_divergence, v1_feedback),
            AttemptRecord(2, (FIXTURE_DIR / "candidate_v2_fixed.py").read_bytes(), legacy_result, v2_result, v2_divergence, v2_feedback),
        ],
        final_candidate=(FIXTURE_DIR / "candidate_v2_fixed.py").read_bytes(),
    )

    out_path = ROOT / "sample_job_result.json"
    out_path.write_text(json.dumps(job_result_to_dict(job), indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")
    print(f"Verdict: {job.verdict.value}")
    print(f"Attempt 1 diverging rows: {v1_divergence.total_diverging} of {v1_divergence.total_compared}")
    print(f"Attempt 2 diverging rows: {v2_divergence.total_diverging} of {v2_divergence.total_compared}")


if __name__ == "__main__":
    main()
