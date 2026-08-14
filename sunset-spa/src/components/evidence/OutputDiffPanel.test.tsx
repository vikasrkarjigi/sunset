import { useState } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OutputDiffPanel } from './OutputDiffPanel'
import type { NormalizedResult } from '../../types/evidence'

// ── test fixtures (synthetic — not wired into production demo loading) ────────

function makeResult(
  overrides: Partial<NormalizedResult> = {},
): NormalizedResult {
  return {
    id: 'test-01',
    title: 'Test Result',
    subtitle: 'Test subtitle',
    verdict: 'green_light',
    legacyOutput: 'line one\nline two\n',
    candidateOutput: 'line one\nline two\n',
    attemptCount: 1,
    isValid: true,
    ...overrides,
  }
}

const IDENTICAL_RESULT = makeResult()

const CHANGED_RESULT = makeResult({
  id: 'test-02',
  verdict: 'green_light',
  legacyOutput: '129.69\n299.20\n48.53\n',
  candidateOutput: '129.69\n299.2\n48.53\n',
})

const ADDED_RESULT = makeResult({
  id: 'test-03',
  legacyOutput: 'alpha\n',
  candidateOutput: 'alpha\nbeta\n',
})

const REMOVED_RESULT = makeResult({
  id: 'test-04',
  legacyOutput: 'alpha\nbeta\n',
  candidateOutput: 'alpha\n',
})

const BOTH_NULL_RESULT = makeResult({
  id: 'test-05',
  legacyOutput: null,
  candidateOutput: null,
})

const LEGACY_NULL_RESULT = makeResult({
  id: 'test-06',
  legacyOutput: null,
  candidateOutput: 'candidate only\n',
})

const CANDIDATE_NULL_RESULT = makeResult({
  id: 'test-07',
  legacyOutput: 'legacy only\n',
  candidateOutput: null,
})

const HTML_CONTENT_RESULT = makeResult({
  id: 'test-08',
  legacyOutput: '<script>alert(1)</script>\n',
  candidateOutput: '<b>not html</b>\n',
})

const MULTILINE_RESULT = makeResult({
  id: 'test-09',
  legacyOutput: [
    'row 1: cumulative=7 avg=7',
    'row 2: cumulative=10 avg=5',
    'row 3: cumulative=19 avg=6',
    'row 4: cumulative=21 avg=5',
    'row 5: cumulative=26 avg=5',
  ].join('\n') + '\n',
  candidateOutput: [
    'row 1: cumulative=7 avg=7',
    'row 2: cumulative=10 avg=5',
    'row 3: cumulative=19 avg=6',
    'row 4: cumulative=21 avg=5',
    'row 5: cumulative=26 avg=6', // last row differs
  ].join('\n') + '\n',
})

const EMPTY_OUTPUTS_RESULT = makeResult({
  id: 'test-10',
  legacyOutput: '',
  candidateOutput: '',
})

// ── unit tests ─────────────────────────────────────────────────────────────────

describe('OutputDiffPanel', () => {
  describe('column labels', () => {
    it('renders "Legacy output" column header', () => {
      render(<OutputDiffPanel result={IDENTICAL_RESULT} />)
      expect(screen.getByText('Legacy output')).toBeInTheDocument()
    })

    it('renders "Candidate output" column header', () => {
      render(<OutputDiffPanel result={IDENTICAL_RESULT} />)
      expect(screen.getByText('Candidate output')).toBeInTheDocument()
    })
  })

  describe('identical outputs', () => {
    it('renders a diff table with equal rows', () => {
      render(<OutputDiffPanel result={IDENTICAL_RESULT} />)
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      const rows = within(table).getAllByRole('row')
      // header row + 2 data rows
      expect(rows.length).toBeGreaterThanOrEqual(3)
    })

    it('marks all rows as equal', () => {
      render(<OutputDiffPanel result={IDENTICAL_RESULT} />)
      const equalRows = document.querySelectorAll('.diff-row--equal')
      expect(equalRows.length).toBe(2)
    })
  })

  describe('changed lines', () => {
    it('renders changed rows when lines differ', () => {
      render(<OutputDiffPanel result={CHANGED_RESULT} />)
      const changedRows = document.querySelectorAll('.diff-row--changed')
      expect(changedRows.length).toBeGreaterThanOrEqual(1)
    })

    it('shows legacy content in the changed row', () => {
      render(<OutputDiffPanel result={CHANGED_RESULT} />)
      expect(screen.getByText('299.20')).toBeInTheDocument()
    })

    it('shows candidate content in the changed row', () => {
      render(<OutputDiffPanel result={CHANGED_RESULT} />)
      expect(screen.getByText('299.2')).toBeInTheDocument()
    })
  })

  describe('added lines', () => {
    it('renders added rows for extra candidate lines', () => {
      render(<OutputDiffPanel result={ADDED_RESULT} />)
      const addedRows = document.querySelectorAll('.diff-row--added')
      expect(addedRows.length).toBeGreaterThanOrEqual(1)
    })

    it('shows the added candidate line text', () => {
      render(<OutputDiffPanel result={ADDED_RESULT} />)
      expect(screen.getByText('beta')).toBeInTheDocument()
    })
  })

  describe('removed lines', () => {
    it('renders removed rows for extra legacy lines', () => {
      render(<OutputDiffPanel result={REMOVED_RESULT} />)
      const removedRows = document.querySelectorAll('.diff-row--removed')
      expect(removedRows.length).toBeGreaterThanOrEqual(1)
    })

    it('shows the removed legacy line text', () => {
      render(<OutputDiffPanel result={REMOVED_RESULT} />)
      expect(screen.getByText('beta')).toBeInTheDocument()
    })
  })

  describe('multiline output', () => {
    it('renders all five lines across equal and changed rows', () => {
      render(<OutputDiffPanel result={MULTILINE_RESULT} />)
      const table = screen.getByRole('table')
      const dataRows = within(table).getAllByRole('row').slice(1) // skip header
      expect(dataRows.length).toBe(5)
    })

    it('marks the diverging last line as changed', () => {
      render(<OutputDiffPanel result={MULTILINE_RESULT} />)
      const changedRows = document.querySelectorAll('.diff-row--changed')
      expect(changedRows.length).toBe(1)
    })
  })

  describe('empty string outputs', () => {
    it('renders the "both outputs empty" message when both are empty strings', () => {
      render(<OutputDiffPanel result={EMPTY_OUTPUTS_RESULT} />)
      expect(screen.getByText(/Both outputs are empty/i)).toBeInTheDocument()
    })
  })

  describe('unavailable outputs', () => {
    it('renders a status message when both outputs are null', () => {
      render(<OutputDiffPanel result={BOTH_NULL_RESULT} />)
      expect(
        screen.getByText(/Output data is unavailable/i),
      ).toBeInTheDocument()
    })

    it('shows unavailable message for legacy when legacyOutput is null', () => {
      render(<OutputDiffPanel result={LEGACY_NULL_RESULT} />)
      expect(screen.getByText('Legacy output')).toBeInTheDocument()
      expect(screen.getByText(/Output unavailable/i)).toBeInTheDocument()
    })

    it('shows candidate text when candidateOutput is null', () => {
      render(<OutputDiffPanel result={CANDIDATE_NULL_RESULT} />)
      expect(screen.getByText('legacy only')).toBeInTheDocument()
      expect(screen.getByText(/Output unavailable/i)).toBeInTheDocument()
    })
  })

  describe('HTML-safe rendering (AC-6)', () => {
    it('renders angle-bracket strings as literal text, not HTML', () => {
      render(<OutputDiffPanel result={HTML_CONTENT_RESULT} />)
      // getByText succeeds only if React rendered the literal string as a text node
      expect(
        screen.getByText('<script>alert(1)</script>'),
      ).toBeInTheDocument()
      expect(screen.getByText('<b>not html</b>')).toBeInTheDocument()
    })

    it('does not inject script elements', () => {
      render(<OutputDiffPanel result={HTML_CONTENT_RESULT} />)
      // No actual <script> elements should exist in the rendered output
      expect(document.querySelectorAll('script').length).toBe(0)
    })

    it('does not use dangerouslySetInnerHTML (no __html prop)', () => {
      // Check source — verifiable in code, but we can assert the rendered DOM
      // has no injected bold tags from the <b>not html</b> string
      render(<OutputDiffPanel result={HTML_CONTENT_RESULT} />)
      expect(document.querySelectorAll('b').length).toBe(0)
    })
  })

  describe('accessible structure', () => {
    it('wraps the diff in a landmark region', () => {
      render(<OutputDiffPanel result={IDENTICAL_RESULT} />)
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('has a table with header cells for each column', () => {
      render(<OutputDiffPanel result={IDENTICAL_RESULT} />)
      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders.length).toBe(4)
    })
  })
})

// ── integration test: selecting a result updates the diff ─────────────────────
// This test renders a minimal selector + panel pair to verify that switching
// the selected result prop causes the diff content to update (AC-4).

function DiffSelector() {
  const results: NormalizedResult[] = [IDENTICAL_RESULT, CHANGED_RESULT]
  const [selected, setSelected] = useState<NormalizedResult>(results[0]!)

  return (
    <div>
      {results.map((r) => (
        <button
          key={r.id}
          data-testid={`card-${r.id}`}
          onClick={() => { setSelected(r) }}
        >
          {r.title}
        </button>
      ))}
      <OutputDiffPanel result={selected} />
    </div>
  )
}

import React from 'react'

describe('OutputDiffPanel integration: result selection', () => {
  it('updates the diff when a different result is selected', async () => {
    const user = userEvent.setup()
    render(<DiffSelector />)

    // Initially shows the identical result — all rows equal
    expect(document.querySelectorAll('.diff-row--equal').length).toBe(2)
    expect(document.querySelectorAll('.diff-row--changed').length).toBe(0)

    // Click the card for the changed result
    await user.click(screen.getByTestId('card-test-02'))

    // Now the diff shows changed rows
    expect(document.querySelectorAll('.diff-row--changed').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('299.20')).toBeInTheDocument()
    expect(screen.getByText('299.2')).toBeInTheDocument()
  })

  it('shows legacy content when switching back to the identical result', async () => {
    const user = userEvent.setup()
    render(<DiffSelector />)

    await user.click(screen.getByTestId('card-test-02'))
    await user.click(screen.getByTestId('card-test-01'))

    expect(document.querySelectorAll('.diff-row--equal').length).toBe(2)
    expect(document.querySelectorAll('.diff-row--changed').length).toBe(0)
  })
})
