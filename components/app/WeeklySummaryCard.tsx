'use client'

interface WeeklySummaryCardProps {
  summaryText: string
}

export function WeeklySummaryCard({ summaryText }: WeeklySummaryCardProps) {
  if (!summaryText) {
    return (
      <div className="border border-mirsa-text/10 rounded-card p-6 mb-4">
        <p className="font-serif text-base text-mirsa-muted italic">
          This week&apos;s summary is being prepared with care...
        </p>
      </div>
    )
  }

  return (
    <div className="border border-mirsa-text/10 rounded-card p-6 mb-4">
      <h3 className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider mb-3">
        This week
      </h3>
      <p className="font-serif text-base md:text-lg leading-relaxed text-mirsa-text">
        {summaryText}
      </p>
    </div>
  )
}
