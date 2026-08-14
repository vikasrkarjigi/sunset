/**
 * Sunset fixture inventory.
 *
 * IMPORTANT — evidence integrity rule:
 *   Only real, reviewed Daytona sandbox verification results may be listed here.
 *   Placeholder, fabricated, or stub fixtures are PROHIBITED.
 *   Exactly four entries are expected. Tests will fail if the count changes.
 *
 * Naming convention:
 *   Files are numbered 01–04 to give deterministic import order and to match
 *   the presenter narration sequence. Do not re-order without updating demo
 *   narration scripts and downstream tests.
 *
 * Adding a new fixture:
 *   1. Obtain a reviewed Daytona JSON result (no secrets, no PII).
 *   2. Add the file as `NN-result.json` in this directory.
 *   3. Add a static import and an entry to FIXTURE_INVENTORY below.
 *   4. Update EXPECTED_FIXTURE_COUNT.
 */

// Static ES-module imports — Vite bundles these as JSON modules at build time.
// No runtime fetch, no backend dependency.
import result01 from './01-result.json'
import result02 from './02-result.json'
import result03 from './03-result.json'
import result04 from './04-result.json'

/** A single fixture entry as held in the inventory. */
export interface FixtureEntry {
  /** Two-digit numeric prefix matching the file name (e.g. "01"). Stable across builds. */
  readonly id: string
  /** Display-safe title for result cards and presenter context. */
  readonly title: string
  /** One-line subtitle describing the verification outcome narrative arc. */
  readonly subtitle: string
  /** Full narrator sentence for the demo walkthrough. */
  readonly narrative: string
  /** Raw JSON fixture object as bundled by Vite. Typed `unknown` — downstream validation owns the schema. */
  readonly raw: unknown
}

/**
 * Ordered inventory of exactly four real Daytona verification fixtures.
 *
 * Ordering follows the demo arc:
 *   01 — fails attempt 1, converges on attempt 2  (shows the repair loop working)
 *   02 — clean pass on attempt 1                  (happy path)
 *   03 — escalated after 3 attempts               (shows honest escalation)
 *   04 — unverifiable before the repair loop      (shows determinism guard)
 */
export const FIXTURE_INVENTORY: readonly FixtureEntry[] = [
  {
    id: '01',
    title: 'Invoice Reconciliation',
    subtitle: 'Fails attempt 1, converges on attempt 2',
    narrative:
      'Naive Python 3 port dropped the legacy %.2f formatting. Sunset caught it, ' +
      'fed the exact diverging rows back, and attempt 2 matched exactly.',
    raw: result01,
  },
  {
    id: '02',
    title: 'Inventory Export',
    subtitle: 'Clean pass on attempt 1',
    narrative:
      'Straightforward integer-only port. Green light immediately — the fast happy path.',
    raw: result02,
  },
  {
    id: '03',
    title: 'Audit Log Summarizer',
    subtitle: 'Escalated after 3 attempts',
    narrative:
      'Three distinct rewrite attempts, each wrong in a different way. Sunset refuses to ' +
      'claim false success and escalates to a human with the full divergence history.',
    raw: result03,
  },
  {
    id: '04',
    title: 'Session Logger',
    subtitle: 'Unverifiable — caught before the repair loop',
    narrative:
      'Unseeded random + wall clock. The original script disagrees with itself across two ' +
      'runs, so Sunset flags it unverifiable instead of running a meaningless diff.',
    raw: result04,
  },
] as const

/**
 * The authoritative fixture count. Tests assert FIXTURE_INVENTORY.length equals this.
 * Change it only when a real reviewed fixture is added or removed.
 */
export const EXPECTED_FIXTURE_COUNT = 4 as const
