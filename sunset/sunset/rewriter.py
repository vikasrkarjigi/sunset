"""
Rewriter interface: turns an original script (+ prior failure history)
into a candidate modernized script.

CannedRewriter returns pre-written candidates in sequence -- no LLM key
is available for this build, and the build spec's own cut-list sanctions
this (the verification harness is the product; it demos fully without
live generation). The protocol boundary is the honest seam: this is
exactly where a live generator drops in later. No runtime API was found
for Forge (confirmed by research) so a future live backend would be a
direct LLM API call, not a Forge call -- the interface doesn't care.
"""

from __future__ import annotations

from typing import Protocol


class Rewriter(Protocol):
    def generate(self, original: bytes, history: list[str]) -> bytes:
        """Return a candidate rewrite given the original script and prior
        attempts' structured feedback (empty on attempt 1)."""
        ...


class CannedRewriter:
    """Returns pre-written candidate scripts in order, one per call.
    Ignores `original` and `history` -- the fixture author already knows
    what each attempt should look like."""

    def __init__(self, candidates: list[bytes]):
        if not candidates:
            raise ValueError("CannedRewriter needs at least one candidate")
        self._candidates = candidates
        self._calls = 0

    def generate(self, original: bytes, history: list[str]) -> bytes:
        idx = min(self._calls, len(self._candidates) - 1)
        self._calls += 1
        return self._candidates[idx]


class ForgeRewriter:
    """Stub for a live runtime generator. No public runtime API was found
    for Forge (softwareforge.ai) as of this build -- see research notes.
    Wire this to a direct LLM API (e.g. Anthropic) if/when a key is
    available; the verify.py loop does not need to change."""

    def __init__(self, *_, **__):
        raise NotImplementedError(
            "No live generation backend configured for this build. "
            "Use CannedRewriter, or implement generate() against a direct "
            "LLM API here."
        )

    def generate(self, original: bytes, history: list[str]) -> bytes:  # pragma: no cover
        raise NotImplementedError
