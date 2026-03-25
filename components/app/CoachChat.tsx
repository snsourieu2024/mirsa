'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { CoachMessage } from '@/types'
import { cn } from '@/lib/utils'

interface CoachChatProps {
  messages: CoachMessage[]
  onSend: (message: string) => Promise<void>
  isLoading: boolean
  caregiverName: string
}

export function CoachChat({ messages, onSend, isLoading, caregiverName }: CoachChatProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return
    const message = input.trim()
    setInput('')
    await onSend(message)
  }, [input, isLoading, onSend])

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="font-serif text-base text-mirsa-text leading-relaxed max-w-xs mx-auto">
              Hi {caregiverName}. I&apos;m here to help you navigate the hard moments — and to remind you that what you&apos;re doing takes real courage.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={`${msg.timestamp}-${i}`}
            className={cn(
              'max-w-[85%] rounded-card p-3.5',
              msg.role === 'user'
                ? 'ml-auto bg-mirsa-teal text-white'
                : 'mr-auto bg-white border border-mirsa-text/10'
            )}
          >
            <p className={cn(
              'font-sans text-sm leading-relaxed whitespace-pre-wrap',
              msg.role === 'assistant' && 'text-mirsa-text'
            )}>
              {msg.content}
            </p>
            <p className={cn(
              'font-sans text-[10px] mt-1.5',
              msg.role === 'user' ? 'text-white/60' : 'text-mirsa-muted'
            )}>
              {new Date(msg.timestamp).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto bg-white border border-mirsa-text/10 rounded-card p-3.5 max-w-[85%]">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-mirsa-muted/40 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-mirsa-muted/40 animate-pulse [animation-delay:150ms]" />
              <div className="w-2 h-2 rounded-full bg-mirsa-muted/40 animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-mirsa-text/10 p-4">
        <p className="font-sans text-[10px] text-mirsa-muted text-center mb-2">
          Mirsa&apos;s coach offers general caregiver guidance, not medical advice.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
            placeholder="Type a message..."
            className="flex-1 font-sans text-sm text-mirsa-text bg-white border border-mirsa-text/10 rounded-card px-4 py-3 focus:outline-none focus:border-mirsa-teal min-h-[48px]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              'px-5 py-3 rounded-card font-sans text-sm font-medium min-h-[48px] transition-colors',
              input.trim() && !isLoading
                ? 'bg-mirsa-teal text-white'
                : 'bg-mirsa-text/10 text-mirsa-muted cursor-not-allowed'
            )}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
