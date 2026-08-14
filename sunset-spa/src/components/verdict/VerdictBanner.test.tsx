import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VerdictBanner } from './VerdictBanner'
import { deriveOverallVerdict } from '../../lib/verdict/deriveOverallVerdict'
import {
  ALL_PASS_RESULTS,
  SOME_FAILED_RESULTS,
  TIMEOUT_RESULTS,
  ALL_FAIL_RESULTS,
  ALL_ERROR_RESULTS,
  PARTIAL_UNAVAILABLE_RESULTS,
  EMPTY_RESULTS,
} from '../../test-fixtures/mockAggregateVerdicts'
import type { AggregateVerdict } from '../../lib/verdict/deriveOverallVerdict'

// ── helpers ───────────────────────────────────────────────────────────────────

function renderBanner(verdict: AggregateVerdict) {
  render(<VerdictBanner verdict={verdict} />)
}

function verdictFor(
  ...args: Parameters<typeof deriveOverallVerdict>
): AggregateVerdict {
  return deriveOverallVerdict(...args)
}

// ── headline rendering ────────────────────────────────────────────────────────

describe('VerdictBanner — headline', () => {
  it('shows "All verifications passed" for all-pass', () => {
    renderBanner(verdictFor(ALL_PASS_RESULTS))
    expect(screen.getByTestId('verdict-banner-headline')).toHaveTextContent(
      'All verifications passed',
    )
  })

  it('shows "Mixed results — review required" for mixed', () => {
    renderBanner(verdictFor(SOME_FAILED_RESULTS))
    expect(screen.getByTestId('verdict-banner-headline')).toHaveTextContent(
      'Mixed results — review required',
    )
  })

  it('shows "Verification failed" for all-fail', () => {
    renderBanner(verdictFor(ALL_FAIL_RESULTS))
    expect(screen.getByTestId('verdict-banner-headline')).toHaveTextContent(
      'Verification failed',
    )
  })

  it('shows "No valid results available" for all-error', () => {
    renderBanner(verdictFor(ALL_ERROR_RESULTS))
    expect(screen.getByTestId('verdict-banner-headline')).toHaveTextContent(
      'No valid results available',
    )
  })

  it('shows "No valid results available" for empty collection', () => {
    renderBanner(verdictFor(EMPTY_RESULTS))
    expect(screen.getByTestId('verdict-banner-headline')).toHaveTextContent(
      'No valid results available',
    )
  })
})

// ── supporting text ───────────────────────────────────────────────────────────

describe('VerdictBanner — supporting text', () => {
  it('renders a non-empty supporting text paragraph', () => {
    renderBanner(verdictFor(ALL_PASS_RESULTS))
    const text = screen.getByTestId('verdict-banner-supporting')
    expect(text.textContent).not.toBe('')
  })

  it('shows escalated detail in mixed supporting text', () => {
    renderBanner(verdictFor(SOME_FAILED_RESULTS))
    expect(screen.getByTestId('verdict-banner-supporting')).toHaveTextContent(
      /escalated/i,
    )
  })

  it('shows unverifiable detail for timeout scenario', () => {
    renderBanner(verdictFor(TIMEOUT_RESULTS))
    expect(screen.getByTestId('verdict-banner-supporting')).toHaveTextContent(
      /unverifiable/i,
    )
  })

  it('reports fixture parse failure for all-error', () => {
    renderBanner(verdictFor(ALL_ERROR_RESULTS))
    expect(screen.getByTestId('verdict-banner-supporting')).toHaveTextContent(
      /could not be parsed/i,
    )
  })
})

// ── status modifier class ─────────────────────────────────────────────────────

describe('VerdictBanner — severity styling (AC-3)', () => {
  it('applies verdict-banner--all_pass class for all-pass outcome', () => {
    renderBanner(verdictFor(ALL_PASS_RESULTS))
    expect(screen.getByTestId('verdict-banner').className).toContain(
      'verdict-banner--all_pass',
    )
  })

  it('applies verdict-banner--mixed class for mixed outcome', () => {
    renderBanner(verdictFor(SOME_FAILED_RESULTS))
    expect(screen.getByTestId('verdict-banner').className).toContain(
      'verdict-banner--mixed',
    )
  })

  it('applies verdict-banner--all_fail class for all-fail outcome', () => {
    renderBanner(verdictFor(ALL_FAIL_RESULTS))
    expect(screen.getByTestId('verdict-banner').className).toContain(
      'verdict-banner--all_fail',
    )
  })

  it('applies verdict-banner--no_valid class for no-valid outcome', () => {
    renderBanner(verdictFor(ALL_ERROR_RESULTS))
    expect(screen.getByTestId('verdict-banner').className).toContain(
      'verdict-banner--no_valid',
    )
  })
})

// ── count badges ──────────────────────────────────────────────────────────────

describe('VerdictBanner — count badges', () => {
  it('shows "4 passed" badge for all-pass', () => {
    renderBanner(verdictFor(ALL_PASS_RESULTS))
    expect(screen.getByTestId('verdict-count-pass')).toHaveTextContent('4 passed')
  })

  it('shows escalated badge for mixed', () => {
    renderBanner(verdictFor(SOME_FAILED_RESULTS))
    expect(screen.getByTestId('verdict-count-escalated')).toBeInTheDocument()
  })

  it('shows unverifiable badge for timeout scenario', () => {
    renderBanner(verdictFor(TIMEOUT_RESULTS))
    expect(screen.getByTestId('verdict-count-unverifiable')).toBeInTheDocument()
  })

  it('shows error badge for partial-unavailable', () => {
    renderBanner(verdictFor(PARTIAL_UNAVAILABLE_RESULTS))
    expect(screen.getByTestId('verdict-count-invalid')).toHaveTextContent(
      /2 errors/,
    )
  })

  it('does not render a pass badge when there are no passing results', () => {
    renderBanner(verdictFor(ALL_FAIL_RESULTS))
    expect(screen.queryByTestId('verdict-count-pass')).toBeNull()
  })

  it('does not render count breakdown for empty collection', () => {
    renderBanner(verdictFor(EMPTY_RESULTS))
    expect(screen.queryByTestId('verdict-count-pass')).toBeNull()
    expect(screen.queryByTestId('verdict-count-invalid')).toBeNull()
  })

  it('uses singular "error" label for a single invalid result', () => {
    const singleInvalid = [
      { id: 'x', title: 'X', subtitle: '', isValid: false as const, errorMessage: 'oops' },
    ]
    renderBanner(verdictFor(singleInvalid))
    expect(screen.getByTestId('verdict-count-invalid')).toHaveTextContent('1 error')
  })
})

// ── accessibility ─────────────────────────────────────────────────────────────

describe('VerdictBanner — accessibility', () => {
  it('has role="status"', () => {
    renderBanner(verdictFor(ALL_PASS_RESULTS))
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('aria-label contains the headline text', () => {
    renderBanner(verdictFor(ALL_PASS_RESULTS))
    const banner = screen.getByTestId('verdict-banner')
    expect(banner.getAttribute('aria-label')).toContain('All verifications passed')
  })
})
