'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'

export default function DashboardHome() {
  const { patient, profile } = useAuth()
  const [anchorCount, setAnchorCount] = useState<number | null>(null)
  const [photoCount, setPhotoCount] = useState<number | null>(null)
  const [deviceToken, setDeviceToken] = useState<string | null>(null)

  useEffect(() => {
    if (!patient) return

    async function loadStats() {
      try {
        const { count, error } = await supabase
          .from('anchors')
          .select('id', { count: 'exact', head: true })
          .eq('patient_id', patient!.id)
          .eq('is_active', true)

        if (!error) setAnchorCount(count ?? 0)

        setDeviceToken(patient!.device_token)

        try {
          const { data } = await supabase.storage
            .from('photos')
            .list(`${patient!.id}/`, { limit: 100 })
          setPhotoCount(data?.length ?? 0)
        } catch {
          setPhotoCount(0)
        }
      } catch {
        // Stats failed to load
      }
    }

    loadStats()
  }, [patient])

  if (!patient || !profile) {
    return (
      <div className="pt-10 text-center">
        <p className="font-sans text-sm text-mirsa-muted">Loading...</p>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  const deviceUrl = `${baseUrl}/my-device?token=${deviceToken}`

  return (
    <div className="pt-8 space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-mirsa-text mb-1">
          Hello, {profile.full_name}
        </h1>
        <p className="font-sans text-sm text-mirsa-muted">
          Managing Mirsa for {patient.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-mirsa-text/10 rounded-card p-5">
          <p className="font-sans text-3xl font-semibold text-mirsa-teal">
            {anchorCount ?? '—'}
          </p>
          <p className="font-sans text-xs text-mirsa-muted mt-1">
            Questions answered
          </p>
        </div>
        <div className="bg-white border border-mirsa-text/10 rounded-card p-5">
          <p className="font-sans text-3xl font-semibold text-mirsa-teal">
            {photoCount ?? '—'}
          </p>
          <p className="font-sans text-xs text-mirsa-muted mt-1">
            Photos uploaded
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-sans text-sm font-semibold text-mirsa-text">
          Get started
        </h2>

        <Link
          href="/dashboard/anchors"
          className="block bg-white border border-mirsa-text/10 rounded-card p-5 hover:border-mirsa-teal/30 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-mirsa-teal/10 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d9e75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="font-sans text-sm font-medium text-mirsa-text">
                Add questions &amp; answers
              </p>
              <p className="font-sans text-xs text-mirsa-muted mt-0.5">
                Set up what {patient.name} commonly asks and how Mirsa should answer.
                Start from common questions or write your own.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/photos"
          className="block bg-white border border-mirsa-text/10 rounded-card p-5 hover:border-mirsa-teal/30 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-mirsa-teal/10 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d9e75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <div>
              <p className="font-sans text-sm font-medium text-mirsa-text">
                Upload photos
              </p>
              <p className="font-sans text-xs text-mirsa-muted mt-0.5">
                Add familiar photos that appear alongside answers on the device display.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/device"
          className="block bg-white border border-mirsa-text/10 rounded-card p-5 hover:border-mirsa-teal/30 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-mirsa-teal/10 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d9e75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div>
              <p className="font-sans text-sm font-medium text-mirsa-text">
                Set up the device
              </p>
              <p className="font-sans text-xs text-mirsa-muted mt-0.5">
                Get a link to the companion display for {patient.name}&apos;s tablet or screen.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {deviceToken && (
        <div className="bg-mirsa-teal/5 border border-mirsa-teal/20 rounded-card p-5">
          <p className="font-sans text-sm font-medium text-mirsa-text mb-1">
            Your device link
          </p>
          <p className="font-sans text-xs text-mirsa-muted mb-3">
            Open this link on {patient.name}&apos;s tablet or iPad to start the companion display.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs text-mirsa-text bg-white rounded-xl px-3 py-2 border border-mirsa-text/10 truncate">
              {deviceUrl}
            </code>
            <button
              onClick={() => { try { navigator.clipboard.writeText(deviceUrl) } catch {} }}
              className="shrink-0 font-sans text-xs font-medium text-mirsa-teal bg-white border border-mirsa-teal/30 rounded-xl px-3 py-2 min-h-[36px] hover:bg-mirsa-teal/5 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
