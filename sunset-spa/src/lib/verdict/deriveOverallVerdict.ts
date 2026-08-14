import type { AnyResult } from '../../types/evidence'

export type AggregateOutcome = 'all_pass' | 'mixed' | 'all_fail' | 'no_valid'

export interface VerdictCounts {
  readonly pass: number
  readonly escalated: number
  readonly unverifiable: number
  readonly invalid: number
  readonly total: number
}

export interface AggregateVerdict {
  readonly outcome: AggregateOutcome
  readonly headline: string
  readonly supportingText: string
  readonly counts: VerdictCounts
}

const HEADLINES: Record<AggregateOutcome, string> = {
  all_pass: 'All verifications passed',
  mixed: 'Mixed results — review required',
  all_fail: 'Verification failed',
  no_valid: 'No valid results available',
}

function buildSupportingText(
  counts: VerdictCounts,
  outcome: AggregateOutcome,
): string {
  if (outcome === 'no_valid') {
    if (counts.total === 0) return 'No verification results were loaded.'
    const n = counts.invalid
    return `${n} fixture${n !== 1 ? 's' : ''} could not be parsed.`
  }

  const parts: string[] = []
  if (counts.pass > 0) parts.push(`${counts.pass} passed`)
  if (counts.escalated > 0) parts.push(`${counts.escalated} escalated for review`)
  if (counts.unverifiable > 0) parts.push(`${counts.unverifiable} unverifiable`)
  if (counts.invalid > 0) parts.push(`${counts.invalid} errored`)
  return parts.join(', ') + '.'
}

/**
 * Derives an aggregate verdict from a collection of AnyResult entries.
 *
 * Pure function — no side effects, deterministic output. Safe to call with
 * empty or all-invalid collections; always returns a well-formed model.
 */
export function deriveOverallVerdict(results: readonly AnyResult[]): AggregateVerdict {
  const acc = { pass: 0, escalated: 0, unverifiable: 0, invalid: 0 }

  for (const r of results) {
    if (!r.isValid) {
      acc.invalid++
      continue
    }
    if (r.verdict === 'green_light') acc.pass++
    else if (r.verdict === 'escalated') acc.escalated++
    else if (r.verdict === 'unverifiable') acc.unverifiable++
  }

  const counts: VerdictCounts = { ...acc, total: results.length }
  const validCount = counts.pass + counts.escalated + counts.unverifiable

  let outcome: AggregateOutcome
  if (validCount === 0) {
    outcome = 'no_valid'
  } else if (counts.pass === validCount) {
    outcome = 'all_pass'
  } else if (counts.pass === 0) {
    outcome = 'all_fail'
  } else {
    outcome = 'mixed'
  }

  return {
    outcome,
    headline: HEADLINES[outcome],
    supportingText: buildSupportingText(counts, outcome),
    counts,
  }
}
