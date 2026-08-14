import { useState } from 'react'
import { FIXTURE_INVENTORY } from './assets/fixtures/fixtureInventory'
import { normalizeAllFixtures } from './lib/evidence/normalizeFixture'
import { DashboardShell } from './components/dashboard/DashboardShell'
import { OutputDiffPanel } from './components/evidence/OutputDiffPanel'
import type { NormalizedResult } from './types/evidence'
import './styles.css'

// Normalize fixtures once at module load — fixtures are static.
const RESULTS = normalizeAllFixtures(FIXTURE_INVENTORY)

// ── evidence detail ───────────────────────────────────────────────────────────

const VERDICT_LABELS: Record<string, string> = {
  green_light: 'Green Light',
  escalated: 'Escalated',
  unverifiable: 'Unverifiable',
}

interface EvidenceDetailProps {
  readonly result: NormalizedResult
}

function EvidenceDetail({ result }: EvidenceDetailProps) {
  const verdictLabel = VERDICT_LABELS[result.verdict] ?? result.verdict
  return (
    <section
      className="evidence-section"
      aria-label={`Evidence for ${result.title}`}
      data-testid="evidence-detail"
    >
      <div className="evidence-header">
        <h2 className="evidence-title">{result.title}</h2>
        <span className={`verdict-badge verdict-badge--${result.verdict}`}>
          {verdictLabel}
        </span>
      </div>
      <p className="evidence-subtitle">{result.subtitle}</p>
      <p className="evidence-meta">
        {result.attemptCount === 1
          ? '1 attempt'
          : `${result.attemptCount} attempts`}
      </p>
      <OutputDiffPanel result={result} />
    </section>
  )
}

// ── app ───────────────────────────────────────────────────────────────────────

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const first = RESULTS[0]
    if (first === undefined) return null
    return first.isValid ? first.id : null
  })

  const selectedResult =
    RESULTS.find(
      (r): r is NormalizedResult => r.isValid && r.id === selectedId,
    ) ?? null

  return (
    <div className="app-wrapper">
      <header className="app-header" role="banner">
        <h1 className="app-title">Sunset</h1>
        <p className="app-tagline">Legacy Modernization Verifier</p>
      </header>

      <main className="app-main" role="main">
        <DashboardShell
          results={RESULTS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        {selectedResult !== null ? (
          <EvidenceDetail result={selectedResult} />
        ) : (
          <div
            className="loading-region"
            role="status"
            aria-live="polite"
            aria-label="Verification results status"
          >
            <span className="loading-spinner" aria-hidden="true" />
            <span className="loading-label">Select a result to view evidence.</span>
          </div>
        )}
      </main>

      <footer className="app-footer" role="contentinfo">
        <p className="app-footer-copy">
          Sunset — internal demo. Results sourced from pre-computed Daytona sandbox runs.
        </p>
      </footer>
    </div>
  )
}

export default App
