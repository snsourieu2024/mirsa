'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Alert, Anchor } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeState {
  newAlerts: Alert[]
  updatedAnchors: Anchor[]
  isConnected: boolean
  clearAlerts: () => void
}

export function useRealtimeAlerts(patientId: string): RealtimeState {
  const [newAlerts, setNewAlerts] = useState<Alert[]>([])
  const [updatedAnchors, setUpdatedAnchors] = useState<Anchor[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)

  const clearAlerts = useCallback(() => {
    setNewAlerts([])
  }, [])

  useEffect(() => {
    if (!patientId) return

    const channel = supabase
      .channel(`realtime-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          const alert = payload.new as Alert
          setNewAlerts(prev => [alert, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'anchors',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          const anchor = payload.new as Anchor
          setUpdatedAnchors(prev => {
            const filtered = prev.filter(a => a.id !== anchor.id)
            return [anchor, ...filtered]
          })
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    // Heartbeat re-subscription every 60 seconds for iPad Safari reliability
    heartbeatRef.current = setInterval(() => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        const newChannel = supabase
          .channel(`realtime-${patientId}-${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'alerts',
              filter: `patient_id=eq.${patientId}`,
            },
            (payload) => {
              const alert = payload.new as Alert
              setNewAlerts(prev => [alert, ...prev])
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'anchors',
              filter: `patient_id=eq.${patientId}`,
            },
            (payload) => {
              const anchor = payload.new as Anchor
              setUpdatedAnchors(prev => {
                const filtered = prev.filter(a => a.id !== anchor.id)
                return [anchor, ...filtered]
              })
            }
          )
          .subscribe((status) => {
            setIsConnected(status === 'SUBSCRIBED')
          })
        channelRef.current = newChannel
      }
    }, 60000)

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
    }
  }, [patientId])

  return { newAlerts, updatedAnchors, isConnected, clearAlerts }
}
