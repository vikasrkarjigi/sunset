"""
Manifest of demo fixtures. Each fixture pairs a legacy script with an
input file and a sequence of candidate rewrites for the CannedRewriter.

`legacy_image` defaults to python:2.7-slim. If Step 0's spike proves
that image doesn't boot in a Daytona sandbox, switch to the Rung 4
fallback by passing --legacy-variant=py3fallback on the CLI (see
cli.py) rather than editing this file under time pressure.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"

MODERN_IMAGE = "python:3.12-slim"
LEGACY_IMAGE_PY2 = "python:2.7-slim"
LEGACY_IMAGE_PY3_FALLBACK = "python:3.6-slim"


@dataclass
class Fixture:
    name: str
    description: str
    legacy_script: Path
    legacy_script_fallback: Path | None
    input_files: dict[str, Path]
    candidates: list[Path]  # in attempt order; CannedRewriter walks this list
    output_filenames: list[str]


FIXTURES: dict[str, Fixture] = {
    "a": Fixture(
        name="a_invoice_recon",
        description="The trap: dropped %.2f formatting. Fails attempt 1, passes attempt 2.",
        legacy_script=FIXTURES_DIR / "a_invoice_recon" / "legacy.py",
        legacy_script_fallback=FIXTURES_DIR / "a_invoice_recon" / "legacy_p3_fallback.py",
        input_files={"invoices.csv": FIXTURES_DIR / "a_invoice_recon" / "invoices.csv"},
        candidates=[
            FIXTURES_DIR / "a_invoice_recon" / "candidate_v1_buggy.py",
            FIXTURES_DIR / "a_invoice_recon" / "candidate_v2_fixed.py",
        ],
        output_filenames=[],
    ),
    "b": Fixture(
        name="b_data_export",
        description="Clean pass: straightforward port, green on attempt 1.",
        legacy_script=FIXTURES_DIR / "b_data_export" / "legacy.py",
        legacy_script_fallback=None,  # pure integer math -- no Python 2 dependency at all
        input_files={"inventory.csv": FIXTURES_DIR / "b_data_export" / "inventory.csv"},
        candidates=[
            FIXTURES_DIR / "b_data_export" / "candidate.py",
        ],
        output_filenames=[],
    ),
    "c": Fixture(
        name="c_never_converges",
        description="Escalation path: three distinct wrong candidates, never matches.",
        legacy_script=FIXTURES_DIR / "c_never_converges" / "legacy.py",
        legacy_script_fallback=None,
        input_files={},
        candidates=[
            FIXTURES_DIR / "c_never_converges" / "candidate_v1_rounds_instead_of_floors.py",
            FIXTURES_DIR / "c_never_converges" / "candidate_v2_offbyone_denominator.py",
            FIXTURES_DIR / "c_never_converges" / "candidate_v3_wrong_metric.py",
        ],
        output_filenames=[],
    ),
    "d": Fixture(
        name="d_nondeterministic",
        description="Unverifiable: unseeded random + wall clock. Caught before the repair loop starts.",
        legacy_script=FIXTURES_DIR / "d_nondeterministic" / "legacy.py",
        legacy_script_fallback=None,
        input_files={},
        candidates=[],  # never reached -- determinism pre-check rejects first
        output_filenames=[],
    ),
}


def legacy_script_bytes(fixture: Fixture, use_fallback: bool) -> bytes:
    path = fixture.legacy_script_fallback if (use_fallback and fixture.legacy_script_fallback) else fixture.legacy_script
    return path.read_bytes()


def legacy_image(use_fallback: bool) -> str:
    return LEGACY_IMAGE_PY3_FALLBACK if use_fallback else LEGACY_IMAGE_PY2
