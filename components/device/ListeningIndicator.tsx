'use client'

import { cn } from '@/lib/utils'

interface ListeningIndicatorProps {
  isListening: boolean
}

export function ListeningIndicator({ isListening }: ListeningIndicatorProps) {
  if (!isListening) return null

  return (
    <div className="fixed bottom-8 right-8 flex items-center gap-2 z-10">
      <div
        className={cn(
          'w-2.5 h-2.5 rounded-full bg-mirsa-teal animate-pulse-dot'
        )}
      />
      <div
        className={cn(
          'w-2.5 h-2.5 rounded-full bg-mirsa-teal animate-pulse-dot-delay-1'
        )}
      />
      <div
        className={cn(
          'w-2.5 h-2.5 rounded-full bg-mirsa-teal animate-pulse-dot-delay-2'
        )}
      />
    </div>
  )
}
