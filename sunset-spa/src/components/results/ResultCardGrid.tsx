import type { CardViewModel } from '../../types/results'
import { ResultCard } from './ResultCard'
import '../../styles/dashboard.css'

interface ResultCardGridProps {
  /** Ordered array of card view models. The demo expects exactly four entries. */
  readonly results: readonly CardViewModel[]
  /** ID of the currently selected card, or null when nothing is selected. */
  readonly selectedId: string | null
  /** Called with the card ID when the user activates a card. */
  readonly onSelect: (id: string) => void
}

/**
 * Overview grid for the four verification result cards.
 *
 * Renders each entry as a ResultCard inside an accessible list. An invalid
 * fixture entry renders as an error card without blocking the other cards.
 * The grid makes no network requests and uses no persistent state.
 */
export function ResultCardGrid({ results, selectedId, onSelect }: ResultCardGridProps) {
  return (
    <section className="results-section" aria-label="Verification results">
      <h2 className="results-heading">Verification Results</h2>
      <ul
        className="result-card-list"
        role="list"
        aria-label="Result cards"
        data-testid="result-card-grid"
      >
        {results.map((card) => (
          <ResultCard
            key={card.id}
            card={card}
            isSelected={card.id === selectedId}
            onSelect={() => {
              onSelect(card.id)
            }}
          />
        ))}
      </ul>
    </section>
  )
}
