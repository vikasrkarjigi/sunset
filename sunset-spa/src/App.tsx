/**
 * Sunset SPA — app shell.
 *
 * Provides the minimal accessible layout that downstream fixture
 * loading, result cards, and workflow animation will mount into.
 * No API calls, no authentication, no persistence.
 */
function App() {
  return (
    <div className="app-wrapper">
      <header className="app-header" role="banner">
        <h1 className="app-title">Sunset</h1>
        <p className="app-tagline">Legacy Modernization Verifier</p>
      </header>

      <main className="app-main" role="main">
        <section className="demo-frame" aria-label="Verification demo">
          <p className="demo-framing">
            Modernize legacy scripts with proof of behavioral equivalence.
            Every rewrite is verified in isolated sandboxes before it ships.
          </p>

          <div
            className="loading-region"
            role="status"
            aria-live="polite"
            aria-label="Verification results status"
          >
            <span className="loading-spinner" aria-hidden="true" />
            <span className="loading-label">Loading verification results…</span>
          </div>
        </section>
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
