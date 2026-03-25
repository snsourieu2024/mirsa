'use client'

import { useEffect, useState, useCallback } from 'react'
import { CoachChat } from '@/components/app/CoachChat'
import type { CoachMessage } from '@/types'
import { useCaregiver } from '@/lib/contexts/CaregiverContext'

export default function CoachPage() {
  const { caregiverId, caregiverName } = useCaregiver()
  const [messages, setMessages] = useState<CoachMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/coach?caregiverId=${caregiverId}`)
        const data = await res.json() as { messages: CoachMessage[] }
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
        body: JSON.stringify({
          caregiverId,
          caregiverName,
          message,
        }),
      })

      const data = await res.json() as { message: string }
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
  }, [caregiverId, caregiverName])

  if (isInitialLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-mirsa-text/5 rounded-card w-32" />
          <div className="h-64 bg-mirsa-text/5 rounded-card" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="p-4 border-b border-mirsa-text/10">
        <h1 className="font-sans text-lg font-semibold text-mirsa-text">Coach</h1>
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
