import type { DiffRow, DiffRowKind } from '../../lib/evidence/diffLines'
import { diffLines } from '../../lib/evidence/diffLines'
import type { NormalizedResult } from '../../types/evidence'

// ── public props ──────────────────────────────────────────────────────────────

interface OutputDiffPanelProps {
  readonly result: NormalizedResult
}

// ── internal helpers ──────────────────────────────────────────────────────────

const KIND_CLASS: Record<DiffRowKind, string> = {
  equal: 'diff-row--equal',
  changed: 'diff-row--changed',
  removed: 'diff-row--removed',
  added: 'diff-row--added',
}

const KIND_LABEL: Record<DiffRowKind, string> = {
  equal: 'equal',
  changed: 'changed',
  removed: 'removed from legacy',
  added: 'added in candidate',
}

function DiffTableRow({ row }: { readonly row: DiffRow }) {
  return (
    <tr
      className={`diff-row ${KIND_CLASS[row.kind]}`}
      aria-label={KIND_LABEL[row.kind]}
    >
      <td className="diff-cell diff-cell--lineno" aria-hidden="true">
        {row.legacyLineNo !== null ? row.legacyLineNo : ''}
      </td>
      <td className="diff-cell diff-cell--content">
        {row.legacyLine !== null ? (
          <code className="diff-line-text">{row.legacyLine}</code>
        ) : null}
      </td>
      <td className="diff-cell diff-cell--lineno" aria-hidden="true">
        {row.candidateLineNo !== null ? row.candidateLineNo : ''}
      </td>
      <td className="diff-cell diff-cell--content">
        {row.candidateLine !== null ? (
          <code className="diff-line-text">{row.candidateLine}</code>
        ) : null}
      </td>
    </tr>
  )
}

function UnavailableSide({ label }: { readonly label: string }) {
  return (
    <div className="diff-column diff-column--unavailable">
      <span className="diff-column-header">{label}</span>
      <p className="diff-unavailable-msg">Output unavailable for this result.</p>
    </div>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

/**
 * Side-by-side output diff panel.
 *
 * Renders legacy and candidate stdout as a table of typed rows (equal,
 * changed, removed, added). All content is rendered as React text nodes —
 * no dangerouslySetInnerHTML, no raw HTML injection.
 *
 * Props flow exclusively from a NormalizedResult; the component never
 * touches raw fixture JSON.
 */
export function OutputDiffPanel({ result }: OutputDiffPanelProps) {
  const { legacyOutput, candidateOutput } = result

  // Both unavailable
  if (legacyOutput === null && candidateOutput === null) {
    return (
      <div className="diff-panel diff-panel--empty" role="status" aria-live="polite">
        <p className="diff-unavailable-msg">
          Output data is unavailable for this result.
        </p>
      </div>
    )
  }

  // One side missing — show plain text fallback
  if (legacyOutput === null) {
    return (
      <div className="diff-panel diff-panel--partial">
        <UnavailableSide label="Legacy output" />
        <div className="diff-column">
          <span className="diff-column-header">Candidate output</span>
          <pre className="diff-pre">{candidateOutput}</pre>
        </div>
      </div>
    )
  }

  if (candidateOutput === null) {
    return (
      <div className="diff-panel diff-panel--partial">
        <div className="diff-column">
          <span className="diff-column-header">Legacy output</span>
          <pre className="diff-pre">{legacyOutput}</pre>
        </div>
        <UnavailableSide label="Candidate output" />
      </div>
    )
  }

  const rows = diffLines(legacyOutput, candidateOutput)

  return (
    <div
      className="diff-panel"
      role="region"
      aria-label="Side-by-side output comparison"
    >
      <table className="diff-table">
        <thead>
          <tr>
            <th
              scope="col"
              className="diff-th diff-th--lineno"
              aria-label="Legacy line number"
            />
            <th scope="col" className="diff-th diff-th--content">
              Legacy output
            </th>
            <th
              scope="col"
              className="diff-th diff-th--lineno"
              aria-label="Candidate line number"
            />
            <th scope="col" className="diff-th diff-th--content">
              Candidate output
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="diff-empty-row">
                Both outputs are empty.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <DiffTableRow
                key={`${row.kind}-${String(row.legacyLineNo)}-${String(row.candidateLineNo)}-${idx}`}
                row={row}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
