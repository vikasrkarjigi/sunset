/**
 * Line-oriented diff utility.
 *
 * Produces a typed side-by-side diff between two plain-text strings.
 * Uses an LCS-based algorithm; consecutive removed+added blocks are
 * merged into 'changed' row pairs for compact side-by-side display.
 *
 * No external dependencies. All input is treated as plain text — no HTML
 * parsing, no HTML injection risk.
 */

export type DiffRowKind = 'equal' | 'changed' | 'removed' | 'added'

export interface DiffRow {
  readonly kind: DiffRowKind
  /** Text of the legacy line; null when kind is 'added'. */
  readonly legacyLine: string | null
  /** Text of the candidate line; null when kind is 'removed'. */
  readonly candidateLine: string | null
  /** 1-based line number in the legacy text; null when kind is 'added'. */
  readonly legacyLineNo: number | null
  /** 1-based line number in the candidate text; null when kind is 'removed'. */
  readonly candidateLineNo: number | null
}

/**
 * Split text into lines. Normalises CRLF and drops a single trailing newline
 * so that "abc\ndef\n" becomes ["abc", "def"] rather than ["abc", "def", ""].
 */
function splitLines(text: string): string[] {
  if (text === '') return []
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop()
  }
  return lines
}

/** Standard DP LCS length table. */
function lcsTable(a: string[], b: string[]): number[][] {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from(
    { length: m + 1 },
    () => new Array<number>(n + 1).fill(0),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp
}

type RawOp =
  | { readonly kind: 'eq'; readonly li: number; readonly ci: number }
  | { readonly kind: 'rm'; readonly li: number }
  | { readonly kind: 'ins'; readonly ci: number }

/** Backtrack through the LCS table to produce the edit sequence. */
function backtrack(
  dp: number[][],
  a: string[],
  b: string[],
): RawOp[] {
  const ops: RawOp[] = []
  let i = a.length
  let j = b.length
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ kind: 'eq', li: i - 1, ci: j - 1 })
      i--
      j--
    } else if (j > 0 && (i === 0 || (dp[i]![j - 1]! >= dp[i - 1]![j]!))) {
      ops.push({ kind: 'ins', ci: j - 1 })
      j--
    } else {
      ops.push({ kind: 'rm', li: i - 1 })
      i--
    }
  }
  return ops.reverse()
}

type RemovedEntry = { readonly legacyLine: string; readonly legacyLineNo: number }
type AddedEntry = { readonly candidateLine: string; readonly candidateLineNo: number }

/**
 * Flush accumulated removed/added blocks into the output rows.
 * Consecutive removed+added pairs become 'changed' rows; any surplus
 * entries become standalone 'removed' or 'added' rows.
 */
function flushPending(
  removed: RemovedEntry[],
  added: AddedEntry[],
  rows: DiffRow[],
): void {
  const pairCount = Math.min(removed.length, added.length)
  for (let k = 0; k < pairCount; k++) {
    rows.push({
      kind: 'changed',
      legacyLine: removed[k]!.legacyLine,
      candidateLine: added[k]!.candidateLine,
      legacyLineNo: removed[k]!.legacyLineNo,
      candidateLineNo: added[k]!.candidateLineNo,
    })
  }
  for (let k = pairCount; k < removed.length; k++) {
    rows.push({
      kind: 'removed',
      legacyLine: removed[k]!.legacyLine,
      candidateLine: null,
      legacyLineNo: removed[k]!.legacyLineNo,
      candidateLineNo: null,
    })
  }
  for (let k = pairCount; k < added.length; k++) {
    rows.push({
      kind: 'added',
      legacyLine: null,
      candidateLine: added[k]!.candidateLine,
      legacyLineNo: null,
      candidateLineNo: added[k]!.candidateLineNo,
    })
  }
}

/**
 * Compute a side-by-side line diff between two plain-text strings.
 *
 * Returns an ordered array of DiffRow values for rendering. Consecutive
 * removed+added pairs are merged into 'changed' rows. All line content is
 * returned as-is — the caller is responsible for safe text rendering.
 */
export function diffLines(legacyText: string, candidateText: string): DiffRow[] {
  const legacy = splitLines(legacyText)
  const candidate = splitLines(candidateText)

  if (legacy.length === 0 && candidate.length === 0) return []

  const dp = lcsTable(legacy, candidate)
  const rawOps = backtrack(dp, legacy, candidate)

  const rows: DiffRow[] = []
  const pendingRemoved: RemovedEntry[] = []
  const pendingAdded: AddedEntry[] = []

  for (const op of rawOps) {
    if (op.kind === 'eq') {
      flushPending(pendingRemoved, pendingAdded, rows)
      rows.push({
        kind: 'equal',
        legacyLine: legacy[op.li]!,
        candidateLine: candidate[op.ci]!,
        legacyLineNo: op.li + 1,
        candidateLineNo: op.ci + 1,
      })
    } else if (op.kind === 'rm') {
      pendingRemoved.push({
        legacyLine: legacy[op.li]!,
        legacyLineNo: op.li + 1,
      })
    } else {
      pendingAdded.push({
        candidateLine: candidate[op.ci]!,
        candidateLineNo: op.ci + 1,
      })
    }
  }

  flushPending(pendingRemoved, pendingAdded, rows)
  return rows
}
