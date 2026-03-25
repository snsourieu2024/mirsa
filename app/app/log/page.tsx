'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { InteractionRow } from '@/components/app/InteractionRow'
import { TrendCharts } from '@/components/app/TrendCharts'
import { AnchorEditor } from '@/components/app/AnchorEditor'
import type { InteractionWithAnchor, Anchor, ConcernLevel } from '@/types'
import { cn } from '@/lib/utils'
import { useCaregiver } from '@/lib/contexts/CaregiverContext'

const PATIENT_ID = process.env.NEXT_PUBLIC_DEMO_PATIENT_ID ?? ''

type FilterTab = 'all' | 'matched' | 'unmatched' | 'flagged'

export default function LogPage() {
  const { caregiverId } = useCaregiver()
  const [interactions, setInteractions] = useState<InteractionWithAnchor[]>([])
  const [allInteractions, setAllInteractions] = useState<InteractionWithAnchor[]>([])
  const [filter, setFilter] = useState<FilterTab>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [teachQuestion, setTeachQuestion] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: intData, error: intErr } = await supabase
          .from('interactions')
          .select('*')
          .eq('patient_id', PATIENT_ID)
          .order('occurred_at', { ascending: false })

        if (intErr) throw intErr

        const { data: anchorData, error: ancErr } = await supabase
          .from('anchors')
          .select('id, label, question_examples')
          .eq('patient_id', PATIENT_ID)

        if (ancErr) throw ancErr

        const anchorMap = new Map<string, Pick<Anchor, 'label' | 'question_examples'>>(
          (anchorData ?? []).map((a: Record<string, unknown>) => [
            a.id as string,
            { label: a.label as string, question_examples: a.question_examples as string[] }
          ])
        )

        const enriched: InteractionWithAnchor[] = ((intData ?? []) as InteractionWithAnchor[]).map(i => ({
          ...i,
          anchor: i.matched_anchor_id ? anchorMap.get(i.matched_anchor_id) ?? null : null,
        }))

        setAllInteractions(enriched)
        setInteractions(enriched)
      } catch {
        // Load failed
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    switch (filter) {
      case 'matched':
        setInteractions(allInteractions.filter(i => i.response_type === 'anchor'))
        break
      case 'unmatched':
        setInteractions(allInteractions.filter(i => i.response_type !== 'anchor'))
        break
      case 'flagged':
        setInteractions(allInteractions.filter(i => i.is_flagged))
        break
      default:
        setInteractions(allInteractions)
    }
  }, [filter, allInteractions])

  const handleSaveAnchor = useCallback(async (data: {
    label: string
    question_examples: string[]
    response_text: string
    concern_level: ConcernLevel
    photo_url: string | null
  }) => {
    try {
      const { error } = await supabase
        .from('anchors')
        .insert({
          ...data,
          patient_id: PATIENT_ID,
          created_by_id: caregiverId,
          is_active: true,
        })

      if (error) throw error
      setTeachQuestion(null)
    } catch {
      // Save failed
    }
  }, [caregiverId])

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'matched', label: 'Matched' },
    { key: 'unmatched', label: 'Unmatched' },
    { key: 'flagged', label: 'Flagged' },
  ]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-mirsa-text/5 rounded-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-sans text-lg font-semibold text-mirsa-text">Interaction log</h1>
        <a
          href={`/api/export?patientId=${PATIENT_ID}&days=30`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans text-xs font-medium text-mirsa-teal min-h-[48px] flex items-center"
        >
          Export for doctor
        </a>
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'font-sans text-xs font-medium px-3 py-2 rounded-full min-h-[36px] transition-colors whitespace-nowrap',
              filter === tab.key
                ? 'bg-mirsa-teal text-white'
                : 'bg-mirsa-text/5 text-mirsa-muted hover:text-mirsa-text'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {interactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-serif text-base text-mirsa-muted">
            Robert hasn&apos;t spoken to Mirsa yet today. When he does, every conversation will appear here.
          </p>
        </div>
      ) : (
        <div className="mb-8">
          {interactions.map(i => (
            <InteractionRow
              key={i.id}
              interaction={i}
              onTeachThis={setTeachQuestion}
            />
          ))}
        </div>
      )}

      <TrendCharts interactions={allInteractions} />

      {teachQuestion && (
        <AnchorEditor
          anchor={null}
          prefillQuestion={teachQuestion}
          onSave={handleSaveAnchor}
          onClose={() => setTeachQuestion(null)}
        />
      )}
    </div>
  )
}
