/**
 * Card-layer view models.
 *
 * ResultCard and ResultCardGrid consume CardViewModel only.
 * They never import from evidence.ts or touch raw fixture JSON.
 */

import type { AnyResult } from './evidence'

/** Status values for result cards — superset of Verdict plus 'invalid'. */
export type CardStatus = 'green_light' | 'escalated' | 'unverifiable' | 'invalid'

/** Human-readable labels for each card status. */
export const STATUS_LABELS: Record<CardStatus, string> = {
  green_light: 'Green Light',
  escalated: 'Escalated',
  unverifiable: 'Unverifiable',
  invalid: 'Invalid',
}

/** Presentation-layer view model for a single result card. */
export interface CardViewModel {
  /** Stable identifier — matches the fixture inventory id. */
  readonly id: string
  /** Display-safe title for the card heading. */
  readonly title: string
  /** One-line outcome description shown below the title. */
  readonly subtitle: string
  /** Verification outcome status driving badge colour and card class. */
  readonly status: CardStatus
  /** Formatted attempt count, e.g. "2 attempts". Null for invalid cards. */
  readonly attemptSummary: string | null
  /** User-safe error description. Non-null only when status is 'invalid'. */
  readonly errorMessage: string | null
}

function attemptLabel(count: number): string {
  return count === 1 ? '1 attempt' : `${count} attempts`
}

/** Convert any normalized or invalid result into a card view model. */
export function toCardViewModel(result: AnyResult): CardViewModel {
  if (!result.isValid) {
    return {
      id: result.id,
      title: result.title,
      subtitle: result.subtitle,
      status: 'invalid',
      attemptSummary: null,
      errorMessage: result.errorMessage,
    }
  }
  return {
    id: result.id,
    title: result.title,
    subtitle: result.subtitle,
    status: result.verdict,
    attemptSummary: attemptLabel(result.attemptCount),
    errorMessage: null,
  }
}
