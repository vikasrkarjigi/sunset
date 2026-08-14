import type { AnyResult } from '../../types/evidence'
import { toCardViewModel } from '../../types/results'
import { deriveOverallVerdict } from '../../lib/verdict/deriveOverallVerdict'
import { VerdictBanner } from '../verdict/VerdictBanner'
import { ResultCardGrid } from '../results/ResultCardGrid'

interface DashboardShellProps {
  readonly results: readonly AnyResult[]
  readonly selectedId: string | null
  readonly onSelect: (id: string) => void
}

/**
 * Main dashboard area: verdict banner above the result card grid.
 *
 * Derives the aggregate verdict and card view models from the same normalized
 * result collection. No state is held here — App owns selection state.
 */
export function DashboardShell({
  results,
  selectedId,
  onSelect,
}: DashboardShellProps) {
  const verdict = deriveOverallVerdict(results)
  const cardModels = results.map(toCardViewModel)

  return (
    <section
      className="dashboard-shell"
      aria-label="Verification dashboard"
      data-testid="dashboard-shell"
    >
      <VerdictBanner verdict={verdict} />
      <ResultCardGrid
        results={cardModels}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </section>
  )
}
