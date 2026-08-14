# Sunset — Build Spec

**A legacy script modernization agent that proves its own work.**

Event: SF Enterprise Hackathon, Aug 14 2026, AWS Builder Loft SF
Track: Legacy Modernization
Platforms: Forge (development) + Daytona (execution/testing)

---

## 1. The problem statement

Use this framing in the submission's "Problem Overview" field.

Every large enterprise has hundreds of undocumented legacy scripts still running something important — a 2014 Python 2 batch job that reconciles invoices, a payroll adjustment script nobody has touched since its author left, a nightly data export held together with string formatting from a decade ago.

Everyone agrees they should be modernized. Nobody touches them.

The reason is not that rewriting is hard. In 2026, AI rewrites a 200-line script in seconds. **The reason is that nobody can prove the rewrite behaves identically.** If the modernized version is subtly wrong — a float rounds differently, an integer division changes, a dict iterates in a new order — the failure surfaces weeks later in a financial report, and the person who approved the change owns it. So the rational move for any individual engineer is to leave it alone. The debt compounds for a decade.

Opsera's own research (Forge's parent company) puts legacy technical debt at roughly 40% of enterprise IT budgets.

**Sunset removes the blocker.** It does not just modernize a script — it *proves* the modernization is behaviourally identical by running the old and new versions side by side in isolated sandboxes against the same inputs and diffing every output. When they diverge, it feeds the exact divergence back to the generator, repairs the code, and re-tests — up to three attempts. If it still cannot achieve equivalence, it escalates to a human with a full report of every divergence rather than claiming false success.

The rewrite is not the product. **The proof is the product.**

---

## 2. Why this wins on the rubric

| Criterion | Weight | How Sunset scores |
|---|---|---|
| **Working Prototype** | 40% | Fully deterministic. Scripts in, outputs out. No live audio, no external APIs, no network dependency. The exact demo can be rehearsed ten times with identical results. |
| **Built on Forge & Daytona** | 30% | **Daytona is structurally impossible to remove.** You cannot run untrusted legacy code plus untrusted AI-generated code on the same host safely, and valid comparison requires two clean identical environments in parallel. Remove Daytona and the product ceases to exist. Forge is not just build-time — its generation engine is called repeatedly *at runtime* inside the repair loop with structured failure context. |
| **Impact** | 20% | "AI rewrites your legacy script" is a commodity claim in 2026. "AI rewrites it, tests it, fixes its own bugs, and escalates when it cannot" is an autonomous modernization pipeline with a governance story — which is exactly Forge's own enterprise positioning. |
| **Presentation** | 10% | Narrative arc, not a static result screen: rewrite → fails → agent reads the diff → repairs itself → passes. Judges remember the moment the tool catches a real bug. |

### The one-sentence answer to "why did you need Daytona?"

*"We run two versions of untrusted code in parallel against identical inputs and diff the results — that requires isolated, disposable, identical environments, spun up fresh for every one of up to six test runs per modernization job. There is no way to do that on a laptop."*

Say this out loud during the demo. 30% of the score depends on the judges hearing it, not inferring it.

---

## 3. Architecture

```
Upload legacy script + sample input data
        |
        v
+-----------------------------------------------+
|  Forge-built app (UI + backend + AI engine)   |
|                                                |
|  [Forge rewrite — attempt n of 3]              |
|        |                                       |
|        v                                       |
|  Fresh pair of Daytona sandboxes               |
|    Sandbox A: original script, legacy runtime  |
|    Sandbox B: rewritten script, modern runtime |
|    (identical inputs, run in parallel)         |
|        |                                       |
|        v                                       |
|  [Differential comparison]                     |
|    stdout, output files, exit codes            |
|    row-level data diff                         |
|        |                                       |
|    +---+---------------+                       |
|    |                   |                       |
|  identical         divergent                   |
|    |                   |                       |
|    v                   v                       |
|  GREEN LIGHT      n < 3? --> feed structured   |
|  safe to ship       |         diff back to     |
|                     |         Forge rewrite    |
|                   n = 3?                       |
|                     |                          |
|                     v                          |
|              ESCALATE TO HUMAN                 |
|              full divergence report            |
+-----------------------------------------------+
```

---

## 4. The self-correcting loop — core logic

This is the heart of the product. Everything else is scaffolding.

```
attempt = 1
history = []

while attempt <= 3:
    rewritten = forge_rewrite(original_script, failure_context=history)

    sandbox_a = daytona.create()   # fresh, legacy runtime
    sandbox_b = daytona.create()   # fresh, modern runtime

    result_a = run(sandbox_a, original_script, test_inputs)
    result_b = run(sandbox_b, rewritten, test_inputs)

    sandbox_a.destroy()
    sandbox_b.destroy()

    diff = compare(normalize(result_a), normalize(result_b))

    if diff.is_empty():
        return GREEN_LIGHT(rewritten, attempts=attempt)

    history.append(structured_failure_context(diff, attempt))
    attempt += 1

return ESCALATE(original_script, history)
```

**Sandboxes must be fresh on every attempt.** Reusing them contaminates state from the previous run and invalidates the comparison. This is also a genuine selling point — disposability is the feature, not an inconvenience.

---

## 5. The two traps that will break this

### Trap 1: False divergences

If the legacy script touches `datetime.now()`, `random`, UUIDs, network calls, absolute file paths, or unordered dict/set iteration, the two runs will **never** match. The agent will burn all three attempts "fixing" code that was already correct, and your demo dies.

**This is the single most likely thing to break your build. Handle it in the first hour.**

Mitigations, in order of preference:

1. **Pick deterministic demo scripts by construction.** Simplest and safest. Pure computation on fixed input data.
2. **Normalize before diffing:**
   - Strip or mask timestamps with a regex
   - Sort output lines where order is not semantically meaningful
   - Mask absolute paths (`/home/user/...` → `<PATH>`)
   - Seed randomness identically in both sandboxes
3. **Detect and warn.** If the *original script run twice in two sandboxes* does not match itself, the script is non-deterministic — report that to the user as an unverifiable input rather than entering the repair loop. This is a genuinely impressive touch if you have time: it means your tool knows the limits of its own method.

### Trap 2: Unstructured feedback

Sending Forge "the outputs did not match" produces a random second guess, not a smarter one. The loop only works if attempt 2 knows precisely what attempt 1 got wrong.

**Bad feedback:**
```
The rewrite failed. Try again.
```

**Good feedback:**
```
Attempt 1 diverged from the legacy behaviour.

Divergence type: numeric formatting
Input row 47:
  legacy output:  1042.50
  rewrite output: 1042.5
Exit codes: legacy 0, rewrite 0
Implicated legacy line: print("%.2f" % total)
Implicated rewrite line: print(total)

Total diverging rows: 12 of 200. All are numeric formatting.
Preserve the legacy formatting behaviour exactly.
```

Build the structured-context formatter as a real function. It is what makes the loop intelligent rather than a retry with a different random seed.

---

## 6. Build order

Follow this sequence. Each step de-risks the next. Do not skip ahead.

### Step 1 — Daytona first (target: 45 min)

The organizers' own checklist says to set up Daytona before building in Forge. Follow it.

- Install the SDK (`pip install daytona_sdk` or `npm i @daytona/sdk`)
- Create a sandbox, upload a trivial Python file, execute it, capture stdout and exit code, destroy the sandbox
- **Do not proceed until this works.** Everything depends on it.

### Step 2 — Parallel dual-sandbox execution (target: 45 min)

- Spin up two sandboxes simultaneously
- Run two *different* scripts against the *same* input file
- Capture stdout, any written output files, and exit codes from both
- Confirm you can reliably tell "identical" from "different"

This is your core engine. Prove it standalone in a plain script before any UI exists.

### Step 3 — Diff and normalization (target: 30 min)

- Start dumb: string-compare stdout and exit codes
- Add normalization (timestamps, paths, sorting)
- Add the self-determinism check from Trap 1 if time allows
- Upgrade to row-level structured data diff only if the core is solid

### Step 4 — Forge app around the engine (target: 2 hrs)

Build the full-stack application in Forge:
- Upload page — legacy script + sample input file
- Run button, with visible progress through attempts
- Side-by-side output view
- Verdict banner: green light / escalated
- Attempt history showing what changed between iterations

**Use Forge for real here** — describe the components, iterate on the generated code. This is the 30% criterion. Keep evidence of your prompt-and-refine cycles for the demo.

### Step 5 — The repair loop (target: 1 hr)

- Wire the structured feedback formatter
- Cap at 3 attempts
- Green light and escalation paths both fully rendered

**Sequencing tip:** for steps 3–4, hardcode a pre-written "modern version" of your demo script rather than calling live generation. Build the entire verification flow against a known-good and a known-bad rewrite, then swap in live Forge generation last. This means a generation failure never blocks your core demo.

### Step 6 — Demo prep (target: 45 min)

See section 8.

---

## 7. Scope guards

**Support exactly one language.** Python 2 → Python 3 is the cleanest story, has abundant real legacy examples, and has well-known subtle breakage (integer division, `print`, string/bytes, dict ordering) that makes the repair loop shine.

**Resist all of these:**
- Multiple source languages (VBA, shell, Java)
- Git integration / PR creation
- User accounts and auth
- Persistent history across sessions
- Multi-file projects — single script only

None add rubric points. All threaten the 40%.

**If you are running behind, cut in this order:**
1. Row-level data diff (fall back to stdout string compare)
2. Live Forge generation (fall back to pre-written rewrite — the *verification* is the product, and it still demos)
3. The 3-attempt loop (fall back to single-pass verify — still a complete, coherent product)
4. UI polish

The irreducible core is: **two sandboxes, same input, diff the output, show a verdict.** Protect that above everything.

---

## 8. Demo strategy

### Prepare two scripts

**Script A — the trap.** A legacy script where the AI rewrite plausibly introduces a subtle bug. Good candidates:
- `%.2f` formatting dropped → `1042.50` becomes `1042.5`
- Python 2 `/` integer division → Python 3 true division
- Dict iteration order assumptions
- `round()` banker's-rounding differences

**Script B — the clean pass.** A straightforward modernization that succeeds on the first attempt.

### The demo arc

1. Run Script A. Show attempt 1 **failing** — the diff highlighted, the exact divergence visible.
2. Show the agent reading that diff and regenerating with the failure context.
3. Show attempt 2 passing. Green light.
4. Run Script B for the fast happy path.
5. If time permits, show the escalation path with a script that never converges — proving the tool refuses to claim false success.

**Showing a failure caught is more persuasive than a wall of green checkmarks.** It proves the verification is real rather than theatre. Most teams will only demo their happy path.

### Critical risk

If the AI nails the rewrite on attempt 1 every time, your best feature stays invisible. **Verify before the demo that Script A actually fails on attempt 1.** Tune the script until it reliably does.

### Backup

Record a full working run from your Daytona environment by 4:15 PM. Venue wifi fails. The submission requirements explicitly allow a 2–3 minute video walkthrough.

---

## 9. Pitch script (2–3 minutes)

> "Every enterprise has hundreds of legacy scripts still running payroll, reconciliation, nightly exports. Opsera's own research puts legacy debt at 40% of IT budgets. AI can rewrite any of these in seconds — that stopped being the hard part. The hard part is that nobody can *prove* the rewrite behaves identically, and if it's subtly wrong, someone finds out six weeks later in a financial report. So nobody touches them.
>
> Sunset modernizes the script, then proves it. [DEMO: upload, run] We run the original and the rewrite in two isolated Daytona sandboxes against identical inputs and diff every output. Attempt one diverged — here, row 47, the rewrite dropped two-decimal formatting. Sunset feeds that exact divergence back to Forge, regenerates, and re-tests in a fresh pair of sandboxes. Attempt two: behaviourally identical. Green light.
>
> If it can't converge in three attempts, it escalates to a human with the full divergence report rather than claiming false success.
>
> We needed Daytona because running two versions of untrusted code in parallel requires isolated, disposable, identical environments — up to six fresh sandboxes per job. There's no way to do that on a laptop. We built the entire application in Forge, and Forge's generation engine runs *inside* our repair loop, not just at build time.
>
> This turns legacy modernization from a decision nobody wants to own into a verifiable, auditable pipeline."

---

## 10. Submission checklist

- [ ] **Working prototype link** — hosted URL, built on Forge, verified running in a Daytona sandbox
- [ ] **Demo** — live demonstration ready, plus a 2–3 minute backup video recorded from the Daytona environment
- [ ] **Team details** — team name, all member info
- [ ] **Problem overview** — use section 1 of this document, condensed
- [ ] Script A verified to fail on attempt 1 and pass on attempt 2
- [ ] Script B verified to pass cleanly
- [ ] Escalation path tested at least once
- [ ] The "why we needed Daytona" sentence rehearsed out loud
- [ ] Evidence of Forge prompt-and-iterate cycles available if judges ask

**Hard deadline: submission materials done by 3:45 PM regardless of build state.**

---

## 11. Naming

"Sunset" — as in sunsetting legacy systems. Short, memorable, enterprise-appropriate, and it fits the modernization narrative. Alternatives if it is taken: *Parity*, *Twin Run*, *Equivalence*.

---

## 12. Support during the event

- **On-site mentor table** — all Forge and Daytona questions, per the organizers
- **Daytona docs** — `daytona.io/docs`
- **Daytona GitHub** — `github.com/daytonaio/daytona`
- **Forge** — `hackathon.softwareforge.ai`

Ask a mentor early about Daytona sandbox limits (concurrent sandboxes, quotas). Your architecture creates up to six per job, and hitting a cap mid-demo would be avoidable and painful.
