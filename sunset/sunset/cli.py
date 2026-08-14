"""
CLI entrypoint: python -m sunset.cli verify --fixture a [--legacy-variant py3fallback]

The lowest-risk demo surface. Runs live against real Daytona sandboxes,
prints the attempt-by-attempt narrative, and writes job_result.json next
to the fixture for the Forge UI (or a manual inspection) to pick up.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

from daytona import AsyncDaytona  # noqa: E402

from sunset.artifact import job_result_to_dict  # noqa: E402
from sunset.fixtures import FIXTURES, MODERN_IMAGE, legacy_image, legacy_script_bytes  # noqa: E402
from sunset.rewriter import CannedRewriter  # noqa: E402
from sunset.verify import Verdict, verify  # noqa: E402

VERDICT_BANNER = {
    Verdict.GREEN_LIGHT: "\033[92m GREEN LIGHT \033[0m  safe to ship",
    Verdict.ESCALATED: "\033[91m ESCALATED \033[0m    could not converge -- human review required",
    Verdict.UNVERIFIABLE: "\033[93m UNVERIFIABLE \033[0m  original script is non-deterministic",
}


async def run_fixture(fixture_key: str, use_fallback: bool, timeout: int) -> int:
    fixture = FIXTURES[fixture_key]
    print(f"=== {fixture.name} ===")
    print(fixture.description)
    print()

    legacy_bytes = legacy_script_bytes(fixture, use_fallback)
    legacy_img = legacy_image(use_fallback)
    input_files = {name: path.read_bytes() for name, path in fixture.input_files.items()}
    rewriter = CannedRewriter([p.read_bytes() for p in fixture.candidates]) if fixture.candidates else CannedRewriter([legacy_bytes])

    async with AsyncDaytona() as daytona:
        job = await verify(
            daytona,
            fixture_name=fixture.name,
            legacy_image=legacy_img,
            modern_image=MODERN_IMAGE,
            legacy_script=legacy_bytes,
            rewriter=rewriter,
            input_files=input_files,
            output_filenames=fixture.output_filenames,
            timeout=timeout,
        )

    for record in job.attempts:
        if record.attempt == 0:
            print("--- determinism pre-check ---")
        else:
            print(f"--- attempt {record.attempt} ---")
        print(record.feedback)
        print()

    print(f"VERDICT: {VERDICT_BANNER[job.verdict]}")

    out_path = ROOT / f"job_result_{fixture_key}.json"
    out_path.write_text(json.dumps(job_result_to_dict(job), indent=2), encoding="utf-8")
    print(f"\nWrote {out_path}")

    return 0 if job.verdict == Verdict.GREEN_LIGHT else 1


def main() -> None:
    parser = argparse.ArgumentParser(prog="sunset")
    sub = parser.add_subparsers(dest="command", required=True)

    v = sub.add_parser("verify", help="Run a fixture through the verification pipeline")
    v.add_argument("--fixture", choices=sorted(FIXTURES.keys()), required=True)
    v.add_argument(
        "--legacy-variant",
        choices=["py2", "py3fallback"],
        default="py2",
        help="py2 = real python:2.7-slim sandbox; py3fallback = Rung 4 fallback "
        "if Python 2 doesn't boot in Daytona (see plan Step 0)",
    )
    v.add_argument("--timeout", type=int, default=60, help="per-run exec timeout in seconds")

    args = parser.parse_args()

    if args.command == "verify":
        use_fallback = args.legacy_variant == "py3fallback"
        exit_code = asyncio.run(run_fixture(args.fixture, use_fallback, args.timeout))
        sys.exit(exit_code)


if __name__ == "__main__":
    main()
