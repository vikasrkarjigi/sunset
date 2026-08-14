# Sunset — Submission Materials

Draft per plan Step 6. Fill in bracketed items, then this is submission-ready.

---

## Team details

- **Team name:** Ship It And Pray
- **Members:**
  - Uday Venkatesha
  - Vikas Ravikumar Karjigi (vikasravikarjigi26@gmail.com)
  - Tyshawn Hill
- **Track:** Legacy Modernization

---

## Problem overview

*(condensed from `SUNSET_BUILD_SPEC.md` §1 — paste directly into the submission form)*

Every large enterprise has hundreds of undocumented legacy scripts still running something important — a 2014 Python 2 batch job that reconciles invoices, a payroll adjustment script nobody has touched since its author left. Everyone agrees they should be modernized. Nobody touches them, because nobody can *prove* the rewrite behaves identically. If the modernized version is subtly wrong — a float rounds differently, an integer division changes — the failure surfaces weeks later in a financial report, and whoever approved the change owns it. So the rational move is to leave it alone. Legacy technical debt consumes roughly 40% of enterprise IT budgets as a result.

**Sunset removes the blocker.** It runs the original and the modernized script side by side in two fresh, isolated Daytona sandboxes against identical inputs, diffs every output, and only returns a green light when they are behaviourally identical. When they diverge, it feeds the exact divergence back into the next rewrite attempt — up to three tries — and escalates to a human with a full divergence report if it still can't converge, rather than claiming false success.

**The rewrite is not the product. The proof is the product.**

---

## Pitch script (2–3 minutes)

Delivery note: the honest version below differs from the build spec's original draft in one place — see the ⚠️ marker. Say it as written; it's a stronger, more defensible claim than the version that implies live runtime generation.

> "Every enterprise has hundreds of legacy scripts still running payroll, reconciliation, nightly exports. Legacy debt eats roughly 40% of enterprise IT budgets. AI can rewrite any of these in seconds — that stopped being the hard part. The hard part is that nobody can *prove* the rewrite behaves identically, and if it's subtly wrong, someone finds out six weeks later in a financial report. So nobody touches them.
>
> Sunset modernizes the script, then proves it. [DEMO: run Script A] We run the original and the rewrite in two isolated Daytona sandboxes against identical inputs and diff every output. Attempt one diverged — here, row 2, the rewrite dropped two-decimal formatting, and further down a raw floating-point precision artifact leaks straight into the output. Sunset feeds that exact divergence back into the next attempt, and re-verifies in a fresh pair of sandboxes. Attempt two: behaviourally identical. Green light.
>
> ⚠️ [The rewrite candidates here were generated in Forge. The verification harness you just watched run is fully live — it provisions real sandboxes, runs both versions, and diffs the output for real. Generation sits behind a pluggable interface, which is exactly where Forge's engine drops in at runtime.]
>
> If it can't converge in three attempts, it escalates to a human with the full divergence report rather than claiming false success. [If time: DEMO escalation on Script C]
>
> We needed Daytona because running two versions of untrusted code in parallel requires isolated, disposable, identical environments — fresh sandboxes for every one of up to eight per job. There's no way to do that safely on a laptop. Forge is where this application and the rewrite candidates were built.
>
> This turns legacy modernization from a decision nobody wants to own into a verifiable, auditable pipeline."

**Rehearse the Daytona sentence out loud, twice** — 30% of the score depends on judges *hearing* it, not inferring it:

> "We run two versions of untrusted code in parallel against identical inputs and diff the results — that requires isolated, disposable, identical environments. There is no way to do that on a laptop."

---

## Demo arc (live)

1. Run **Script A** (invoice reconciliation). Show attempt 1 **failing** — diff highlighted, exact divergent rows visible (row 2: `299.20` vs `299.2`; row 4: `684.80` vs `684.8000000000001`).
2. Show the structured feedback that gets fed to attempt 2 (not just "it failed" — the exact rows, the exact values, the exact fix instruction).
3. Attempt 2: **green light**.
4. Run **Script B** (inventory export) for the fast happy path — passes on attempt 1.
5. *If time permits:* run **Script C** — three distinct wrong candidates, none converge, **escalates** to a human with the full report. Proves the tool refuses to claim false success.
6. *If asked "what about non-deterministic scripts?":* **Script D** — unseeded random + wall clock — caught by the determinism pre-check before it ever enters the repair loop, flagged **unverifiable** instead of silently producing a meaningless diff.

**Showing a caught failure is more persuasive than a wall of green checkmarks.** Most teams will only demo the happy path.

---

## Working prototype link

- **Primary:** [paste the Forge-deployed URL here once the coding agent batch finishes]
- **Backup / evidence of real backend work:** `https://github.com/vikasrkarjigi/sunset` — the actual verification engine (Daytona sandbox orchestration, differ, feedback loop) lives here, fully committed, with real job-result JSON generated from live Daytona runs. If the Forge UI isn't fully ready at submission time, this repo plus a terminal run of `python -m sunset.cli verify --fixture a` is a complete, working, honest prototype on its own.

---

## Backup video — shot list

Record this now if you have not already — everything runs from the terminal, so venue wifi is not a dependency.

1. **[0:00–0:15]** Title card / verbal: problem statement, one sentence with the 40% number.
2. **[0:15–0:45]** Terminal: `python -m sunset.cli verify --fixture a`. Let attempt 1's failure print fully — don't cut away from the red divergence.
3. **[0:45–1:00]** Zoom/highlight on the structured feedback block being generated (screen annotation or verbal callout).
4. **[1:00–1:20]** Attempt 2 completes, green light banner visible.
5. **[1:20–1:35]** Forge UI: same result rendered — side-by-side output, verdict banner, attempt history.
6. **[1:35–1:50]** Say the Daytona sentence directly to camera/mic, not over other action — give it its own beat.
7. **[1:50–2:15]** *(if included)* Script C escalation — full divergence report on screen.
8. **[2:15–2:30]** Close: impact claim + where Forge and Daytona each did the real work.

Keep total runtime at 2–3 minutes. Cut Script C's segment first if running long — the spec's own cut order agrees escalation is the first thing to drop under time pressure, not the core arc.

---

## Submission checklist

- [x] Team details filled in above
- [x] Problem overview — ready to paste, above
- [x] Script A verified to fail attempt 1, pass attempt 2 — **confirmed live against real Daytona sandboxes, rerun 3× with identical results** (`sunset/job_result_a.json`)
- [x] Script B verified to pass cleanly — confirmed live (`sunset/job_result_b.json`)
- [x] Script C escalation path tested — confirmed live (`sunset/job_result_c.json`)
- [x] Script D unverifiable path tested — confirmed live (`sunset/job_result_d.json`)
- [ ] Working prototype link — paste the Forge-deployed URL above once the coding agent batch finishes; GitHub repo is the fallback and is already real
- [ ] Demo — decide live vs. backup video; if recording, follow the shot list below
- [ ] The "why we needed Daytona" sentence rehearsed out loud
- [ ] Evidence of Forge prompt-and-iterate cycles available if judges ask — you already have this: the screenshots from this build session (Intent → PRD-Spec → Architecture → Epics → Work Orders → Batch Coding Agent)

**Your actual deadline is 3:30 PM today. Submit with whatever is live/working at that time — a submitted CLI + GitHub repo beats a better project that missed the form.**
