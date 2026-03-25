'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Interaction } from '@/types'

const QUEUE_KEY = 'mirsa_offline_queue'

type QueuedInteraction = Omit<Interaction, 'id'>

interface OfflineQueueState {
  isOnline: boolean
  queueLength: number
  enqueue: (interaction: QueuedInteraction) => void
}

export function useOfflineQueue(): OfflineQueueState {
  const [isOnline, setIsOnline] = useState(true)
  const [queueLength, setQueueLength] = useState(0)
  const flushingRef = useRef(false)

  const getQueue = useCallback((): QueuedInteraction[] => {
    try {
      const stored = localStorage.getItem(QUEUE_KEY)
      return stored ? (JSON.parse(stored) as QueuedInteraction[]) : []
    } catch {
      return []
    }
  }, [])

  const saveQueue = useCallback((queue: QueuedInteraction[]) => {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
      setQueueLength(queue.length)
    } catch {
      // localStorage unavailable
    }
  }, [])

  const flush = useCallback(async () => {
    if (flushingRef.current) return
    flushingRef.current = true

    try {
      const queue = getQueue()
      if (queue.length === 0) {
        flushingRef.current = false
        return
      }

      const { error } = await supabase
        .from('interactions')
        .insert(queue as Record<string, unknown>[])

      if (error) throw error

      saveQueue([])
    } catch {
      // Will retry on next online event
    } finally {
      flushingRef.current = false
    }
  }, [getQueue, saveQueue])

  const enqueue = useCallback(
    (interaction: QueuedInteraction) => {
      if (isOnline) {
        supabase
          .from('interactions')
          .insert(interaction as unknown as Record<string, unknown>)
          .then(({ error }) => {
            if (error) {
              const queue = getQueue()
              queue.push(interaction)
              saveQueue(queue)
            }
          })
      } else {
        const queue = getQueue()
        queue.push(interaction)
        saveQueue(queue)
      }
    },
    [isOnline, getQueue, saveQueue]
  )

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      flush()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOnline(navigator.onLine)
    setQueueLength(getQueue().length)

    if (navigator.onLine) flush()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [flush, getQueue])

  return { isOnline, queueLength, enqueue }
}
