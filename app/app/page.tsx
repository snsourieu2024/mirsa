'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRealtimeAlerts } from '@/lib/hooks/useRealtimeAlerts'
import { AlertBanner } from '@/components/app/AlertBanner'
import { WeeklySummaryCard } from '@/components/app/WeeklySummaryCard'
import type { Alert, Anchor, Interaction, WeeklySummary } from '@/types'
import { useCaregiver } from '@/lib/contexts/CaregiverContext'

const PATIENT_ID = process.env.NEXT_PUBLIC_DEMO_PATIENT_ID ?? ''

export default function DashboardPage() {
  const { caregiverId, caregiverName, isSecondary, toggleCaregiver } = useCaregiver()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [summary, setSummary] = useState('')
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [topAnchors, setTopAnchors] = useState<Anchor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { newAlerts } = useRealtimeAlerts(PATIENT_ID)

  useEffect(() => {
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev])
    }
  }, [newAlerts])

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true)
      try {
        const [alertsRes, summaryRes, interactionsRes, anchorsRes] = await Promise.all([
          supabase.from('alerts').select('*').eq('patient_id', PATIENT_ID).order('triggered_at', { ascending: false }),
          supabase.from('weekly_summaries').select('*').eq('patient_id', PATIENT_ID).order('week_start', { ascending: false }).limit(1),
          supabase.from('interactions').select('*').eq('patient_id', PATIENT_ID).order('occurred_at', { ascending: false }).limit(50),
          supabase.from('anchors').select('*').eq('patient_id', PATIENT_ID).eq('is_active', true),
        ])

        if (alertsRes.data) setAlerts(alertsRes.data as Alert[])
        if (summaryRes.data && summaryRes.data.length > 0) {
          setSummary((summaryRes.data[0] as WeeklySummary).summary_text)
        }
        if (interactionsRes.data) setInteractions(interactionsRes.data as Interaction[])
        if (anchorsRes.data) setTopAnchors((anchorsRes.data as Anchor[]).slice(0, 3))
      } catch {
        // Dashboard load failed — show empty state
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [caregiverId])

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

  const weekInteractions = interactions.filter(i => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(i.occurred_at) > weekAgo
  })

  const unmatched = interactions.filter(i => i.response_type !== 'anchor').slice(0, 5)
  const weekCount = weekInteractions.length
  const todayCount = interactions.filter(i => {
    const today = new Date().toDateString()
    return new Date(i.occurred_at).toDateString() === today
  }).length

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-mirsa-text/5 rounded-card w-48" />
          <div className="h-24 bg-mirsa-text/5 rounded-card" />
          <div className="h-32 bg-mirsa-text/5 rounded-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold text-mirsa-text">
          Hi, {caregiverName.split(' ')[0]}
        </h1>
        <button
          onClick={toggleCaregiver}
          className="font-sans text-xs text-mirsa-muted hover:text-mirsa-teal transition-colors min-h-[48px] flex items-center px-2"
        >
          Switch to {isSecondary ? "Margaret's" : "Sarah's"} view
        </button>
      </div>

      <AlertBanner alerts={alerts} onAcknowledge={handleAcknowledge} />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="border border-mirsa-text/10 rounded-card p-3 text-center">
          <p className="font-sans text-2xl font-semibold text-mirsa-teal">{weekCount}</p>
          <p className="font-sans text-[10px] text-mirsa-muted mt-0.5">This week</p>
        </div>
        <div className="border border-mirsa-text/10 rounded-card p-3 text-center">
          <p className="font-sans text-2xl font-semibold text-mirsa-text">{todayCount}</p>
          <p className="font-sans text-[10px] text-mirsa-muted mt-0.5">Today</p>
        </div>
        <div className="border border-mirsa-text/10 rounded-card p-3 text-center">
          <p className="font-sans text-2xl font-semibold text-mirsa-amber">
            {alerts.filter(a => !a.acknowledged).length}
          </p>
          <p className="font-sans text-[10px] text-mirsa-muted mt-0.5">Alerts</p>
        </div>
      </div>

      <WeeklySummaryCard summaryText={summary} />

      {topAnchors.length > 0 && (
        <div className="mb-4">
          <h3 className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider mb-2">
            Most triggered
          </h3>
          {topAnchors.map(anchor => (
            <div key={anchor.id} className="border border-mirsa-text/10 rounded-card p-3 mb-2">
              <p className="font-sans text-sm font-medium text-mirsa-text">
                {anchor.label.replace(/_/g, ' ')}
              </p>
              <p className="font-sans text-xs text-mirsa-muted mt-0.5 truncate">
                {anchor.response_text}
              </p>
            </div>
          ))}
        </div>
      )}

      {unmatched.length > 0 && (
        <div>
          <h3 className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider mb-2">
            Unanswered questions
          </h3>
          {unmatched.map(i => (
            <div key={i.id} className="border border-mirsa-text/10 rounded-card p-3 mb-2 flex items-center justify-between">
              <p className="font-sans text-sm text-mirsa-text truncate flex-1">
                &ldquo;{i.transcription}&rdquo;
              </p>
              <a
                href={`/app/anchors?teach=${encodeURIComponent(i.transcription)}`}
                className="font-sans text-xs font-medium text-mirsa-teal hover:underline min-h-[48px] flex items-center px-2 shrink-0"
              >
                + Teach this
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
