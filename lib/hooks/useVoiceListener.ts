'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const INTERROGATIVE_WORDS = new Set([
  'where', 'what', 'when', 'who', 'is', 'did', 'have',
  'am', 'are', 'can', 'how', 'do', 'does', 'will', 'would',
  'could', 'should', 'was', 'were',
])

const DEFAULT_CAREGIVER_NAME = 'margaret'

interface VoiceListenerConfig {
  onTranscript: (transcript: string) => void
  onCaregiverName: () => void
  enabled: boolean
  caregiverNameOverride?: string
}

interface VoiceListenerState {
  isListening: boolean
  lastTranscript: string
  error: string | null
}

function passesIntentGate(transcript: string, caregiverName?: string): 'question' | 'caregiver_name' | null {
  const cleaned = transcript.trim().toLowerCase()

  if (cleaned.length === 0) return null

  // Numbers-only filter
  if (/^\d+$/.test(cleaned)) return null

  const name = (caregiverName ?? DEFAULT_CAREGIVER_NAME).toLowerCase()
  if (cleaned.includes(name)) return 'caregiver_name'

  const words = cleaned.split(/\s+/).filter(w => w.length > 0)

  // Must be more than 3 words (unless caregiver name, handled above)
  if (words.length < 3) return null

  // Check for question mark
  if (cleaned.endsWith('?')) return 'question'

  // Interrogative structure: the first word must be an interrogative/auxiliary
  // to distinguish questions ("where is my wife") from statements ("the weather is nice today").
  // English questions start with wh-words or inverted auxiliaries.
  const firstWord = words[0]
  if (firstWord && INTERROGATIVE_WORDS.has(firstWord) && words.length > 3) return 'question'

  return null
}

export { passesIntentGate }

export function useVoiceListener({
  onTranscript,
  onCaregiverName,
  enabled,
  caregiverNameOverride,
}: VoiceListenerConfig): VoiceListenerState {
  const [isListening, setIsListening] = useState(false)
  const [lastTranscript, setLastTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const enabledRef = useRef(enabled)
  const onTranscriptRef = useRef(onTranscript)
  const onCaregiverNameRef = useRef(onCaregiverName)
  const caregiverNameRef = useRef(caregiverNameOverride)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    onTranscriptRef.current = onTranscript
    onCaregiverNameRef.current = onCaregiverName
    caregiverNameRef.current = caregiverNameOverride
  }, [onTranscript, onCaregiverName, caregiverNameOverride])

  const startRecognition = useCallback(() => {
    if (!enabledRef.current) return

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        setError('Speech recognition not supported in this browser')
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResult = event.results[event.results.length - 1]
        if (!lastResult?.isFinal) return

        const transcript = lastResult[0]?.transcript ?? ''
        if (!transcript.trim()) return

        setLastTranscript(transcript)

        // Layer 2: Intent gate — pure JavaScript, zero API calls
        const gateResult = passesIntentGate(transcript, caregiverNameRef.current)

        if (gateResult === 'caregiver_name') {
          onCaregiverNameRef.current()
          return
        }

        if (gateResult === 'question') {
          // Layer 3: Send to classifier via callback
          onTranscriptRef.current(transcript)
        }
        // If gateResult is null, discard silently — no API call
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return
        }
        setError(event.error)
      }

      // iOS Safari stops recognition after silence — auto-restart
      recognition.onend = () => {
        setIsListening(false)
        if (enabledRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            startRecognition()
          }, 300)
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setError('Failed to start speech recognition')
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      startRecognition()
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
      setIsListening(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
    }
  }, [enabled, startRecognition])

  return { isListening, lastTranscript, error }
}
