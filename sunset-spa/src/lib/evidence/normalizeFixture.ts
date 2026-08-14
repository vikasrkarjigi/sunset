import type { FixtureEntry } from '../../assets/fixtures/fixtureInventory'
import type {
  AnyResult,
  NormalizedResult,
  RawAttempt,
  RawDivergenceRow,
  RawFixture,
  Verdict,
} from '../../types/evidence'

const VALID_VERDICTS = new Set<string>(['green_light', 'escalated', 'unverifiable'])

function isRawFixture(value: unknown): value is RawFixture {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v['verdict'] === 'string' &&
    typeof v['fixture_name'] === 'string' &&
    typeof v['determinism_check_passed'] === 'boolean' &&
    Array.isArray(v['attempts'])
  )
}

function isRawAttempt(value: unknown): value is RawAttempt {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v['attempt'] === 'number' &&
    typeof v['legacy'] === 'object' && v['legacy'] !== null &&
    typeof v['candidate'] === 'object' && v['candidate'] !== null
  )
}

function stdoutFromRun(run: unknown): string | null {
  if (typeof run !== 'object' || run === null) return null
  const s = (run as Record<string, unknown>)['stdout']
  return typeof s === 'string' && s !== '' ? s : null
}

function extractOutputs(
  raw: RawFixture,
): { legacyOutput: string | null; candidateOutput: string | null } {
  // For unverifiable: the sandbox runs are empty because the determinism pre-check
  // compared two runs of the same script. Show divergence rows to illustrate.
  if (raw.verdict === 'unverifiable') {
    const attempt = raw.attempts[0]
    if (attempt === undefined || !isRawAttempt(attempt)) {
      return { legacyOutput: null, candidateOutput: null }
    }
    const rows = attempt.divergence?.rows ?? []
    if (rows.length > 0) {
      const legacyOutput = (rows as readonly RawDivergenceRow[])
        .map((r) => r.legacy_value)
        .join('\n')
      const candidateOutput = (rows as readonly RawDivergenceRow[])
        .map((r) => r.rewrite_value)
        .join('\n')
      return { legacyOutput, candidateOutput }
    }
    return { legacyOutput: null, candidateOutput: null }
  }

  // For all other verdicts: use the final attempt's sandbox stdout
  const lastAttempt = raw.attempts[raw.attempts.length - 1]
  if (lastAttempt === undefined || !isRawAttempt(lastAttempt)) {
    return { legacyOutput: null, candidateOutput: null }
  }

  return {
    legacyOutput: stdoutFromRun(lastAttempt.legacy),
    candidateOutput: stdoutFromRun(lastAttempt.candidate),
  }
}

/** Convert a raw fixture inventory entry into a normalized result view model. */
export function normalizeFixture(entry: FixtureEntry): AnyResult {
  const raw = entry.raw

  if (!isRawFixture(raw)) {
    return {
      id: entry.id,
      title: entry.title,
      subtitle: entry.subtitle,
      isValid: false,
      errorMessage: 'Fixture data has an unexpected structure.',
    }
  }

  if (!VALID_VERDICTS.has(raw.verdict)) {
    return {
      id: entry.id,
      title: entry.title,
      subtitle: entry.subtitle,
      isValid: false,
      errorMessage: `Unrecognised verdict: ${raw.verdict}`,
    }
  }

  const { legacyOutput, candidateOutput } = extractOutputs(raw)

  const result: NormalizedResult = {
    id: entry.id,
    title: entry.title,
    subtitle: entry.subtitle,
    verdict: raw.verdict as Verdict,
    legacyOutput,
    candidateOutput,
    attemptCount: raw.attempts.length,
    isValid: true,
  }

  return result
}

/** Normalize all fixture entries in order. */
export function normalizeAllFixtures(
  fixtures: readonly FixtureEntry[],
): AnyResult[] {
  return fixtures.map(normalizeFixture)
}
