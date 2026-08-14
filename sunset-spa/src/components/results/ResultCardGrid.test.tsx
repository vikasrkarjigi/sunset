import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultCardGrid } from './ResultCardGrid'
import {
  MOCK_PASS,
  MOCK_FAIL,
  MOCK_TIMEOUT,
  MOCK_ERROR,
  MOCK_MALFORMED,
  ALL_MOCK_CARDS,
} from '../../test-fixtures/mockCardViewModels'
import type { CardViewModel } from '../../types/results'
import { toCardViewModel } from '../../types/results'
import { normalizeAllFixtures } from '../../lib/evidence/normalizeFixture'
import { FIXTURE_INVENTORY } from '../../assets/fixtures/fixtureInventory'

// ── helpers ───────────────────────────────────────────────────────────────────

function getGrid() {
  return screen.getByTestId('result-card-grid')
}

// ── four-card expectation ─────────────────────────────────────────────────────

describe('ResultCardGrid — four cards (AC-1)', () => {
  it('renders exactly four list items from four fixture-derived card models', () => {
    const results = normalizeAllFixtures(FIXTURE_INVENTORY).map(toCardViewModel)
    render(
      <ResultCardGrid results={results} selectedId={null} onSelect={vi.fn()} />,
    )
    const items = within(getGrid()).getAllByRole('listitem')
    expect(items).toHaveLength(4)
  })

  it('renders exactly five items when given five mock cards', () => {
    render(
      <ResultCardGrid
        results={ALL_MOCK_CARDS}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    const items = within(getGrid()).getAllByRole('listitem')
    expect(items).toHaveLength(5)
  })

  it('renders zero items when given an empty array', () => {
    render(
      <ResultCardGrid results={[]} selectedId={null} onSelect={vi.fn()} />,
    )
    expect(within(getGrid()).queryAllByRole('listitem')).toHaveLength(0)
  })
})

// ── mixed valid / invalid cards ───────────────────────────────────────────────

describe('ResultCardGrid — mixed valid and invalid (AC-3)', () => {
  const MIXED: readonly CardViewModel[] = [MOCK_PASS, MOCK_FAIL, MOCK_ERROR]

  it('renders all three cards including the invalid one', () => {
    render(
      <ResultCardGrid results={MIXED} selectedId={null} onSelect={vi.fn()} />,
    )
    expect(within(getGrid()).getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders the invalid card error message', () => {
    render(
      <ResultCardGrid results={MIXED} selectedId={null} onSelect={vi.fn()} />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(MOCK_ERROR.errorMessage!)
  })

  it('does not hide valid cards when invalid ones are present', () => {
    render(
      <ResultCardGrid results={MIXED} selectedId={null} onSelect={vi.fn()} />,
    )
    expect(screen.getByText(MOCK_PASS.title)).toBeInTheDocument()
    expect(screen.getByText(MOCK_FAIL.title)).toBeInTheDocument()
  })
})

describe('ResultCardGrid — all invalid cards', () => {
  const ALL_INVALID: readonly CardViewModel[] = [MOCK_ERROR, MOCK_MALFORMED]

  it('renders all invalid cards without throwing', () => {
    render(
      <ResultCardGrid
        results={ALL_INVALID}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(within(getGrid()).getAllByRole('listitem')).toHaveLength(2)
  })

  it('renders all alert messages', () => {
    render(
      <ResultCardGrid
        results={ALL_INVALID}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    )
    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(2)
  })
})

// ── selection marking ─────────────────────────────────────────────────────────

describe('ResultCardGrid — selectedId marking (AC-2)', () => {
  const CARDS: readonly CardViewModel[] = [MOCK_PASS, MOCK_FAIL, MOCK_TIMEOUT]

  it('marks the matching card as selected', () => {
    render(
      <ResultCardGrid
        results={CARDS}
        selectedId={MOCK_FAIL.id}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByTestId(`result-card-${MOCK_FAIL.id}`)).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('leaves all other cards unselected', () => {
    render(
      <ResultCardGrid
        results={CARDS}
        selectedId={MOCK_FAIL.id}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByTestId(`result-card-${MOCK_PASS.id}`)).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByTestId(`result-card-${MOCK_TIMEOUT.id}`)).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('selects nothing when selectedId is null', () => {
    render(
      <ResultCardGrid results={CARDS} selectedId={null} onSelect={vi.fn()} />,
    )
    CARDS.forEach((c) => {
      expect(screen.getByTestId(`result-card-${c.id}`)).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    })
  })
})

// ── onSelect propagation ──────────────────────────────────────────────────────

describe('ResultCardGrid — onSelect callback propagation', () => {
  it('calls onSelect with the clicked card id', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ResultCardGrid
        results={[MOCK_PASS, MOCK_FAIL]}
        selectedId={null}
        onSelect={onSelect}
      />,
    )
    await user.click(screen.getByTestId(`result-card-${MOCK_FAIL.id}`))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(MOCK_FAIL.id)
  })

  it('calls onSelect each time a different card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ResultCardGrid
        results={[MOCK_PASS, MOCK_FAIL]}
        selectedId={null}
        onSelect={onSelect}
      />,
    )
    await user.click(screen.getByTestId(`result-card-${MOCK_PASS.id}`))
    await user.click(screen.getByTestId(`result-card-${MOCK_FAIL.id}`))
    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(onSelect).toHaveBeenNthCalledWith(1, MOCK_PASS.id)
    expect(onSelect).toHaveBeenNthCalledWith(2, MOCK_FAIL.id)
  })
})

// ── integration: normalizeAllFixtures → toCardViewModel → grid (AC-5) ─────────

describe('ResultCardGrid integration — real fixture pipeline', () => {
  it('renders four cards from the real fixture inventory', () => {
    const cards = normalizeAllFixtures(FIXTURE_INVENTORY).map(toCardViewModel)
    render(
      <ResultCardGrid results={cards} selectedId={null} onSelect={vi.fn()} />,
    )
    expect(within(getGrid()).getAllByRole('listitem')).toHaveLength(4)
  })

  it('renders a badge for each card', () => {
    const cards = normalizeAllFixtures(FIXTURE_INVENTORY).map(toCardViewModel)
    render(
      <ResultCardGrid results={cards} selectedId={null} onSelect={vi.fn()} />,
    )
    // Each valid card has a badge — at minimum the four real fixtures all produce one
    const badges = document.querySelectorAll('.result-card-badge')
    expect(badges.length).toBe(4)
  })

  it('selecting one card marks only that card as pressed', async () => {
    const user = userEvent.setup()
    const cards = normalizeAllFixtures(FIXTURE_INVENTORY).map(toCardViewModel)
    const onSelect = vi.fn()
    render(
      <ResultCardGrid results={cards} selectedId={null} onSelect={onSelect} />,
    )
    const firstButton = within(getGrid()).getAllByRole('button')[0]!
    await user.click(firstButton)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})

// ── accessible structure ──────────────────────────────────────────────────────

describe('ResultCardGrid — accessible structure', () => {
  it('renders inside a section landmark with a label', () => {
    render(
      <ResultCardGrid results={[MOCK_PASS]} selectedId={null} onSelect={vi.fn()} />,
    )
    expect(
      screen.getByRole('region', { name: /verification results/i }),
    ).toBeInTheDocument()
  })

  it('renders the grid as a list', () => {
    render(
      <ResultCardGrid results={[MOCK_PASS]} selectedId={null} onSelect={vi.fn()} />,
    )
    expect(getGrid().tagName.toLowerCase()).toBe('ul')
  })
})
