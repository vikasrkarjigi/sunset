"""
Compare a legacy run against a candidate run and classify what, if anything,
diverged. Starts dumb (line-by-line stdout compare) and stays dumb per the
build spec's cut-list -- row-level structured data diff is the first thing
to cut under time pressure, not a prerequisite for a working demo.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from sunset.normalize import normalize
from sunset.runner import RunResult

DivergenceKind = str  # "exit_code" | "line_count" | "numeric_formatting" | "content"


@dataclass
class RowDiff:
    line_no: int
    legacy_value: str
    rewrite_value: str


@dataclass
class Divergence:
    kind: DivergenceKind
    rows: list[RowDiff] = field(default_factory=list)
    total_diverging: int = 0
    total_compared: int = 0
    exit_code_legacy: int | None = None
    exit_code_rewrite: int | None = None
    stderr_legacy: str = ""
    stderr_rewrite: str = ""

    def is_empty(self) -> bool:
        return (
            self.kind == "none"
            and self.total_diverging == 0
            and self.exit_code_legacy == self.exit_code_rewrite
        )


def _looks_like_numeric_formatting(a: str, b: str) -> bool:
    """True if a and b parse to the same float but render differently -- the
    canonical Python 2->3 %.2f-dropped-formatting bug."""
    try:
        return float(a) == float(b) and a != b
    except ValueError:
        return False


def compare(legacy: RunResult, rewrite: RunResult) -> Divergence:
    legacy_out = normalize(legacy.stdout)
    rewrite_out = normalize(rewrite.stdout)

    if legacy.exit_code != rewrite.exit_code:
        return Divergence(
            kind="exit_code",
            total_diverging=1,
            total_compared=1,
            exit_code_legacy=legacy.exit_code,
            exit_code_rewrite=rewrite.exit_code,
            stderr_legacy=legacy.stderr,
            stderr_rewrite=rewrite.stderr,
        )

    legacy_lines = legacy_out.splitlines()
    rewrite_lines = rewrite_out.splitlines()

    if len(legacy_lines) != len(rewrite_lines):
        return Divergence(
            kind="line_count",
            total_diverging=abs(len(legacy_lines) - len(rewrite_lines)),
            total_compared=max(len(legacy_lines), len(rewrite_lines)),
            exit_code_legacy=legacy.exit_code,
            exit_code_rewrite=rewrite.exit_code,
        )

    rows: list[RowDiff] = []
    numeric_only = True
    for i, (a, b) in enumerate(zip(legacy_lines, rewrite_lines), start=1):
        if a == b:
            continue
        rows.append(RowDiff(line_no=i, legacy_value=a, rewrite_value=b))
        if not _looks_like_numeric_formatting(a, b):
            numeric_only = False

    if not rows:
        return Divergence(
            kind="none",
            total_compared=len(legacy_lines),
            exit_code_legacy=legacy.exit_code,
            exit_code_rewrite=rewrite.exit_code,
        )

    return Divergence(
        kind="numeric_formatting" if numeric_only else "content",
        rows=rows,
        total_diverging=len(rows),
        total_compared=len(legacy_lines),
        exit_code_legacy=legacy.exit_code,
        exit_code_rewrite=rewrite.exit_code,
    )
