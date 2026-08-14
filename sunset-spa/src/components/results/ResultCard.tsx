import type { CardViewModel } from '../../types/results'
import { STATUS_LABELS } from '../../types/results'

interface ResultCardProps {
  readonly card: CardViewModel
  readonly isSelected: boolean
  readonly onSelect: () => void
}

/**
 * Single verification result card.
 *
 * Renders a <button> with a status badge, title, subtitle, attempt count,
 * and — for invalid cards — a concise user-safe error message.
 *
 * All content derives from CardViewModel; no raw fixture JSON is accessed.
 */
export function ResultCard({ card, isSelected, onSelect }: ResultCardProps) {
  const statusLabel = STATUS_LABELS[card.status]

  return (
    <li className="result-card-item">
      <button
        className={[
          'result-card',
          `result-card--${card.status}`,
          isSelected ? 'result-card--selected' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={onSelect}
        aria-pressed={isSelected}
        aria-label={`Select ${card.title}`}
        data-testid={`result-card-${card.id}`}
      >
        <span className={`result-card-badge verdict--${card.status}`} aria-label={`Status: ${statusLabel}`}>
          {statusLabel}
        </span>
        <span className="result-card-title">{card.title !== '' ? card.title : 'Unnamed result'}</span>
        <span className="result-card-subtitle">
          {card.subtitle !== '' ? card.subtitle : ' '}
        </span>
        {card.attemptSummary !== null && (
          <span className="result-card-meta">{card.attemptSummary}</span>
        )}
        {card.status === 'invalid' && card.errorMessage !== null && (
          <span className="result-card-error" role="alert">
            {card.errorMessage}
          </span>
        )}
      </button>
    </li>
  )
}
