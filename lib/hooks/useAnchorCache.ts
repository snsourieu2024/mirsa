'use client'

import { useCallback, useEffect, useState } from 'react'
import Fuse from 'fuse.js'
import { supabase } from '@/lib/supabase/client'
import type { Anchor } from '@/types'

const CACHE_KEY = 'mirsa_anchor_cache'

interface AnchorCacheState {
  anchors: Anchor[]
  isLoaded: boolean
  fuzzyMatch: (query: string) => { anchor: Anchor; score: number } | null
  refreshCache: () => Promise<void>
}

export function useAnchorCache(patientId: string): AnchorCacheState {
  const [anchors, setAnchors] = useState<Anchor[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadFromStorage = useCallback((): Anchor[] => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return []
      const parsed = JSON.parse(cached) as Anchor[]
      return parsed.filter(a => a.patient_id === patientId && a.is_active)
    } catch {
      return []
    }
  }, [patientId])

  const saveToStorage = useCallback((data: Anchor[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch {
      // localStorage full or unavailable — continue without caching
    }
  }, [])

  const refreshCache = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('anchors')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)

      if (error) throw error

      const activeAnchors = (data as Anchor[]) ?? []
      setAnchors(activeAnchors)
      saveToStorage(activeAnchors)
      setIsLoaded(true)
    } catch {
      const cached = loadFromStorage()
      setAnchors(cached)
      setIsLoaded(true)
    }
  }, [patientId, saveToStorage, loadFromStorage])

  useEffect(() => {
    const cached = loadFromStorage()
    if (cached.length > 0) {
      setAnchors(cached)
      setIsLoaded(true)
    }
    refreshCache()
  }, [loadFromStorage, refreshCache])

  const fuzzyMatch = useCallback(
    (query: string): { anchor: Anchor; score: number } | null => {
      if (anchors.length === 0) return null

      const searchItems = anchors.flatMap(anchor =>
        anchor.question_examples.map(example => ({
          example,
          anchor,
        }))
      )

      const fuse = new Fuse(searchItems, {
        keys: ['example'],
        threshold: 0.4,
        includeScore: true,
      })

      const results = fuse.search(query)
      if (results.length === 0 || results[0].score === undefined) return null

      const best = results[0]
      const confidence = 1 - (best.score ?? 1)

      if (confidence < 0.6) return null

      return { anchor: best.item.anchor, score: confidence }
    },
    [anchors]
  )

  return { anchors, isLoaded, fuzzyMatch, refreshCache }
}
