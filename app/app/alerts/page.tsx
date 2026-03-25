'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRealtimeAlerts } from '@/lib/hooks/useRealtimeAlerts'
import type { Alert } from '@/types'
import { cn } from '@/lib/utils'

const PATIENT_ID = process.env.NEXT_PUBLIC_DEMO_PATIENT_ID ?? ''

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { newAlerts } = useRealtimeAlerts(PATIENT_ID)

  useEffect(() => {
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev])
    }
  }, [newAlerts])

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .eq('patient_id', PATIENT_ID)
          .order('triggered_at', { ascending: false })

        if (error) throw error
        setAlerts((data as Alert[]) ?? [])
      } catch {
        // Load failed
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleAcknowledge = useCallback(async (alertId: string) => {
    try {
      await fetch('/api/alert', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      })
      setAlerts(prev =>
        prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
      )
    } catch {
      // Acknowledge failed
    }
  }, [])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-mirsa-text/5 rounded-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="font-sans text-lg font-semibold text-mirsa-text mb-4">Alerts</h1>

      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-serif text-base text-mirsa-muted">
            No alerts yet. When something needs your attention, it will appear here gently.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={cn(
                'border rounded-card p-4 transition-colors',
                alert.acknowledged
                  ? 'border-mirsa-text/10'
                  : 'border-mirsa-amber/30 bg-mirsa-amber/5'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!alert.acknowledged && (
                      <div className="w-2 h-2 rounded-full bg-mirsa-amber shrink-0" />
                    )}
                    <span className={cn(
                      'font-sans text-xs font-medium',
                      alert.is_critical ? 'text-mirsa-amber' : 'text-mirsa-muted'
                    )}>
                      {alert.alert_type === 'elevated_anchor' ? 'Elevated concern' : 'Question cluster'}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-mirsa-text">{alert.detail}</p>
                  <p className="font-sans text-xs text-mirsa-muted mt-1">
                    {new Date(alert.triggered_at).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="font-sans text-xs font-medium text-mirsa-teal hover:underline min-h-[48px] flex items-center px-2 shrink-0"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
