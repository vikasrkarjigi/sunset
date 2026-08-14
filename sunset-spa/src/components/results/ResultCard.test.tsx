import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultCard } from './ResultCard'
import {
  MOCK_PASS,
  MOCK_FAIL,
  MOCK_TIMEOUT,
  MOCK_ERROR,
  MOCK_MALFORMED,
} from '../../test-fixtures/mockCardViewModels'
import type { CardViewModel } from '../../types/results'

// ── helpers ───────────────────────────────────────────────────────────────────

function renderCard(
  card: CardViewModel,
  isSelected = false,
  onSelect = vi.fn(),
) {
  render(
    <ul>
      <ResultCard card={card} isSelected={isSelected} onSelect={onSelect} />
    </ul>,
  )
}

function getCard(id: string) {
  return screen.getByTestId(`result-card-${id}`)
}

// ── valid card states ─────────────────────────────────────────────────────────

describe('ResultCard — green_light (pass)', () => {
  it('renders the status badge with correct label', () => {
    renderCard(MOCK_PASS)
    expect(screen.getByText('Green Light')).toBeInTheDocument()
  })

  it('renders the card title', () => {
    renderCard(MOCK_PASS)
    expect(screen.getByText(MOCK_PASS.title)).toBeInTheDocument()
  })

  it('renders the card subtitle', () => {
    renderCard(MOCK_PASS)
    expect(screen.getByText(MOCK_PASS.subtitle)).toBeInTheDocument()
  })

  it('renders the attempt summary', () => {
    renderCard(MOCK_PASS)
    expect(screen.getByText('1 attempt')).toBeInTheDocument()
  })

  it('does not render an error message', () => {
    renderCard(MOCK_PASS)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('has the correct data-testid', () => {
    renderCard(MOCK_PASS)
    expect(getCard('mock-pass')).toBeInTheDocument()
  })

  it('applies the status modifier class', () => {
    renderCard(MOCK_PASS)
    expect(getCard('mock-pass').className).toContain('result-card--green_light')
  })
})

describe('ResultCard — escalated (fail)', () => {
  it('renders "Escalated" badge', () => {
    renderCard(MOCK_FAIL)
    expect(screen.getByText('Escalated')).toBeInTheDocument()
  })

  it('applies the escalated modifier class', () => {
    renderCard(MOCK_FAIL)
    expect(getCard('mock-fail').className).toContain('result-card--escalated')
  })

  it('renders the multi-attempt summary', () => {
    renderCard(MOCK_FAIL)
    expect(screen.getByText('3 attempts')).toBeInTheDocument()
  })
})

describe('ResultCard — unverifiable (timeout)', () => {
  it('renders "Unverifiable" badge', () => {
    renderCard(MOCK_TIMEOUT)
    expect(screen.getByText('Unverifiable')).toBeInTheDocument()
  })

  it('applies the unverifiable modifier class', () => {
    renderCard(MOCK_TIMEOUT)
    expect(getCard('mock-timeout').className).toContain('result-card--unverifiable')
  })
})

// ── invalid / error cards ─────────────────────────────────────────────────────

describe('ResultCard — invalid (error)', () => {
  it('renders "Invalid" badge', () => {
    renderCard(MOCK_ERROR)
    expect(screen.getByText('Invalid')).toBeInTheDocument()
  })

  it('renders the error message in an alert role', () => {
    renderCard(MOCK_ERROR)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent(MOCK_ERROR.errorMessage!)
  })

  it('does not render an attempt summary for invalid cards', () => {
    renderCard(MOCK_ERROR)
    expect(screen.queryByText(/attempt/i)).toBeNull()
  })
})

describe('ResultCard — invalid (malformed)', () => {
  it('renders "Invalid" badge', () => {
    renderCard(MOCK_MALFORMED)
    expect(screen.getByText('Invalid')).toBeInTheDocument()
  })

  it('renders the malformed error message', () => {
    renderCard(MOCK_MALFORMED)
    expect(screen.getByRole('alert')).toHaveTextContent(
      MOCK_MALFORMED.errorMessage!,
    )
  })

  it('shows "Unnamed result" fallback when title is empty', () => {
    const card: CardViewModel = { ...MOCK_MALFORMED, title: '' }
    render(
      <ul>
        <ResultCard card={card} isSelected={false} onSelect={vi.fn()} />
      </ul>,
    )
    expect(screen.getByText('Unnamed result')).toBeInTheDocument()
  })
})

// ── selection state ───────────────────────────────────────────────────────────

describe('ResultCard — selection state', () => {
  it('sets aria-pressed="false" when not selected', () => {
    renderCard(MOCK_PASS, false)
    expect(getCard('mock-pass')).toHaveAttribute('aria-pressed', 'false')
  })

  it('sets aria-pressed="true" when selected', () => {
    renderCard(MOCK_PASS, true)
    expect(getCard('mock-pass')).toHaveAttribute('aria-pressed', 'true')
  })

  it('adds result-card--selected class when selected', () => {
    renderCard(MOCK_PASS, true)
    expect(getCard('mock-pass').className).toContain('result-card--selected')
  })

  it('does not add result-card--selected class when not selected', () => {
    renderCard(MOCK_PASS, false)
    expect(getCard('mock-pass').className).not.toContain('result-card--selected')
  })
})

// ── click callback ────────────────────────────────────────────────────────────

describe('ResultCard — onSelect callback', () => {
  it('calls onSelect when the button is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderCard(MOCK_PASS, false, onSelect)
    await user.click(getCard('mock-pass'))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('does not call onSelect when not clicked', () => {
    const onSelect = vi.fn()
    renderCard(MOCK_PASS, false, onSelect)
    expect(onSelect).not.toHaveBeenCalled()
  })
})

// ── accessibility ─────────────────────────────────────────────────────────────

describe('ResultCard — accessibility', () => {
  it('has an aria-label matching the card title', () => {
    renderCard(MOCK_PASS)
    expect(getCard('mock-pass')).toHaveAttribute(
      'aria-label',
      `Select ${MOCK_PASS.title}`,
    )
  })

  it('the badge has an aria-label matching the status label', () => {
    renderCard(MOCK_PASS)
    expect(screen.getByLabelText('Status: Green Light')).toBeInTheDocument()
  })
})
