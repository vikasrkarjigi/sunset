/**
 * Committed mock AnyResult collections for verdict derivation tests.
 *
 * Covers: all-pass, some-failed, timeout/unverifiable, all-error,
 * partial-unavailable, all-fail, and empty scenarios.
 */

import type { AnyResult, NormalizedResult, InvalidResult } from '../types/evidence'

function makeValid(
  id: string,
  verdict: 'green_light' | 'escalated' | 'unverifiable',
  attemptCount = 1,
): NormalizedResult {
  return {
    id,
    title: `Fixture ${id}`,
    subtitle: `Subtitle for ${id}`,
    verdict,
    legacyOutput: 'line\n',
    candidateOutput: 'line\n',
    attemptCount,
    isValid: true,
  }
}

function makeInvalid(
  id: string,
  errorMessage = 'Fixture could not be parsed.',
): InvalidResult {
  return {
    id,
    title: `Invalid ${id}`,
    subtitle: '',
    isValid: false,
    errorMessage,
  }
}

/** All four results are green_light — outcome: all_pass */
export const ALL_PASS_RESULTS: readonly AnyResult[] = [
  makeValid('r1', 'green_light'),
  makeValid('r2', 'green_light'),
  makeValid('r3', 'green_light'),
  makeValid('r4', 'green_light'),
]

/** Mix of green_light and escalated — outcome: mixed */
export const SOME_FAILED_RESULTS: readonly AnyResult[] = [
  makeValid('r1', 'green_light'),
  makeValid('r2', 'green_light'),
  makeValid('r3', 'escalated'),
]

/** Mix of green_light and unverifiable — outcome: mixed */
export const TIMEOUT_RESULTS: readonly AnyResult[] = [
  makeValid('r1', 'green_light'),
  makeValid('r2', 'unverifiable', 2),
]

/** All valid results are escalated/unverifiable, no green_light — outcome: all_fail */
export const ALL_FAIL_RESULTS: readonly AnyResult[] = [
  makeValid('r1', 'escalated'),
  makeValid('r2', 'escalated'),
  makeValid('r3', 'unverifiable'),
]

/** All results are invalid — outcome: no_valid */
export const ALL_ERROR_RESULTS: readonly AnyResult[] = [
  makeInvalid('r1', 'Sandbox returned a non-zero exit code.'),
  makeInvalid('r2', 'Fixture JSON was malformed.'),
  makeInvalid('r3', 'Fixture could not be parsed.'),
]

/** Some valid (green_light), some invalid — outcome: mixed */
export const PARTIAL_UNAVAILABLE_RESULTS: readonly AnyResult[] = [
  makeValid('r1', 'green_light'),
  makeValid('r2', 'green_light'),
  makeInvalid('r3'),
  makeInvalid('r4'),
]

/** Single valid pass — outcome: all_pass */
export const SINGLE_PASS_RESULTS: readonly AnyResult[] = [
  makeValid('r1', 'green_light'),
]

/** Empty collection — outcome: no_valid */
export const EMPTY_RESULTS: readonly AnyResult[] = []
