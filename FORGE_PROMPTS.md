# Forge Prompt Pack

Copy-paste these into `hackathon.softwareforge.ai` in order. Each is
written against the **real, live-validated** JSON schema Sunset's
engine actually produces — not a guess. Keep this file open in a tab;
save screenshots of the iteration cycle as you go (judges may ask for
evidence of real Forge usage — 30% of the score).

**Before you start:** upload the `forge_data/` folder (4 result files +
`manifest.json`) as static assets/reference data in your Forge project.
Everything below assumes those files are available to fetch client-side.

---

## Prompt 1 — Scaffold the app

```
Build a single-page web app called "Sunset" for a hackathon demo. It
visualizes the result of a legacy-code modernization verification
pipeline. There is no live backend yet -- render pre-computed JSON
result files that are already bundled as static assets.

DATA SHAPE (this is the real, frozen schema -- match field names exactly):

{
  "verdict": "green_light" | "escalated" | "unverifiable",
  "fixture_name": string,
  "legacy_image": string,       // e.g. "python:2.7-slim"
  "modern_image": string,       // e.g. "python:3.12-slim"
  "determinism_check_passed": boolean,
  "attempts": [
    {
      "attempt": number,        // 0 = determinism pre-check, 1+ = repair attempts
      "candidate_script": string,   // full source of the rewrite tried this attempt
      "legacy": { "stdout": string, "stderr": string, "exit_code": number,
                  "files": object, "duration_ms": number, "sandbox_id": string },
      "candidate": { "stdout": string, "stderr": string, "exit_code": number,
                      "files": object, "duration_ms": number, "sandbox_id": string },
      "divergence": {
        "kind": "none" | "exit_code" | "line_count" | "numeric_formatting" | "content",
        "rows": [ { "line_no": number, "legacy_value": string, "rewrite_value": string } ],
        "total_diverging": number,
        "total_compared": number,
        "exit_code_legacy": number | null,
        "exit_code_rewrite": number | null
      },
      "feedback": string   // human-readable divergence report, already formatted, render as monospace
    }
  ],
  "final_candidate": string | null   // the winning rewrite, only set on green_light
}

There are 4 bundled result files, described in manifest.json:
  forge_data/green_light_after_repair.json  -- fails attempt 1, passes attempt 2
  forge_data/clean_pass.json                -- passes attempt 1 immediately
  forge_data/escalated.json                 -- fails all 3 attempts, escalates
  forge_data/unverifiable.json              -- caught by determinism pre-check, never
                                                enters the repair loop (attempts[0]
                                                has attempt=0 and represents the
                                                self-comparison, not a real rewrite attempt)

UI REQUIREMENTS, one screen:

1. A row of 4 fixture cards at the top, using manifest.json's title/
   subtitle/narrative. Clicking a card loads that fixture's JSON and
   runs the visualization below.

2. A "Run Verification" button that, once a fixture is selected,
   animates through phases before revealing the result -- this should
   feel like watching real sandboxes spin up, not an instant flip:
     "Provisioning sandboxes..." (~600ms)
     "Running determinism pre-check..." (~500ms)
     if determinism_check_passed is false: jump straight to the
       UNVERIFIABLE verdict, do not show attempt phases
     otherwise, for each attempt in order:
       "Attempt N: running legacy vs candidate..." (~500ms)
       then reveal that attempt's diff (see #4)
       if it diverged: "Attempt N diverged -- feeding structured
         feedback into next attempt..." (~400ms) before moving on
       if it matched: stop here, go straight to the verdict banner

3. A verdict banner, large and unmissable:
     green_light   -> green, "GREEN LIGHT -- safe to ship"
     escalated     -> red, "ESCALATED -- could not converge, human review required"
     unverifiable  -> amber/yellow, "UNVERIFIABLE -- original script is non-deterministic"

4. For each attempt, a collapsible section showing:
   - Two side-by-side monospace panes: legacy.stdout vs candidate.stdout,
     both split into lines. Highlight (red background) any line whose
     line number (1-indexed) appears in divergence.rows[].line_no.
     Lines that match should look calm/neutral, not highlighted.
   - Below the panes, render `feedback` verbatim in a monospace block
     styled like a terminal/log excerpt (dark background, light text).
   - A small metadata strip: exit codes (legacy vs candidate), duration_ms
     for each side, and a "diverging rows: X of Y" counter pulled from
     divergence.total_diverging / total_compared.

5. An "attempt history" strip/timeline at the bottom once all attempts
   have run, showing attempt number -> outcome (diverged/matched) as a
   compact sequence of dots or chips, so at a glance you can see
   "fail -> pass" or "fail -> fail -> fail -> escalated".

6. Dark, technical aesthetic -- monospace for all code/output, a
   restrained color palette (this is an enterprise dev tool, not a
   consumer app). No placeholder lorem ipsum anywhere -- use the real
   bundled data.

Do not build a backend yet. Everything reads from the bundled static
JSON files client-side.
```

---

## Prompt 2 — Iterate (paste after reviewing Prompt 1's output)

Adjust based on what actually comes back — this is a starting point,
not a fixed script:

```
A few refinements:

1. On the fixture card for "escalated", show a small badge like
   "3/3 attempts failed" using attempts.length -- don't hardcode 3.

2. In the side-by-side diff view, when divergence.kind is
   "numeric_formatting", add a small inline label next to the diff
   explaining "values are numerically equal, string formatting differs"
   -- this is the single most important thing for a judge watching the
   demo to understand at a glance.

3. Add a copy-to-clipboard button on each attempt's candidate_script.

4. Set the page title and favicon to "Sunset".

5. Make sure the verdict banner and the phase animation both work
   correctly when re-running a different fixture after one has already
   completed -- full reset each time "Run Verification" is clicked.
```

---

## Prompt 3 — Optional: live backend (only if time remains)

Skip this unless the static demo is fully working with time to spare.
The static version is not a fallback to feel bad about — the plan's
own recommendation is to build this path *first*, deliberately, because
it has zero external failure modes on stage. A live backend is a
stretch goal, not a requirement.

If you want it: the Sunset engine already has a CLI
(`python -m sunset.cli verify --fixture a`) that produces this exact
JSON. Ask me (Claude) to wrap it in a small FastAPI server and deploy
it inside a Daytona sandbox with a public preview URL — that keeps
Daytona load-bearing for the backend too, not just the verification
engine, which only strengthens the "built on Daytona" story. Say the
word and I'll build and deploy it; it's maybe 20-30 minutes of work
and I can do it without touching Forge.

---

## What to say when judges ask "why Forge, why Daytona"

Already drafted in `SUBMISSION.md` — the pitch script and the specific
one-sentence answer for "why did you need Daytona" are there, tuned to
be honest about what's live (the verification engine, fully) vs.
canned (the rewrite candidates, since no LLM key was available for
this build).
