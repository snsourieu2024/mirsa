'use client'

import { useEffect, useState, useCallback } from 'react'
import { CoachChat } from '@/components/app/CoachChat'
import { useAuth } from '@/lib/contexts/AuthContext'
import type { CoachMessage } from '@/types'

export default function DashboardCoachPage() {
  const { profile, patient } = useAuth()
  const [messages, setMessages] = useState<CoachMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const caregiverId = profile?.id ?? ''
  const caregiverName = profile?.full_name ?? ''

  useEffect(() => {
    if (!caregiverId) return

    async function loadHistory() {
      try {
        const res = await fetch(`/api/coach?caregiverId=${caregiverId}`)
        const data = (await res.json()) as { messages: CoachMessage[] }
        setMessages(data.messages ?? [])
      } catch {
        // History unavailable
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadHistory()
  }, [caregiverId])

  const handleSend = useCallback(async (message: string) => {
    setIsLoading(true)

    const optimistic: CoachMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId, caregiverName, message, patientName: patient?.name }),
      })

      const data = (await res.json()) as { message: string }
      const reply: CoachMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, reply])
    } catch {
      const errorReply: CoachMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorReply])
    } finally {
      setIsLoading(false)
    }
  }, [caregiverId, caregiverName, patient])

  if (!profile) {
    return (
      <div className="pt-10 text-center">
        <p className="font-sans text-sm text-mirsa-muted">Loading...</p>
      </div>
    )
  }

  if (isInitialLoading) {
    return (
      <div className="pt-8 px-1">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-mirsa-text/5 rounded-card w-32" />
          <div className="h-64 bg-mirsa-text/5 rounded-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <div className="px-1 pb-3 border-b border-mirsa-text/10">
        <h1 className="font-sans text-lg font-semibold text-mirsa-text">Coach</h1>
        <p className="font-sans text-xs text-mirsa-muted mt-0.5">
          A supportive companion for your caregiving journey
        </p>
      </div>
      <CoachChat
        messages={messages}
        onSend={handleSend}
        isLoading={isLoading}
        caregiverName={caregiverName}
      />
    </div>
  )
}
