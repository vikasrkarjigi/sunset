import { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardShell } from './DashboardShell'
import { normalizeAllFixtures } from '../../lib/evidence/normalizeFixture'
import { FIXTURE_INVENTORY } from '../../assets/fixtures/fixtureInventory'
import {
  ALL_PASS_RESULTS,
  SOME_FAILED_RESULTS,
  ALL_ERROR_RESULTS,
  EMPTY_RESULTS,
} from '../../test-fixtures/mockAggregateVerdicts'
import type { AnyResult } from '../../types/evidence'

// ── basic structure ───────────────────────────────────────────────────────────

describe('DashboardShell — structure (AC-1)', () => {
  it('renders the verdict banner', () => {
    render(
      <DashboardShell
        results={ALL_PASS_RESULTS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByTestId('verdict-banner')).toBeInTheDocument()
  })

  it('renders the result card grid', () => {
    render(
      <DashboardShell
        results={ALL_PASS_RESULTS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByTestId('result-card-grid')).toBeInTheDocument()
  })

  it('renders a landmark section with label', () => {
    render(
      <DashboardShell
        results={ALL_PASS_RESULTS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(
      screen.getByRole('region', { name: /verification dashboard/i }),
    ).toBeInTheDocument()
  })
})

// ── verdict banner reacts to results (AC-2, AC-5) ─────────────────────────────

describe('DashboardShell — banner reflects result collection (AC-2)', () => {
  it('shows all-pass headline when all results are green_light', () => {
    render(
      <DashboardShell
        results={ALL_PASS_RESULTS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByTestId('verdict-banner-headline')).toHaveTextContent(
      'All verifications passed',
    )
  })

  it('shows mixed headline when some results fail', () => {
    render(
      <DashboardShell
        results={SOME_FAILED_RESULTS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByTestId('verdict-banner-headline')).toHaveTextContent(
      'Mixed results',
    )
  })

  it('shows no-valid headline for all-error collection', () => {
    render(
      <DashboardShell
        results={ALL_ERROR_RESULTS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByTestId('verdict-banner-headline')).toHaveTextContent(
      'No valid results available',
    )
  })

  it('shows no-valid headline for empty collection', () => {
    render(
      <DashboardShell
        results={EMPTY_RESULTS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByTestId('verdict-banner-headline')).toHaveTextContent(
      'No valid results available',
    )
  })
})

// ── integration: banner changes when collection changes (AC-5) ────────────────

function SwitchableShell() {
  const [useAllPass, setUseAllPass] = useState(true)
  const results = useAllPass ? ALL_PASS_RESULTS : SOME_FAILED_RESULTS

  return (
    <div>
      <button
        onClick={() => { setUseAllPass((v) => !v) }}
        data-testid="toggle"
      >
        Toggle results
      </button>
      <DashboardShell results={results} selectedId={null} onSelect={vi.fn()} />
    </div>
  )
}

describe('DashboardShell — banner updates when collection changes (AC-5)', () => {
  it('updates the headline when the result collection is swapped', async () => {
    const user = userEvent.setup()
    render(<SwitchableShell />)

    expect(screen.getByTestId('verdict-banner-headline')).toHaveTextContent(
      'All verifications passed',
    )

    await user.click(screen.getByTestId('toggle'))

    expect(screen.getByTestId('verdict-banner-headline')).toHaveTextContent(
      'Mixed results',
    )
  })

  it('updates count badges when the collection is swapped', async () => {
    const user = userEvent.setup()
    render(<SwitchableShell />)

    // All-pass: should have a pass badge, no escalated badge
    expect(screen.getByTestId('verdict-count-pass')).toBeInTheDocument()
    expect(screen.queryByTestId('verdict-count-escalated')).toBeNull()

    await user.click(screen.getByTestId('toggle'))

    // Mixed: should now have both
    expect(screen.getByTestId('verdict-count-pass')).toBeInTheDocument()
    expect(screen.getByTestId('verdict-count-escalated')).toBeInTheDocument()
  })
})

// ── integration: real fixture pipeline (AC-5) ─────────────────────────────────

describe('DashboardShell — real fixture pipeline integration', () => {
  const REAL_RESULTS = normalizeAllFixtures(FIXTURE_INVENTORY)

  it('renders four result cards from the real fixture inventory', () => {
    render(
      <DashboardShell
        results={REAL_RESULTS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(
      within(screen.getByTestId('result-card-grid')).getAllByRole('listitem'),
    ).toHaveLength(4)
  })

  it('renders a verdict banner derived from the real fixtures', () => {
    render(
      <DashboardShell
        results={REAL_RESULTS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByTestId('verdict-banner')).toBeInTheDocument()
    // Banner headline must be non-empty text
    const headline = screen.getByTestId('verdict-banner-headline').textContent
    expect(headline).not.toBe('')
  })
})

// ── selection wiring ──────────────────────────────────────────────────────────

describe('DashboardShell — selection propagation', () => {
  it('marks the selected card and leaves others unselected', () => {
    const [first] = ALL_PASS_RESULTS
    const selectedId = first !== undefined && first.isValid ? first.id : null
    render(
      <DashboardShell
        results={ALL_PASS_RESULTS}
        selectedId={selectedId}
        onSelect={vi.fn()}
      />,
    )
    const buttons = screen.getAllByRole('button')
    const selectedButton = buttons.find(
      (b) => b.getAttribute('aria-pressed') === 'true',
    )
    expect(selectedButton).toBeTruthy()
  })

  it('calls onSelect with the card id when a card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <DashboardShell
        results={ALL_PASS_RESULTS}
        selectedId={null}
        onSelect={onSelect}
      />,
    )
    const firstButton = screen.getAllByRole('button')[0]!
    await user.click(firstButton)
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(typeof onSelect.mock.calls[0]?.[0]).toBe('string')
  })
})

// ── edge case: all failures do not mask evidence ──────────────────────────────

describe('DashboardShell — failures remain visible (AC-3 constraint)', () => {
  it('does not apply a pass style when results contain escalated entries', () => {
    render(
      <DashboardShell
        results={SOME_FAILED_RESULTS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    const banner = screen.getByTestId('verdict-banner')
    expect(banner.className).not.toContain('verdict-banner--all_pass')
    expect(banner.className).toContain('verdict-banner--mixed')
  })

  it('renders an error card for each invalid result', () => {
    render(
      <DashboardShell
        results={ALL_ERROR_RESULTS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    const alerts = screen.getAllByRole('alert')
    expect(alerts.length).toBe(ALL_ERROR_RESULTS.length)
  })
})
