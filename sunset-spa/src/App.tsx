import { useState } from 'react'
import { FIXTURE_INVENTORY } from './assets/fixtures/fixtureInventory'
import { normalizeAllFixtures } from './lib/evidence/normalizeFixture'
import { OutputDiffPanel } from './components/evidence/OutputDiffPanel'
import type { AnyResult, NormalizedResult } from './types/evidence'
import './styles.css'

// Normalize at module load — fixtures are static, never change at runtime.
const RESULTS: AnyResult[] = normalizeAllFixtures(FIXTURE_INVENTORY)

const VERDICT_LABELS: Record<string, string> = {
  green_light: 'Green Light',
  escalated: 'Escalated',
  unverifiable: 'Unverifiable',
}

// ── result card ───────────────────────────────────────────────────────────────

interface ResultCardProps {
  readonly result: AnyResult
  readonly isSelected: boolean
  readonly onSelect: () => void
}

function ResultCard({ result, isSelected, onSelect }: ResultCardProps) {
  const verdictClass = result.isValid
    ? `result-card--${result.verdict}`
    : 'result-card--invalid'
  const verdictLabel = result.isValid
    ? (VERDICT_LABELS[result.verdict] ?? result.verdict)
    : 'Invalid'

  return (
    <li className="result-card-item">
      <button
        className={`result-card${isSelected ? ' result-card--selected' : ''} ${verdictClass}`}
        onClick={onSelect}
        aria-pressed={isSelected}
        aria-label={`Select ${result.title}`}
        data-testid={`result-card-${result.id}`}
      >
        <span className="result-card-title">{result.title}</span>
        <span className="result-card-subtitle">{result.subtitle}</span>
        <span className={`result-card-verdict verdict--${result.isValid ? result.verdict : 'invalid'}`}>
          {verdictLabel}
        </span>
      </button>
    </li>
  )
}

// ── evidence detail ───────────────────────────────────────────────────────────

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
        <section className="results-section" aria-label="Verification results">
          <h2 className="results-heading">Verification Results</h2>
          <ul
            className="result-card-list"
            role="list"
            aria-label="Result cards"
          >
            {RESULTS.map((result) => (
              <ResultCard
                key={result.id}
                result={result}
                isSelected={result.id === selectedId}
                onSelect={() => {
                  setSelectedId(result.id)
                }}
              />
            ))}
          </ul>
        </section>

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
