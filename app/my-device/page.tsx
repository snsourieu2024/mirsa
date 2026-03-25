'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AmbientDisplay } from '@/components/device/AmbientDisplay'
import { ListeningIndicator } from '@/components/device/ListeningIndicator'
import { ResponseOverlay } from '@/components/device/ResponseOverlay'
import { buildReminders, replaceSchedulePlaceholder } from '@/components/device/DailyReminder'
import { useVoiceListener } from '@/lib/hooks/useVoiceListener'
import { useRealtimeAlerts } from '@/lib/hooks/useRealtimeAlerts'
import { useAnchorCache } from '@/lib/hooks/useAnchorCache'
import { useOfflineQueue } from '@/lib/hooks/useOfflineQueue'
import { initVoices, speak, stopSpeaking } from '@/lib/tts/speak'
import { supabase } from '@/lib/supabase/client'
import type { Anchor, ClassifyResponse, DailySchedule, Patient, CaregiverProfile, ResponseType } from '@/types'

function getFallbackPhrases(patientName: string, caregiverName: string) {
  return {
    fallback_a: `That's a good question. ${caregiverName} knows the answer — they'll be back soon.`,
    fallback_b: "I'm not sure about that one, but you're safe and everything is okay.",
    fallback_c: `Let me get ${caregiverName} for you. They won't be long.`,
    caregiver_name: `${caregiverName} will be with you soon. Everything is okay, ${patientName}.`,
  } as const
}

function MyDeviceInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [patient, setPatient] = useState<Patient | null>(null)
  const [caregiver, setCaregiver] = useState<CaregiverProfile | null>(null)
  const [loadError, setLoadError] = useState('')
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)
  const [responseText, setResponseText] = useState<string | null>(null)
  const [responsePhoto, setResponsePhoto] = useState<string | null>(null)
  const [schedule, setSchedule] = useState<DailySchedule | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const patientId = patient?.id ?? ''
  const patientName = patient?.name ?? ''
  const caregiverName = caregiver?.full_name ?? 'your caregiver'

  const { anchors, fuzzyMatch, refreshCache } = useAnchorCache(patientId)
  const { updatedAnchors, isConnected } = useRealtimeAlerts(patientId)
  const { isOnline, enqueue } = useOfflineQueue()

  useEffect(() => {
    if (!token) {
      setLoadError('No device token found. Open this page from your dashboard.')
      return
    }

    async function loadPatient() {
      try {
        const { data: patientData, error: patErr } = await supabase
          .from('patients')
          .select('*')
          .eq('device_token', token)
          .single()

        if (patErr) throw patErr
        const pat = patientData as Patient
        setPatient(pat)

        const { data: cgData } = await supabase
          .from('caregiver_profiles')
          .select('*')
          .eq('patient_id', pat.id)
          .eq('role', 'owner')
          .limit(1)
          .single()

        if (cgData) setCaregiver(cgData as CaregiverProfile)
      } catch {
        setLoadError('Could not find a device with this link. Check the URL and try again.')
      }
    }

    loadPatient()
  }, [token])

  useEffect(() => {
    if (updatedAnchors.length > 0) {
      refreshCache()
    }
  }, [updatedAnchors, refreshCache])

  useEffect(() => {
    if (!patientId) return

    async function loadSchedule() {
      try {
        const today = new Date().toISOString().split('T')[0]
        const { data, error } = await supabase
          .from('daily_schedules')
          .select('*')
          .eq('patient_id', patientId)
          .eq('schedule_date', today)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        if (data) setSchedule(data as DailySchedule)
      } catch {
        // Schedule unavailable
      }
    }

    loadSchedule()
  }, [patientId])

  const fallbackPhrases = getFallbackPhrases(patientName, caregiverName)

  const logInteraction = useCallback(
    async (
      transcription: string,
      matchedAnchor: Anchor | null,
      confidence: number | null,
      responseType: ResponseType,
      deliveredText: string,
      alertTriggered: boolean
    ) => {
      const interaction = {
        patient_id: patientId,
        transcription,
        matched_anchor_id: matchedAnchor?.id ?? null,
        classifier_confidence: confidence,
        response_type: responseType,
        response_text_delivered: deliveredText,
        is_flagged: false,
        caregiver_note: null,
        alert_triggered: alertTriggered,
        occurred_at: new Date().toISOString(),
      }

      enqueue(interaction)

      if (alertTriggered && matchedAnchor) {
        try {
          await fetch('/api/alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patient_id: patientId,
              alert_type: 'elevated_anchor',
              detail: `${patientName} asked about ${matchedAnchor.label}: "${transcription}"`,
              is_critical: true,
            }),
          })
        } catch {
          // Alert delivery failed
        }
      }
    },
    [enqueue, patientId, patientName]
  )

  const deliverResponse = useCallback(
    async (text: string, photoUrl: string | null) => {
      setResponseText(text)
      setResponsePhoto(photoUrl)

      try {
        await speak(text)
      } catch {
        // TTS failed
      }
    },
    []
  )

  const handleTranscript = useCallback(
    async (transcript: string) => {
      if (isProcessing) return
      setIsProcessing(true)

      try {
        let matchedAnchor: Anchor | null = null
        let confidence: number | null = null

        if (isOnline && anchors.length > 0) {
          try {
            const res = await fetch('/api/classify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transcript,
                anchors: anchors.map(a => ({
                  label: a.label,
                  question_examples: a.question_examples,
                })),
              }),
            })

            const result: ClassifyResponse = await res.json()
            confidence = result.confidence

            if (result.match) {
              matchedAnchor = anchors.find(a => a.label === result.match) ?? null
            }
          } catch {
            // Classifier failed — fall through to Fuse.js
          }
        }

        if (!matchedAnchor) {
          const fuzzyResult = fuzzyMatch(transcript)
          if (fuzzyResult) {
            matchedAnchor = fuzzyResult.anchor
            confidence = fuzzyResult.score
          }
        }

        if (matchedAnchor) {
          const responseTextRaw = replaceSchedulePlaceholder(
            matchedAnchor.response_text,
            schedule
          )
          const isElevated = matchedAnchor.concern_level === 'elevated'

          await deliverResponse(responseTextRaw, matchedAnchor.photo_url)
          await logInteraction(
            transcript,
            matchedAnchor,
            confidence,
            'anchor',
            responseTextRaw,
            isElevated
          )
        } else {
          const fallbackKeys: Array<'fallback_a' | 'fallback_b' | 'fallback_c'> = [
            'fallback_a', 'fallback_b', 'fallback_c',
          ]
          const key = fallbackKeys[Math.floor(Math.random() * fallbackKeys.length)]
          const fallbackText = fallbackPhrases[key]

          await deliverResponse(fallbackText, null)
          await logInteraction(transcript, null, confidence, key, fallbackText, false)
        }
      } catch {
        await deliverResponse(fallbackPhrases.fallback_b, null)
      } finally {
        setIsProcessing(false)
      }
    },
    [isProcessing, isOnline, anchors, fuzzyMatch, schedule, deliverResponse, logInteraction, fallbackPhrases]
  )

  const handleCaregiverName = useCallback(async () => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      const text = fallbackPhrases.caregiver_name
      await deliverResponse(text, null)
      await logInteraction(caregiverName, null, null, 'caregiver_name', text, false)
    } catch {
      // Failed silently
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, deliverResponse, logInteraction, caregiverName, fallbackPhrases])

  const { isListening } = useVoiceListener({
    onTranscript: handleTranscript,
    onCaregiverName: handleCaregiverName,
    enabled: started && !muted && !!patient,
    caregiverNameOverride: caregiverName,
  })

  const acquireWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch {
      // Wake Lock not supported
    }
  }, [])

  useEffect(() => {
    if (!started) return

    acquireWakeLock()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        acquireWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLockRef.current) {
        wakeLockRef.current.release()
      }
    }
  }, [started, acquireWakeLock])

  const handleStart = useCallback(() => {
    initVoices()
    setStarted(true)
  }, [])

  const handleDismissResponse = useCallback(() => {
    setResponseText(null)
    setResponsePhoto(null)
    stopSpeaking()
  }, [])

  if (loadError) {
    return (
      <div className="fixed inset-0 bg-mirsa-device flex flex-col items-center justify-center px-6 text-center select-none">
        <h1 className="font-serif text-4xl font-semibold text-[#faf9f6] mb-4">
          Mirsa
        </h1>
        <p className="font-sans text-base text-[#faf9f6]/60 max-w-sm">
          {loadError}
        </p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="fixed inset-0 bg-mirsa-device flex flex-col items-center justify-center select-none">
        <h1 className="font-serif text-4xl font-semibold text-[#faf9f6] mb-4">
          Mirsa
        </h1>
        <p className="font-sans text-base text-[#faf9f6]/50">Loading...</p>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="fixed inset-0 bg-mirsa-device flex flex-col items-center justify-center select-none">
        <h1 className="font-serif text-5xl md:text-6xl font-semibold text-[#faf9f6] mb-4">
          Mirsa
        </h1>
        <p className="font-sans text-lg text-[#faf9f6]/50 mb-12">
          Listening for {patientName}
        </p>
        <button
          onClick={handleStart}
          className="bg-mirsa-teal text-white font-sans text-xl font-medium px-16 py-6 rounded-[20px] hover:opacity-90 active:scale-95 transition-all min-h-[64px]"
        >
          Start Mirsa
        </button>
        <p className="font-sans text-sm text-[#faf9f6]/30 mt-8 max-w-sm text-center">
          For the best experience, add Mirsa to your home screen
        </p>
      </div>
    )
  }

  const reminders = buildReminders(schedule)

  return (
    <div className="fixed inset-0 bg-mirsa-device select-none overflow-hidden">
      <AmbientDisplay patientName={patientName} reminders={reminders} />

      <ResponseOverlay
        responseText={responseText}
        photoUrl={responsePhoto}
        onDismiss={handleDismissResponse}
      />

      <ListeningIndicator isListening={isListening && !isProcessing} />

      {isProcessing && (
        <div className="fixed bottom-8 right-8 z-40">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#faf9f6]/40 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-[#faf9f6]/40 animate-pulse [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-[#faf9f6]/40 animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setMuted(prev => !prev)
          if (!muted) stopSpeaking()
        }}
        className="fixed top-6 left-6 z-40 w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#faf9f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.5-.35 2.18" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#faf9f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>

      {muted && (
        <div className="fixed top-8 left-20 z-40 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-mirsa-amber" />
          <span className="font-sans text-xs text-mirsa-amber">Muted</span>
        </div>
      )}

      {(!isOnline || !isConnected) && (
        <div className="fixed top-8 right-8 z-40 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-mirsa-amber" />
          <span className="font-sans text-xs text-mirsa-amber">Offline</span>
        </div>
      )}
    </div>
  )
}

export default function MyDevicePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-mirsa-device flex flex-col items-center justify-center select-none">
          <h1 className="font-serif text-4xl font-semibold text-[#faf9f6] mb-4">Mirsa</h1>
          <p className="font-sans text-base text-[#faf9f6]/50">Loading...</p>
        </div>
      }
    >
      <MyDeviceInner />
    </Suspense>
  )
}
