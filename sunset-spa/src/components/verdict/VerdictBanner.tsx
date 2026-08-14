import type { AggregateVerdict } from '../../lib/verdict/deriveOverallVerdict'

interface VerdictBannerProps {
  readonly verdict: AggregateVerdict
}

export function VerdictBanner({ verdict }: VerdictBannerProps) {
  const { outcome, headline, supportingText, counts } = verdict

  return (
    <div
      className={`verdict-banner verdict-banner--${outcome}`}
      role="status"
      aria-label={`Overall verdict: ${headline}`}
      data-testid="verdict-banner"
    >
      <div className="verdict-banner-content">
        <p
          className="verdict-banner-headline"
          data-testid="verdict-banner-headline"
        >
          {headline}
        </p>
        <p
          className="verdict-banner-supporting"
          data-testid="verdict-banner-supporting"
        >
          {supportingText}
        </p>
      </div>

      {counts.total > 0 && (
        <div className="verdict-banner-counts" aria-label="Count breakdown">
          {counts.pass > 0 && (
            <span
              className="verdict-count verdict-count--pass"
              data-testid="verdict-count-pass"
            >
              {counts.pass} passed
            </span>
          )}
          {counts.escalated > 0 && (
            <span
              className="verdict-count verdict-count--escalated"
              data-testid="verdict-count-escalated"
            >
              {counts.escalated} escalated
            </span>
          )}
          {counts.unverifiable > 0 && (
            <span
              className="verdict-count verdict-count--unverifiable"
              data-testid="verdict-count-unverifiable"
            >
              {counts.unverifiable} unverifiable
            </span>
          )}
          {counts.invalid > 0 && (
            <span
              className="verdict-count verdict-count--invalid"
              data-testid="verdict-count-invalid"
            >
              {counts.invalid} error{counts.invalid !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
