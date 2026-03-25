'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'

export default function DeviceSetupPage() {
  const { patient, profile } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!patient || !profile) {
    return (
      <div className="pt-10 text-center">
        <p className="font-sans text-sm text-mirsa-muted">Loading...</p>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  const deviceUrl = `${baseUrl}/my-device?token=${patient.device_token}`

  function copyLink() {
    try {
      navigator.clipboard.writeText(deviceUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available
    }
  }

  return (
    <div className="pt-8 space-y-8">
      <div>
        <h1 className="font-serif text-xl font-semibold text-mirsa-text mb-1">
          Device setup
        </h1>
        <p className="font-sans text-sm text-mirsa-muted">
          Set up a tablet or screen as {patient.name}&apos;s ambient companion display.
        </p>
      </div>

      <div className="bg-white border border-mirsa-text/10 rounded-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-mirsa-teal/10 flex items-center justify-center shrink-0">
            <span className="font-sans text-lg font-semibold text-mirsa-teal">1</span>
          </div>
          <div>
            <p className="font-sans text-sm font-medium text-mirsa-text">
              Add questions first
            </p>
            <p className="font-sans text-xs text-mirsa-muted">
              Go to Questions &amp; Answers and add what {patient.name} commonly asks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-mirsa-teal/10 flex items-center justify-center shrink-0">
            <span className="font-sans text-lg font-semibold text-mirsa-teal">2</span>
          </div>
          <div>
            <p className="font-sans text-sm font-medium text-mirsa-text">
              Open the device link on a tablet
            </p>
            <p className="font-sans text-xs text-mirsa-muted">
              Copy the link below and open it in Safari on an iPad or any tablet browser.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-mirsa-teal/10 flex items-center justify-center shrink-0">
            <span className="font-sans text-lg font-semibold text-mirsa-teal">3</span>
          </div>
          <div>
            <p className="font-sans text-sm font-medium text-mirsa-text">
              Tap &ldquo;Start Mirsa&rdquo;
            </p>
            <p className="font-sans text-xs text-mirsa-muted">
              The device will start listening. When {patient.name} asks a question,
              it answers in your words.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-mirsa-teal/5 border border-mirsa-teal/20 rounded-card p-6">
        <p className="font-sans text-sm font-medium text-mirsa-text mb-3">
          Your device link
        </p>
        <div className="bg-white rounded-xl border border-mirsa-text/10 px-4 py-3 mb-3">
          <code className="font-mono text-xs text-mirsa-text break-all">
            {deviceUrl}
          </code>
        </div>
        <button
          onClick={copyLink}
          className="w-full font-sans text-sm font-medium text-white bg-mirsa-teal rounded-xl px-4 py-3 min-h-[48px] hover:opacity-90 transition-opacity"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="font-sans text-sm font-semibold text-mirsa-text">
          Tips for iPad
        </h2>
        <div className="bg-white border border-mirsa-text/10 rounded-card p-5 space-y-3">
          <div>
            <p className="font-sans text-xs font-medium text-mirsa-text">Add to Home Screen</p>
            <p className="font-sans text-xs text-mirsa-muted">
              In Safari, tap Share &rarr; Add to Home Screen. This opens Mirsa as a full-screen app
              without browser controls.
            </p>
          </div>
          <div>
            <p className="font-sans text-xs font-medium text-mirsa-text">Prevent screen lock</p>
            <p className="font-sans text-xs text-mirsa-muted">
              Go to Settings &rarr; Display &amp; Brightness &rarr; Auto-Lock &rarr; Never.
              This keeps the companion display always visible.
            </p>
          </div>
          <div>
            <p className="font-sans text-xs font-medium text-mirsa-text">Allow microphone</p>
            <p className="font-sans text-xs text-mirsa-muted">
              When prompted, tap &ldquo;Allow&rdquo; to let Mirsa listen for questions.
              This only activates after tapping Start Mirsa.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
