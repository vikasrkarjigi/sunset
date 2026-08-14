/**
 * Committed mock card view models for unit and integration tests.
 *
 * Covers the five observable card states: pass (green_light), fail (escalated),
 * unverifiable (timeout/non-determinism), error (invalid, known message), and
 * malformed (invalid, fixture could not be parsed at all).
 */

import type { CardViewModel } from '../types/results'

/** Green-light (pass) — single attempt, no divergence. */
export const MOCK_PASS: CardViewModel = {
  id: 'mock-pass',
  title: 'Invoice Reconciler',
  subtitle: 'Legacy matches candidate exactly.',
  status: 'green_light',
  attemptSummary: '1 attempt',
  errorMessage: null,
}

/** Escalated (fail) — outputs differ; human review required. */
export const MOCK_FAIL: CardViewModel = {
  id: 'mock-fail',
  title: 'Audit Log Summarizer',
  subtitle: 'Legacy and candidate outputs diverge.',
  status: 'escalated',
  attemptSummary: '3 attempts',
  errorMessage: null,
}

/** Unverifiable (timeout / non-determinism detected). */
export const MOCK_TIMEOUT: CardViewModel = {
  id: 'mock-timeout',
  title: 'Session Logger',
  subtitle: 'Non-determinism detected in repeated runs.',
  status: 'unverifiable',
  attemptSummary: '2 attempts',
  errorMessage: null,
}

/** Invalid with a known, user-safe error message. */
export const MOCK_ERROR: CardViewModel = {
  id: 'mock-error',
  title: 'Inventory Export',
  subtitle: 'Verification could not complete.',
  status: 'invalid',
  attemptSummary: null,
  errorMessage: 'Sandbox returned a non-zero exit code on every attempt.',
}

/** Invalid because the fixture JSON was malformed / unparseable. */
export const MOCK_MALFORMED: CardViewModel = {
  id: 'mock-malformed',
  title: 'Unknown fixture',
  subtitle: '',
  status: 'invalid',
  attemptSummary: null,
  errorMessage: 'Fixture data could not be parsed.',
}

/** Ordered collection matching the five states: pass, fail, timeout, error, malformed. */
export const ALL_MOCK_CARDS: readonly CardViewModel[] = [
  MOCK_PASS,
  MOCK_FAIL,
  MOCK_TIMEOUT,
  MOCK_ERROR,
  MOCK_MALFORMED,
]
