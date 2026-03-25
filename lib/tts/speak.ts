'use client'

let selectedVoice: SpeechSynthesisVoice | null = null
let voicesLoaded = false

function selectBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null

  // Prefer high-quality English voices
  const preferred = [
    'Samantha', 'Karen', 'Daniel', 'Moira',
    'Google UK English Female', 'Google US English',
  ]

  for (const name of preferred) {
    const match = voices.find(v => v.name.includes(name))
    if (match) return match
  }

  const englishVoice = voices.find(v => v.lang.startsWith('en'))
  return englishVoice ?? voices[0] ?? null
}

export function initVoices(): void {
  if (typeof window === 'undefined') return

  if (voicesLoaded) return

  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) {
    selectedVoice = selectBestVoice()
    voicesLoaded = true
    return
  }

  // iOS loads voices asynchronously — must use voiceschanged event
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    selectedVoice = selectBestVoice()
    voicesLoaded = true
  })
}

export function speak(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    try {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0

      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      utterance.onend = () => resolve()
      utterance.onerror = (event) => {
        if (event.error === 'canceled' || event.error === 'interrupted') {
          resolve()
          return
        }
        reject(new Error(event.error))
      }

      window.speechSynthesis.speak(utterance)
    } catch {
      resolve()
    }
  })
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
}
