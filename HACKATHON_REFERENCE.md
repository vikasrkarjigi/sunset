# SF Enterprise Hackathon — Complete Reference

**This supersedes any earlier RocketRide/Linkup material. The platforms for this event are Forge and Daytona.**

---

## 1. Logistics

| | |
|---|---|
| **Event** | SF Enterprise Hackathon |
| **Date** | Friday, August 14, 2026 |
| **Venue** | AWS Builder Loft, San Francisco, CA |
| **Format** | One-day build sprint |
| **Eligibility** | Open to all participants — individually or in teams of **up to 4** |
| **Platforms** | SoftwareForge.ai (Forge) + Daytona |
| **Support** | On-site mentor table for all Forge and Daytona questions |

### Time note

Source materials list both a 5:30 PM and a 7:00 PM end time. **Plan against 5:30 PM** and confirm the actual demo start time with organizers first thing in the morning. A 90-minute swing changes your scope significantly.

---

## 2. Theme

Enterprises run on software that is slow to build, harder to maintain, and even harder to modernize. This hackathon is about showing what is possible when you build with Forge and run/test on Daytona — going from idea to working, deployed prototype in a single day, using AI-assisted development and secure, disposable dev environments.

Every team builds their project using:
- **Forge** as the core AI development platform
- **Daytona** as the environment/execution layer where the project is built, tested, and run

The goal: pick a real enterprise problem, and use Forge + Daytona together to design, build, run, and ship a working prototype that solves it.

---

## 3. The platforms

### 3a. SoftwareForge.ai (Forge)

An AI-powered software development platform for full-stack delivery. Instead of writing every line by hand, you describe what you want to build and Forge generates, iterates, and refines working code — frontend, backend, and integrations.

**Access:** `https://hackathon.softwareforge.ai/`

**Background worth knowing for your pitch:** Forge is an Opsera product, launched April 2026, positioned as an "intent and context-aware Software Factory" that turns raw intent into governed, spec-based development. Its own marketing states legacy technical debt consumes roughly 40% of enterprise IT budgets. The platform includes Connectors, an MCP Catalog, A2A Agents, a Skills Registry, and a Prompts Registry.

**How to use it:**
- **Rapid generation** — scaffold components, APIs, and business logic with Forge's AI engines
- **Iterative refinement** — prompt, tweak, and iterate on generated code to fit complex enterprise requirements
- **Full-stack execution** — both frontend interface and backend service logic must run through the platform

**Note:** account approval may be pending on first signup. Do this before the event if at all possible.

### 3b. Daytona

Secure, elastic infrastructure for running code — including AI-generated code — in isolated, disposable sandboxes that spin up in milliseconds (roughly 90–200ms). Each sandbox is a full composable computer with its own kernel, filesystem, network stack, vCPU, RAM, and disk.

**Access:** `https://www.daytona.io/`
**Docs:** `daytona.io/docs`
**GitHub:** `github.com/daytonaio/daytona`
**SDKs:** Python (`daytona_sdk`), TypeScript (`@daytona/sdk`). MCP server and LangChain integration available.

Where Forge is where you *generate and iterate* on your application, Daytona is where you *run, test, and validate* it in a clean, standardized, reproducible environment — without local setup, dependency drift, or "works on my machine" issues.

**Suggested use cases from the organizers:**

- **Instant, standardized environments** — spin up a fresh sandbox for your team instead of configuring laptops. Everyone works in an identical pre-configured environment, cutting setup friction to near zero on a time-boxed day.
- **Safe execution of AI-generated code** — run and test Forge-generated code inside an isolated sandbox rather than on your host machine.
- **Parallel experimentation** — spin up multiple sandboxes to try different architectural approaches side-by-side, and discard the ones that fail with no cleanup overhead.
- **Reproducible demos** — use a Daytona snapshot of your working environment as your live demo environment, so what judges see matches exactly what you built.
- **Backend/integration testing sandbox** — test enterprise integrations (APIs, webhooks, data connectors) without risking a shared or production-like environment.
- **Agent/automation workflows** — if your project includes an AI agent that writes, executes, or tests its own code, use Daytona sandboxes as the secure runtime the agent operates in. Explicitly called out as a natural fit for the Workflow Automation and Internal Tools tracks.

---

## 4. Judging criteria — read this before choosing an idea

| Category | Weight | Focus |
|---|---|---|
| **Working Prototype** | **40%** | Does the application run end-to-end and actually solve the target problem? |
| **Built on Forge & Daytona** | **30%** | Real, substantial use of Forge for development and Daytona for running/testing throughout the build — **not a one-off import**. |
| **Impact** | **20%** | How much friction, time, or cost this would realistically save in an enterprise setting. |
| **Presentation** | **10%** | Clarity of the live demo and how well the problem and solution are communicated. |

### What the weights actually tell you

**40% Working Prototype is the largest single block.** It rewards *finishing*, not ambition. Anything with fragile inputs — live audio, flaky third-party APIs, real-time streams — puts this at risk. Choose something deterministic that you can rehearse identically ten times.

**30% "not a one-off import" is the trap most teams will fall into.** The obvious approach is to build a normal app in Forge, then spin up a Daytona sandbox at the end so you can say you used it. Judges have explicitly signalled they will look for meaningful usage throughout the build. The counter-strategy: **pick an idea where Daytona is structurally impossible to remove** — where the product literally cannot function without disposable isolated execution. Then this 30% is free while others are padding it.

**Explicit organizer note on judging:** "Teams are expected to build their entire submission using Forge for development and Daytona for running/testing/deploying it — not just prototype an idea or write documentation. Judges will specifically look for real, meaningful usage of both platforms throughout the build."

---

## 5. Tracks

| Track | Description | Target impact |
|---|---|---|
| **Internal Tools & Dashboards** | Custom administrative portals, live operational dashboards, or triage tools that remove daily workflow bottlenecks | Saves operational time, increases data visibility |
| **Legacy Modernization** | Re-architected and modernized versions of outdated, clunky, or monolithic internal systems | Reduces technical debt, improves user experience |
| **Workflow Automation** | End-to-end automated solutions replacing repetitive, manual cross-department tasks or data entry | Minimizes human error, speeds up execution loops |
| **Departmental Productivity** | Specialized collaboration tools for specific team functions (HR, Legal, Ops, Finance) | Removes functional silos, speeds up team handoffs |

You may choose from, remix, or bring your own concept across these tracks.

---

## 6. Reference architecture

The standard pipeline the organizers say winning projects will follow:

```
Describe system requirements to Forge
        |
        v
Iterate frontend and backend code on-platform
        |
        v
Spin up a Daytona sandbox to run and test the generated build
        |
        v
Connect enterprise integrations and validate them inside the sandbox
        |
        v
Deploy the functional end-to-end prototype to users,
using the Daytona environment as the reproducible base for the live demo
```

---

## 7. Submission requirements

- **Working prototype link** — hosted URL built on Forge and run/verified in a Daytona sandbox
- **Demo** — short live demonstration or 2–3 minute video walkthrough, ideally shown running from your Daytona environment
- **Team details** — team name and individual member info
- **Problem overview** — brief explanation of the problem selected and its enterprise value

---

## 8. Setup checklist — do these before the event starts

- [ ] Create a Forge account and confirm platform access: `https://hackathon.softwareforge.ai/`
- [ ] Create a Daytona account and confirm you can spin up a sandbox: `https://www.daytona.io/`
- [ ] Form your team (up to 4 people) or register as an individual
- [ ] Brainstorm target enterprise pain points so you can begin building immediately
- [ ] **Use Daytona to set up your project's development/execution environment before you start building in Forge**, so your first generated build has somewhere to run

That last item is the organizers' own instruction and it is good advice: Daytona comes first, not last.

---

## 9. Things that lose points

1. **Daytona used only at the end as a deployment target.** This is the single most likely way to lose the 30%. Build it into the core loop.
2. **An unfinished prototype.** 40% of your score. Scope down early and ruthlessly.
3. **Breadth instead of depth.** Supporting three languages or five integrations adds zero rubric points and risks the 40%. Do one thing that fully works.
4. **A demo that depends on live wifi or an external API.** Venue networks fail. Have a recorded backup.
5. **Leaving submission materials to the last minute.** Team details, problem overview, and the hosted link take longer than you think.
6. **A demo that only shows the happy path.** Showing your tool correctly catch a failure is more convincing than a wall of green checkmarks.

---

## 10. Suggested day-of timeline

Working backwards from a 5:30 PM end. Adjust if organizers confirm 7:00 PM.

| Time | Focus |
|---|---|
| 9:30 – 10:00 | Arrive, confirm demo time, find the mentor table, confirm Forge account approval |
| 10:00 – 10:45 | **Daytona first.** Get a sandbox spinning up and executing code via the SDK. Nothing else works until this does. |
| 10:45 – 12:30 | Core engine — the part of your product that genuinely requires sandboxes. Prove it standalone before any UI. |
| 12:30 – 1:00 | Lunch, talk to mentors, sanity-check your approach with them |
| 1:00 – 3:00 | Build the full-stack app in Forge around the working engine |
| 3:00 – 3:45 | Integration, hardening, edge cases |
| 3:45 – 4:15 | **Submission materials.** Hosted link, team details, problem overview. Do this regardless of build state. |
| 4:15 – 4:45 | Record backup demo video from the Daytona environment |
| 4:45 – 5:00 | Rehearse the live pitch out loud, twice |
| 5:00+ | Demos |

**Hard rule:** submission materials get finished at 3:45 PM whether or not the build feels done. A submitted working-enough project beats a better project that missed the form.

---

## 11. Pitch structure for the demo (10% of score, cheap to win)

You will likely have 2–3 minutes. Structure it:

1. **The problem, in one sentence, with a number attached.** ("Legacy scripts consume roughly 40% of enterprise IT budgets and nobody touches them because nobody can prove a rewrite is safe.")
2. **The live demo.** Show it working. Show it catching a real failure, not just succeeding.
3. **Why Forge and Daytona were necessary**, in one sentence each. Judges are scoring this at 30% — say it out loud, do not make them infer it.
4. **The impact claim.** Time or cost saved, concretely.

Do not spend your limited minutes on architecture diagrams. Show the thing running.
