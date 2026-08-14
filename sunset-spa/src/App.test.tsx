import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

/**
 * App integration tests.
 *
 * These tests verify the full application shell:
 *   - Structural landmarks (banner, main, contentinfo)
 *   - Branded title and tagline
 *   - Result card list rendered from real fixtures
 *   - Evidence detail panel updating on card selection (AC-4)
 */

describe('App shell structure', () => {
  it('renders the Sunset branded title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sunset')
  })

  it('renders the product tagline', () => {
    render(<App />)
    expect(screen.getByText(/Legacy Modernization Verifier/i)).toBeInTheDocument()
  })

  it('renders an accessible banner landmark', () => {
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders an accessible main landmark', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders an accessible contentinfo landmark', () => {
    render(<App />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})

describe('App result card list', () => {
  it('renders exactly four result cards from the real fixture inventory', () => {
    render(<App />)
    const cards = screen.getAllByRole('button', { name: /Select/i })
    expect(cards).toHaveLength(4)
  })

  it('renders the Invoice Reconciliation card', () => {
    render(<App />)
    expect(screen.getByText('Invoice Reconciliation')).toBeInTheDocument()
  })

  it('renders the Inventory Export card', () => {
    render(<App />)
    expect(screen.getByText('Inventory Export')).toBeInTheDocument()
  })

  it('renders the Audit Log Summarizer card', () => {
    render(<App />)
    expect(screen.getByText('Audit Log Summarizer')).toBeInTheDocument()
  })

  it('renders the Session Logger card', () => {
    render(<App />)
    expect(screen.getByText('Session Logger')).toBeInTheDocument()
  })
})

describe('App evidence detail — initial state', () => {
  it('shows evidence detail for the first result on load', () => {
    render(<App />)
    expect(screen.getByTestId('evidence-detail')).toBeInTheDocument()
  })

  it('shows a diff panel for the first result on load', () => {
    render(<App />)
    // The diff panel region or table should be present
    const detail = screen.getByTestId('evidence-detail')
    expect(within(detail).getByText('Legacy output')).toBeInTheDocument()
    expect(within(detail).getByText('Candidate output')).toBeInTheDocument()
  })
})

describe('App evidence detail — result selection (AC-4)', () => {
  it('marks the first card as selected initially', () => {
    render(<App />)
    const firstCard = screen.getByTestId('result-card-01')
    expect(firstCard).toHaveAttribute('aria-pressed', 'true')
  })

  it('updates the evidence detail title when a different card is selected', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Click the Inventory Export card (fixture 02)
    await user.click(screen.getByTestId('result-card-02'))

    const detail = screen.getByTestId('evidence-detail')
    expect(within(detail).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Inventory Export',
    )
  })

  it('shows diff content specific to the selected result', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Select Invoice Reconciliation (01) — has changed lines (float formatting)
    await user.click(screen.getByTestId('result-card-01'))
    const detail = screen.getByTestId('evidence-detail')
    // The diff table should be present
    expect(within(detail).getByRole('table')).toBeInTheDocument()
  })

  it('updates aria-pressed when switching selection', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByTestId('result-card-03'))

    expect(screen.getByTestId('result-card-03')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('result-card-01')).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows the Escalated verdict badge after selecting result 03', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByTestId('result-card-03'))

    const detail = screen.getByTestId('evidence-detail')
    expect(within(detail).getByText('Escalated')).toBeInTheDocument()
  })
})
