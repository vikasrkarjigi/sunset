// ============================================================================
// Normalized result types — used by UI components
// Never import RawFixture inside React components; consume NormalizedResult only.
// ============================================================================

export type Verdict = 'green_light' | 'escalated' | 'unverifiable'

/** A successfully validated and normalized verification result. */
export interface NormalizedResult {
  readonly id: string
  readonly title: string
  readonly subtitle: string
  readonly verdict: Verdict
  /** stdout from the legacy sandbox run. Null when unavailable or unverifiable. */
  readonly legacyOutput: string | null
  /** stdout from the candidate sandbox run. Null when unavailable or unverifiable. */
  readonly candidateOutput: string | null
  readonly attemptCount: number
  readonly isValid: true
}

/** A fixture that failed schema validation. Shown as an inline error card. */
export interface InvalidResult {
  readonly id: string
  readonly title: string
  readonly subtitle: string
  readonly isValid: false
  readonly errorMessage: string
}

export type AnyResult = NormalizedResult | InvalidResult

// ============================================================================
// Raw fixture types — internal to normalization, never used by UI components.
// ============================================================================

export interface RawSandboxRun {
  readonly stdout: string
  readonly stderr: string
  readonly exit_code: number
  readonly files: Record<string, unknown>
  readonly duration_ms: number
  readonly sandbox_id: string
}

export interface RawDivergenceRow {
  readonly line_no: number
  readonly legacy_value: string
  readonly rewrite_value: string
}

export interface RawDivergence {
  readonly kind: 'none' | 'content'
  readonly rows: readonly RawDivergenceRow[]
  readonly total_diverging: number
  readonly total_compared: number
  readonly exit_code_legacy: number
  readonly exit_code_rewrite: number
}

export interface RawAttempt {
  readonly attempt: number
  readonly candidate_script: string
  readonly legacy: RawSandboxRun
  readonly candidate: RawSandboxRun
  readonly divergence: RawDivergence
  readonly feedback: string
}

export interface RawFixture {
  readonly verdict: string
  readonly fixture_name: string
  readonly legacy_image: string
  readonly modern_image: string
  readonly determinism_check_passed: boolean
  readonly attempts: readonly RawAttempt[]
  readonly final_candidate: string | null
}
