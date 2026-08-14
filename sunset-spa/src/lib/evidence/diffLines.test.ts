import { describe, it, expect } from 'vitest'
import { diffLines } from './diffLines'
import type { DiffRow } from './diffLines'

// ── helpers ──────────────────────────────────────────────────────────────────

function kinds(rows: DiffRow[]): string[] {
  return rows.map((r) => r.kind)
}

function legacyLines(rows: DiffRow[]): Array<string | null> {
  return rows.map((r) => r.legacyLine)
}

function candidateLines(rows: DiffRow[]): Array<string | null> {
  return rows.map((r) => r.candidateLine)
}

// ── unit tests ────────────────────────────────────────────────────────────────

describe('diffLines', () => {
  describe('identical outputs', () => {
    it('produces all-equal rows when both sides are the same', () => {
      const text = 'line one\nline two\nline three\n'
      const rows = diffLines(text, text)
      expect(kinds(rows)).toEqual(['equal', 'equal', 'equal'])
    })

    it('preserves line content in equal rows', () => {
      const text = 'foo\nbar\n'
      const rows = diffLines(text, text)
      expect(legacyLines(rows)).toEqual(['foo', 'bar'])
      expect(candidateLines(rows)).toEqual(['foo', 'bar'])
    })

    it('assigns correct 1-based line numbers to equal rows', () => {
      const rows = diffLines('a\nb\n', 'a\nb\n')
      expect(rows[0]).toMatchObject({ legacyLineNo: 1, candidateLineNo: 1 })
      expect(rows[1]).toMatchObject({ legacyLineNo: 2, candidateLineNo: 2 })
    })
  })

  describe('empty outputs', () => {
    it('returns an empty array when both sides are empty strings', () => {
      expect(diffLines('', '')).toHaveLength(0)
    })

    it('produces only added rows when legacy is empty', () => {
      const rows = diffLines('', 'only candidate\n')
      expect(kinds(rows)).toEqual(['added'])
      expect(rows[0]?.legacyLine).toBeNull()
      expect(rows[0]?.candidateLine).toBe('only candidate')
    })

    it('produces only removed rows when candidate is empty', () => {
      const rows = diffLines('only legacy\n', '')
      expect(kinds(rows)).toEqual(['removed'])
      expect(rows[0]?.legacyLine).toBe('only legacy')
      expect(rows[0]?.candidateLine).toBeNull()
    })
  })

  describe('changed lines', () => {
    it('pairs consecutive removed+added blocks as changed rows', () => {
      const legacy = '299.20\n48.53\n'
      const candidate = '299.2\n48.53\n'
      const rows = diffLines(legacy, candidate)
      // First line differs, second is equal
      const changed = rows.filter((r) => r.kind === 'changed')
      expect(changed).toHaveLength(1)
      expect(changed[0]?.legacyLine).toBe('299.20')
      expect(changed[0]?.candidateLine).toBe('299.2')
    })

    it('changed rows carry both legacy and candidate line numbers', () => {
      const rows = diffLines('x\n', 'y\n')
      expect(rows[0]?.kind).toBe('changed')
      expect(rows[0]?.legacyLineNo).toBe(1)
      expect(rows[0]?.candidateLineNo).toBe(1)
    })

    it('changed rows expose both legacyLine and candidateLine', () => {
      const rows = diffLines('old\n', 'new\n')
      expect(rows[0]?.legacyLine).toBe('old')
      expect(rows[0]?.candidateLine).toBe('new')
    })
  })

  describe('added lines', () => {
    it('marks extra candidate lines as added', () => {
      const legacy = 'alpha\n'
      const candidate = 'alpha\nbeta\ngamma\n'
      const rows = diffLines(legacy, candidate)
      expect(kinds(rows)).toContain('added')
      const added = rows.filter((r) => r.kind === 'added')
      expect(added.map((r) => r.candidateLine)).toEqual(['beta', 'gamma'])
    })

    it('added rows have null legacyLine and null legacyLineNo', () => {
      const rows = diffLines('a\n', 'a\nb\n')
      const added = rows.filter((r) => r.kind === 'added')
      expect(added[0]?.legacyLine).toBeNull()
      expect(added[0]?.legacyLineNo).toBeNull()
    })
  })

  describe('removed lines', () => {
    it('marks extra legacy lines as removed', () => {
      const legacy = 'alpha\nbeta\ngamma\n'
      const candidate = 'alpha\n'
      const rows = diffLines(legacy, candidate)
      const removed = rows.filter((r) => r.kind === 'removed')
      expect(removed.map((r) => r.legacyLine)).toEqual(['beta', 'gamma'])
    })

    it('removed rows have null candidateLine and null candidateLineNo', () => {
      const rows = diffLines('a\nb\n', 'a\n')
      const removed = rows.filter((r) => r.kind === 'removed')
      expect(removed[0]?.candidateLine).toBeNull()
      expect(removed[0]?.candidateLineNo).toBeNull()
    })
  })

  describe('multiline output', () => {
    it('handles many lines with mixed equal and changed rows', () => {
      // Mirrors the invoice reconciliation fixture: most lines equal,
      // some differ on floating-point formatting
      const legacy = [
        '129.69', '299.20', '48.53', '684.80', '87.80',
        '11.20', '238.15', '611.95', '218.85', '347.24',
      ].join('\n') + '\n'
      const candidate = [
        '129.69', '299.2',  '48.53', '684.8000000000001', '87.8',
        '11.2',  '238.15', '611.95', '218.85000000000002', '347.24',
      ].join('\n') + '\n'

      const rows = diffLines(legacy, candidate)
      const equalRows = rows.filter((r) => r.kind === 'equal')
      const changedRows = rows.filter((r) => r.kind === 'changed')
      expect(equalRows.length).toBeGreaterThan(0)
      expect(changedRows.length).toBeGreaterThan(0)
      expect(rows).toHaveLength(10) // total line count must match longer side
    })

    it('handles blank lines within output', () => {
      const rows = diffLines('a\n\nb\n', 'a\n\nb\n')
      expect(kinds(rows)).toEqual(['equal', 'equal', 'equal'])
      expect(rows[1]?.legacyLine).toBe('')
    })

    it('handles output without trailing newline', () => {
      const rows = diffLines('no newline', 'no newline')
      expect(rows).toHaveLength(1)
      expect(rows[0]?.kind).toBe('equal')
    })
  })

  describe('HTML-like content — safe text passthrough', () => {
    it('passes angle brackets through unchanged without escaping', () => {
      // React renders these as text nodes — the test verifies the utility
      // does not mutate or strip HTML-like strings
      const htmlStr = '<script>alert(1)</script>\n'
      const rows = diffLines(htmlStr, htmlStr)
      expect(rows[0]?.kind).toBe('equal')
      expect(rows[0]?.legacyLine).toBe('<script>alert(1)</script>')
    })

    it('diff still works when lines contain angle brackets', () => {
      const legacy = '<result>42</result>\n'
      const candidate = '<result>43</result>\n'
      const rows = diffLines(legacy, candidate)
      expect(rows[0]?.kind).toBe('changed')
      expect(rows[0]?.legacyLine).toBe('<result>42</result>')
      expect(rows[0]?.candidateLine).toBe('<result>43</result>')
    })

    it('passes unicode through unchanged', () => {
      const text = '✓ passed\n✗ failed\n'
      const rows = diffLines(text, text)
      expect(rows[0]?.legacyLine).toBe('✓ passed')
      expect(rows[1]?.legacyLine).toBe('✗ failed')
    })
  })

  describe('line number assignment', () => {
    it('numbers legacy lines sequentially across equal and changed rows', () => {
      const legacy = 'a\nb\nc\n'
      const candidate = 'a\nX\nc\n'
      const rows = diffLines(legacy, candidate)
      const legacyNos = rows.map((r) => r.legacyLineNo)
      expect(legacyNos).toEqual([1, 2, 3])
    })

    it('numbers candidate lines sequentially across equal and changed rows', () => {
      const legacy = 'a\nb\nc\n'
      const candidate = 'a\nX\nc\n'
      const rows = diffLines(legacy, candidate)
      const candidateNos = rows.map((r) => r.candidateLineNo)
      expect(candidateNos).toEqual([1, 2, 3])
    })
  })
})
