'use client'

import type { Anchor } from '@/types'

interface AnchorCardProps {
  anchor: Anchor
  onEdit: (anchor: Anchor) => void
}

export function AnchorCard({ anchor, onEdit }: AnchorCardProps) {
  return (
    <button
      onClick={() => onEdit(anchor)}
      className="w-full text-left border border-mirsa-text/10 rounded-card p-4 mb-3 hover:border-mirsa-teal/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-sans text-sm font-medium text-mirsa-text">
          {anchor.label.replace(/_/g, ' ')}
        </h3>
        {anchor.concern_level === 'elevated' && (
          <span className="font-sans text-xs font-medium text-mirsa-amber bg-mirsa-amber/10 px-2 py-0.5 rounded-full">
            Elevated
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {anchor.question_examples.slice(0, 3).map((q) => (
          <span
            key={q}
            className="font-sans text-xs text-mirsa-muted bg-mirsa-text/5 px-2 py-1 rounded-full"
          >
            {q}
          </span>
        ))}
        {anchor.question_examples.length > 3 && (
          <span className="font-sans text-xs text-mirsa-muted">
            +{anchor.question_examples.length - 3} more
          </span>
        )}
      </div>
      <p className="font-sans text-sm text-mirsa-muted line-clamp-2">
        {anchor.response_text}
      </p>
    </button>
  )
}
