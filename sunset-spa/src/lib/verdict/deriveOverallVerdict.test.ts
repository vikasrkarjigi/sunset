import { describe, it, expect } from 'vitest'
import { deriveOverallVerdict } from './deriveOverallVerdict'
import {
  ALL_PASS_RESULTS,
  SOME_FAILED_RESULTS,
  TIMEOUT_RESULTS,
  ALL_FAIL_RESULTS,
  ALL_ERROR_RESULTS,
  PARTIAL_UNAVAILABLE_RESULTS,
  SINGLE_PASS_RESULTS,
  EMPTY_RESULTS,
} from '../../test-fixtures/mockAggregateVerdicts'

// ── outcome derivation ────────────────────────────────────────────────────────

describe('deriveOverallVerdict — outcome', () => {
  it('returns all_pass when all valid results are green_light', () => {
    expect(deriveOverallVerdict(ALL_PASS_RESULTS).outcome).toBe('all_pass')
  })

  it('returns all_pass for a single green_light result', () => {
    expect(deriveOverallVerdict(SINGLE_PASS_RESULTS).outcome).toBe('all_pass')
  })

  it('returns mixed when some results pass and one escalates', () => {
    expect(deriveOverallVerdict(SOME_FAILED_RESULTS).outcome).toBe('mixed')
  })

  it('returns mixed when some pass and one is unverifiable (timeout)', () => {
    expect(deriveOverallVerdict(TIMEOUT_RESULTS).outcome).toBe('mixed')
  })

  it('returns mixed when some valid pass alongside invalid (partial-unavailable)', () => {
    expect(deriveOverallVerdict(PARTIAL_UNAVAILABLE_RESULTS).outcome).toBe('mixed')
  })

  it('returns all_fail when all valid results are escalated or unverifiable', () => {
    expect(deriveOverallVerdict(ALL_FAIL_RESULTS).outcome).toBe('all_fail')
  })

  it('returns no_valid when all results are invalid (error scenario)', () => {
    expect(deriveOverallVerdict(ALL_ERROR_RESULTS).outcome).toBe('no_valid')
  })

  it('returns no_valid for an empty collection', () => {
    expect(deriveOverallVerdict(EMPTY_RESULTS).outcome).toBe('no_valid')
  })
})

// ── counts ────────────────────────────────────────────────────────────────────

describe('deriveOverallVerdict — counts', () => {
  it('counts four green_light results correctly', () => {
    const { counts } = deriveOverallVerdict(ALL_PASS_RESULTS)
    expect(counts).toEqual({ pass: 4, escalated: 0, unverifiable: 0, invalid: 0, total: 4 })
  })

  it('counts mixed results correctly', () => {
    const { counts } = deriveOverallVerdict(SOME_FAILED_RESULTS)
    expect(counts).toEqual({ pass: 2, escalated: 1, unverifiable: 0, invalid: 0, total: 3 })
  })

  it('counts timeout (unverifiable) results correctly', () => {
    const { counts } = deriveOverallVerdict(TIMEOUT_RESULTS)
    expect(counts).toEqual({ pass: 1, escalated: 0, unverifiable: 1, invalid: 0, total: 2 })
  })

  it('counts all-error invalid results correctly', () => {
    const { counts } = deriveOverallVerdict(ALL_ERROR_RESULTS)
    expect(counts).toEqual({ pass: 0, escalated: 0, unverifiable: 0, invalid: 3, total: 3 })
  })

  it('counts partial-unavailable results correctly', () => {
    const { counts } = deriveOverallVerdict(PARTIAL_UNAVAILABLE_RESULTS)
    expect(counts).toEqual({ pass: 2, escalated: 0, unverifiable: 0, invalid: 2, total: 4 })
  })

  it('returns zero total for an empty collection', () => {
    const { counts } = deriveOverallVerdict(EMPTY_RESULTS)
    expect(counts.total).toBe(0)
    expect(counts.pass).toBe(0)
    expect(counts.invalid).toBe(0)
  })
})

// ── headlines ─────────────────────────────────────────────────────────────────

describe('deriveOverallVerdict — headline', () => {
  it('sets headline "All verifications passed" for all_pass', () => {
    expect(deriveOverallVerdict(ALL_PASS_RESULTS).headline).toBe(
      'All verifications passed',
    )
  })

  it('sets headline "Mixed results — review required" for mixed', () => {
    expect(deriveOverallVerdict(SOME_FAILED_RESULTS).headline).toBe(
      'Mixed results — review required',
    )
  })

  it('sets headline "Verification failed" for all_fail', () => {
    expect(deriveOverallVerdict(ALL_FAIL_RESULTS).headline).toBe(
      'Verification failed',
    )
  })

  it('sets headline "No valid results available" for no_valid', () => {
    expect(deriveOverallVerdict(ALL_ERROR_RESULTS).headline).toBe(
      'No valid results available',
    )
  })

  it('sets no-valid headline for empty collection', () => {
    expect(deriveOverallVerdict(EMPTY_RESULTS).headline).toBe(
      'No valid results available',
    )
  })
})

// ── supporting text ───────────────────────────────────────────────────────────

describe('deriveOverallVerdict — supportingText', () => {
  it('includes pass count for all-pass', () => {
    const { supportingText } = deriveOverallVerdict(ALL_PASS_RESULTS)
    expect(supportingText).toContain('4 passed')
  })

  it('includes pass and escalated counts for mixed', () => {
    const { supportingText } = deriveOverallVerdict(SOME_FAILED_RESULTS)
    expect(supportingText).toContain('2 passed')
    expect(supportingText).toContain('escalated for review')
  })

  it('includes unverifiable count for timeout scenario', () => {
    const { supportingText } = deriveOverallVerdict(TIMEOUT_RESULTS)
    expect(supportingText).toContain('unverifiable')
  })

  it('mentions error count for partial-unavailable', () => {
    const { supportingText } = deriveOverallVerdict(PARTIAL_UNAVAILABLE_RESULTS)
    expect(supportingText).toContain('errored')
  })

  it('reports loaded-fixture count for all-error', () => {
    const { supportingText } = deriveOverallVerdict(ALL_ERROR_RESULTS)
    expect(supportingText).toContain('3 fixtures could not be parsed')
  })

  it('says no results were loaded for empty collection', () => {
    const { supportingText } = deriveOverallVerdict(EMPTY_RESULTS)
    expect(supportingText).toBe('No verification results were loaded.')
  })
})

// ── edge cases ────────────────────────────────────────────────────────────────

describe('deriveOverallVerdict — edge cases', () => {
  it('does not throw for an empty array', () => {
    expect(() => deriveOverallVerdict([])).not.toThrow()
  })

  it('handles a single invalid result gracefully', () => {
    const result = deriveOverallVerdict([
      { id: 'x', title: 'X', subtitle: '', isValid: false, errorMessage: 'oops' },
    ])
    expect(result.outcome).toBe('no_valid')
    expect(result.counts.invalid).toBe(1)
    expect(result.counts.total).toBe(1)
  })

  it('singular "fixture" phrasing for one invalid result', () => {
    const result = deriveOverallVerdict([
      { id: 'x', title: 'X', subtitle: '', isValid: false, errorMessage: 'oops' },
    ])
    expect(result.supportingText).toContain('1 fixture could not be parsed')
  })
})
