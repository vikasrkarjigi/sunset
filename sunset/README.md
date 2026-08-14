# Sunset

Legacy script modernization agent that proves its own work. Runs the
original and a candidate rewrite in two fresh Daytona sandboxes against
identical inputs, diffs every output, and returns a verdict.

See `../SUNSET_BUILD_SPEC.md` for the full design and `../SUBMISSION.md`
for pitch/demo materials.

## Setup

```
uv venv --python python
uv pip install -e .
```

Put your Daytona API key in `sunset/.env` (gitignored):

```
DAYTONA_API_KEY=your-key-here
```

## Step 0 — prove the sandbox round-trip works

Run this first. Nothing else works until it passes. Also resolves
whether `python:2.7-slim` boots in a Daytona sandbox.

```
.venv\Scripts\python scripts\spike_daytona.py
```

## Run a fixture end to end

```
.venv\Scripts\python -m sunset.cli verify --fixture a
.venv\Scripts\python -m sunset.cli verify --fixture b
.venv\Scripts\python -m sunset.cli verify --fixture c
.venv\Scripts\python -m sunset.cli verify --fixture d
```

If `python:2.7-slim` doesn't boot in your sandbox environment, add
`--legacy-variant py3fallback` to fixture `a` (see plan Step 0, Rung 4 —
the demo thesis is unaffected, only the narration changes).

## Regenerate the sample JSON artifact (no Daytona needed)

Runs fixture A locally via subprocess to produce a real, accurate
`sample_job_result.json` for Forge to build the UI against:

```
.venv\Scripts\python scripts\gen_sample_artifact.py
```

## Fixtures

| Key | Scenario | Expected verdict |
|---|---|---|
| `a` | Dropped `%.2f` formatting | Fails attempt 1, green light attempt 2 |
| `b` | Clean integer-math port | Green light attempt 1 |
| `c` | Three distinct wrong candidates | Escalated after 3 attempts |
| `d` | Unseeded random + wall clock | Unverifiable (determinism pre-check) |
