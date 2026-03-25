'use client'

import type { InteractionWithAnchor } from '@/types'

interface InteractionRowProps {
  interaction: InteractionWithAnchor
  onTeachThis: (transcription: string) => void
}

export function InteractionRow({ interaction, onTeachThis }: InteractionRowProps) {
  const time = new Date(interaction.occurred_at).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const isMatched = interaction.response_type === 'anchor'

  return (
    <div className="border-b border-mirsa-text/5 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-sans text-sm text-mirsa-text truncate">
            &ldquo;{interaction.transcription}&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-sans text-xs text-mirsa-muted">{time}</span>
            {isMatched ? (
              <span className="font-sans text-xs text-mirsa-teal bg-mirsa-teal/10 px-2 py-0.5 rounded-full">
                {interaction.anchor?.label?.replace(/_/g, ' ') ?? 'Matched'}
              </span>
            ) : (
              <span className="font-sans text-xs text-mirsa-amber bg-mirsa-amber/10 px-2 py-0.5 rounded-full">
                No match
              </span>
            )}
            {interaction.classifier_confidence !== null && (
              <span className="font-sans text-xs text-mirsa-muted">
                {Math.round(interaction.classifier_confidence * 100)}%
              </span>
            )}
          </div>
        </div>
        {!isMatched && (
          <button
            onClick={() => onTeachThis(interaction.transcription)}
            className="font-sans text-xs font-medium text-mirsa-teal hover:underline min-h-[48px] flex items-center px-2 shrink-0"
          >
            + Teach this
          </button>
        )}
      </div>
    </div>
  )
}
