'use client'

import type { Alert } from '@/types'

interface AlertBannerProps {
  alerts: Alert[]
  onAcknowledge: (alertId: string) => void
}

export function AlertBanner({ alerts, onAcknowledge }: AlertBannerProps) {
  const unacknowledged = alerts.filter(a => !a.acknowledged)
  if (unacknowledged.length === 0) return null

  const latest = unacknowledged[0]

  return (
    <div className="bg-mirsa-amber/10 border border-mirsa-amber/30 rounded-card p-4 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-mirsa-amber mt-1.5 shrink-0 animate-pulse" />
          <div>
            <p className="font-sans text-sm font-medium text-mirsa-amber">
              {unacknowledged.length === 1
                ? 'New alert'
                : `${unacknowledged.length} new alerts`}
            </p>
            <p className="font-sans text-sm text-mirsa-text mt-1">
              {latest.detail}
            </p>
            <p className="font-sans text-xs text-mirsa-muted mt-1">
              {new Date(latest.triggered_at).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <button
          onClick={() => onAcknowledge(latest.id)}
          className="font-sans text-xs font-medium text-mirsa-teal hover:underline min-h-[48px] flex items-center px-2 shrink-0"
        >
          Acknowledge
        </button>
      </div>
    </div>
  )
}
