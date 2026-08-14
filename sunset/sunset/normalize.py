"""
Defuse false divergences before diffing.

If a legacy script touches datetime.now(), random, UUIDs, or unordered
dict/set iteration, two otherwise-identical runs will never match byte
for byte. Normalizing known-nondeterministic patterns first is what
keeps the differ honest: a divergence that survives normalization is a
real behavioural difference, not noise.
"""

from __future__ import annotations

import re

_TIMESTAMP_PATTERNS = [
    # ISO 8601, e.g. 2026-08-14T09:30:00 or with a Z / offset
    re.compile(r"\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?"),
    # 2026-08-14
    re.compile(r"\d{4}-\d{2}-\d{2}"),
    # 09:30:00 or 09:30:00.123456
    re.compile(r"\d{2}:\d{2}:\d{2}(\.\d+)?"),
]

_UUID_PATTERN = re.compile(
    r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
)

# Matches /home/user/..., /tmp/sunset_spike/..., C:\Users\..., etc.
_ABS_PATH_PATTERN = re.compile(
    r"(/(?:home|tmp|root|var|usr)/[^\s\"']+)|([A-Za-z]:\\[^\s\"']+)"
)


def normalize(text: str) -> str:
    """Mask known-nondeterministic substrings so identical logic diffs as identical."""
    result = text
    for pattern in _TIMESTAMP_PATTERNS:
        result = pattern.sub("<TIMESTAMP>", result)
    result = _UUID_PATTERN.sub("<UUID>", result)
    result = _ABS_PATH_PATTERN.sub("<PATH>", result)
    return result


def normalize_sorted(text: str) -> str:
    """Normalize, then sort lines. Use only when line order is not semantically meaningful."""
    normalized = normalize(text)
    lines = normalized.splitlines()
    return "\n".join(sorted(lines))
