# Sunset

**A legacy script modernization agent that proves its own work.**

Built for the SF Enterprise Hackathon (Aug 14, 2026) on **Forge** (development + UI) and **Daytona** (isolated execution). Track: Legacy Modernization.

> The rewrite is not the product. The proof is the product.

---

## 1. The problem

Every large enterprise has hundreds of undocumented legacy scripts still running something important — invoice reconciliation, payroll adjustments, nightly exports. Everyone agrees they should be modernized. Nobody touches them, because **nobody can prove the rewrite behaves identically**. If it's subtly wrong — a float rounds differently, an integer division changes — the failure surfaces weeks later in a financial report, and whoever approved the change owns it. Legacy technical debt consumes roughly 40% of enterprise IT budgets as a direct result of this stalemate.

## 2. What Sunset does

Sunset runs the **original** script and a **candidate rewrite** side by side, in two fresh isolated sandboxes, against identical inputs — then diffs every byte of output. It never just trusts a rewrite; it verifies one.

```
legacy script + candidate rewrite + input data
                    │
                    ▼
     determinism pre-check: run the ORIGINAL against itself
     (if it can't agree with itself, it's not verifiable — stop here)
                    │
                    ▼
     for attempt in 1..3:
         run legacy vs candidate in a FRESH sandbox pair
         diff every line of output
         empty diff?  → GREEN LIGHT, done
         diverged?    → format the exact divergence (row, values,
                         implicated line) and feed it into the next
                         attempt
                    │
                    ▼
     exhausted 3 attempts → ESCALATE to a human with the full
                             divergence history, rather than
                             claiming false success
```

Three verdicts, not two: **green light**, **escalated**, or **unverifiable** (the script disagreed with itself before a rewrite was even involved — caught before wasting a repair attempt on noise).

## 3. Why Daytona — structurally, not decoratively

You cannot safely run untrusted legacy code and untrusted AI-generated code on the same host. And a valid behavioral comparison requires two **clean, identical, disposable** environments run in parallel — not two runs on a machine that's accumulating state between them. That's exactly what Daytona sandboxes are for.

Concretely, in this build:
- Every verification attempt provisions **two fresh sandboxes** (legacy runtime + modern runtime), runs both in parallel via `AsyncDaytona` + `asyncio.gather`, and destroys both in a `finally` block — confirmed zero leaked sandboxes across ~34 created during testing.
- The legacy side runs on an actual `python:2.7-slim` image — real Python 2, not a simulation — confirmed to boot correctly in a Daytona sandbox (this was the single biggest technical risk in the build; see §6).
- `process.exec()`'s merged-stream limitation (no separate stderr) is worked around by redirecting to files inside the sandbox and downloading them back as bytes — giving byte-exact, separated stdout/stderr/exit-code for the differ.

**There is no way to do this safely on a laptop.** That sentence is meant to be said out loud during the demo.

## 4. Why Forge — the presentation layer, built the way the platform intends

Forge does not touch the verification logic — that's real, already-working Python that talks to real Daytona sandboxes. What was missing was a face for it: nobody but a terminal could see a result, and the submission requires a hosted, judge-facing URL.

Forge built that face through its actual product pipeline — Intent → PRD-Spec → Architecture → Epics → Work Orders → Batch Coding Agent — rather than a raw prompt-to-app shortcut. That process surfaced and got corrected mid-build (see §6): the architecture initially defaulted to full enterprise CI/CD (multi-environment promotion, five security scanners, formal accessibility audits, a five-person comprehension study) before being explicitly scoped down to a same-day, 1-2 hour ship. The UI consumes the **real, live-validated** JSON results in `forge_data/` — no placeholder or fabricated evidence anywhere in the demo.

## 5. Repository structure

```
.
├── HACKATHON_REFERENCE.md      Event rules, judging rubric, timeline
├── SUNSET_BUILD_SPEC.md        Original design spec for this project
├── SUBMISSION.md               Team details, pitch script, demo arc, submission checklist
├── FORGE_PROMPTS.md            Copy-paste prompt pack used to drive the Forge build
│
├── forge_data/                 Real verification results, bundled for the Forge UI
│   ├── manifest.json             Fixture titles/descriptions for the UI cards
│   ├── green_light_after_repair.json   Fixture A: fails attempt 1, passes attempt 2
│   ├── clean_pass.json                 Fixture B: passes attempt 1
│   ├── escalated.json                  Fixture C: fails all 3 attempts, escalates
│   ├── unverifiable.json               Fixture D: caught by the determinism pre-check
│   └── sunset_data_bundle.md     Same 5 files combined into one .md (Forge's upload
│                                  widget doesn't accept .json — see decision log)
│
└── sunset/                     The verification engine — the actual product logic
    ├── sunset/                   Python package
    │   ├── runner.py               Provisions/executes/tears down sandbox pairs
    │   ├── normalize.py            Defuses false divergences (timestamps, paths, UUIDs)
    │   ├── differ.py                Compares two runs, classifies what diverged
    │   ├── feedback.py             Turns a divergence into precise repair-loop context
    │   ├── verify.py                The verdict loop: pre-check + 3-attempt repair
    │   ├── rewriter.py             CannedRewriter / Rewriter protocol (see §6)
    │   ├── fixtures.py             Fixture manifest (images, scripts, candidates)
    │   ├── artifact.py             Serializes a JobResult to the frozen JSON contract
    │   └── cli.py                    `python -m sunset.cli verify --fixture {a,b,c,d}`
    ├── fixtures/                  The four demo scripts (see §7)
    ├── scripts/
    │   ├── spike_daytona.py        Step 0 hard-gate proof of life (sandbox round-trip)
    │   └── gen_sample_artifact.py  Generates a sample JobResult without touching Daytona
    ├── job_result_{a,b,c,d}.json  Real output from live runs against Daytona
    ├── sample_job_result.json    Same shape, generated locally for early Forge handoff
    ├── pyproject.toml
    └── README.md                  Engine-specific setup/run instructions
```

The Forge-generated frontend lands in this same GitHub repository via Forge's connected coding agent (see the batch/commit history) or is deployed to a Forge-hosted URL — check `SUBMISSION.md` for whichever is live.

## 6. Key decisions, and why

This section exists because a repo full of code doesn't explain *why* it looks the way it does. These are the calls that shaped the build, in the order they mattered.

| Decision | What we did | Why |
|---|---|---|
| **Rewrite generator** | `CannedRewriter` returns pre-written candidates in sequence, behind a `Rewriter` protocol | No LLM API key was available for this build. Rather than fake it, the interface is the honest seam — a live generator (Forge's own engine has no public runtime API; confirmed by research) drops in later without changing `verify.py`. This also makes the demo 100% deterministic, which directly serves the 40%-weighted "Working Prototype" criterion. |
| **Exec pattern** | Redirect stdout/stderr/exit-code to files inside the sandbox, download as bytes — not Daytona sessions | `process.exec()`'s `ExecuteResponse` has no separate stderr field (confirmed against the installed SDK, not assumed from docs). Sessions expose separated streams but bring WebSocket lifecycle management with a documented footgun (blocking callbacks kill the connection) — not worth the risk under time pressure. |
| **Concurrency model** | `AsyncDaytona` + `asyncio.gather`, one shared client | The SDK's own docs state each client opens a single shared WebSocket connection for all its sandboxes — thread-safety of the sync client is undocumented. Async is the documented, proven path (used at 500-sandbox scale in Daytona's own RL training guide). |
| **Python 2 image** | `python:2.7-slim`, tested first, before any engine code was written | This was the single highest-risk unknown (Daytona injects an agent into every sandbox; nothing documents its constraints on old/unusual images). Resolved in the first 15 minutes of building: it boots fine. A Rung 4 fallback (legacy-style Python 3 vs. modern Python 3) was designed but never needed. |
| **Forge UI data path** | Static, pre-computed JSON bundled into the frontend — not a live call from the browser to a running Daytona-backed API | A live backend is a genuine stretch goal (see `FORGE_PROMPTS.md` Prompt 3), but it adds cross-origin auth/CORS complexity and live-network dependency during a judged demo — exactly what `HACKATHON_REFERENCE.md` calls out as a point-losing pattern. The static path has zero external failure modes on stage and is not a compromise; it's the deliberately safer default recommended by the build spec itself. |
| **Architecture scope cut** | Forge's Architecture stage initially generated a full enterprise CI/CD pipeline (3 environments, 5 security scanners, JFrog, Terraform, WCAG audit, 5-person comprehension study) — this was explicitly identified and cut back to a single-environment, 5-step same-day pipeline | The platform's default template assumes a production SDLC regardless of stated scope. Left unchecked, this would have generated Work Orders for infrastructure nobody needed instead of the actual UI. Caught and corrected before Task generation, not after. |
| **Work order scope, under real time pressure** | Trimmed from 27 generated stories down to a 5-story irreducible core (SPA shell, fixtures, 2 result cards, verdict banner, side-by-side diff) as the clock ran out | Cards + verdict + diff are the product a judge actually looks at. Everything else (formal test-coverage targets, keyboard-nav polish, animated phase timeline, feedback-log panel, attempt-detail panel) was real and designed, but cut in the order the build spec's own fallback ladder prescribes when time runs short — never cutting the evidence or the verdict. |
| **`.json` not accepted by Forge's upload widget** | Bundled all fixture + manifest data into one `.md` file (`forge_data/sunset_data_bundle.md`) with fenced JSON blocks | Forge's file upload only accepts `.txt/.md/.docx/.pptx/.pdf/.xlsx/.ipynb/.html/images/code`. One clearly-labeled markdown file turned out cleaner than five separate uploads anyway. |

## 7. The four demo fixtures

Each one is a deliberately engineered, real Python script pair — not a toy example — chosen to make a specific point:

| Fixture | Scenario | Verdict | What it proves |
|---|---|---|---|
| **A — invoice reconciliation** | Naive Python 2→3 port drops `%.2f` formatting; a second candidate preserves it | Fails attempt 1 (7 of 20 rows diverge — dropped trailing zeros, a raw floating-point precision artifact), **green light** attempt 2 | The repair loop reads a real divergence and produces a real fix, not a retry with a different random seed |
| **B — inventory export** | Straightforward integer-only port | **Green light**, attempt 1 | The fast, unglamorous happy path — most modernizations should look like this |
| **C — audit log summarizer** | Three candidates, each wrong in a genuinely different way (banker's rounding, off-by-one denominator, wrong metric entirely) | **Escalated** after 3 attempts | Sunset refuses to claim false success when it can't converge |
| **D — session logger** | Unseeded `random` + wall-clock time | **Unverifiable**, caught before the repair loop starts | The tool knows the limits of its own method — it won't burn attempts "fixing" a script that was never deterministic to begin with |

All four verdicts were confirmed **live**, against real Daytona sandboxes, not simulated. Fixture A was rerun three times with bit-identical results — the stability bar a live demo actually needs.

## 8. Running it

```bash
cd sunset
uv venv --python python
uv pip install -e .
# put DAYTONA_API_KEY=... in sunset/.env (gitignored)

.venv\Scripts\python scripts\spike_daytona.py        # Step 0 hard gate
.venv\Scripts\python -m sunset.cli verify --fixture a  # run any of a/b/c/d
```

Full details in `sunset/README.md`.

## 9. Rubric alignment

| Criterion | Weight | Where it's satisfied |
|---|---|---|
| **Working Prototype** | 40% | Fully deterministic engine, live-validated against real Daytona sandboxes, rerun for stability. §7. |
| **Built on Forge & Daytona** | 30% | Daytona: §3, structurally load-bearing, not a one-off import. Forge: §4, the entire UI was generated through Forge's real spec-to-code pipeline, iterated and corrected live (§6). |
| **Impact** | 20% | Turns legacy modernization from a decision nobody wants to own into a verifiable, auditable pipeline. Full framing in `SUBMISSION.md`. |
| **Presentation** | 10% | Demo arc, pitch script, and backup video shot list in `SUBMISSION.md`. |

## 10. Team

**Ship It And Pray** — Uday Venkatesha, Vikas Ravikumar Karjigi, Tyshawn Hill.
