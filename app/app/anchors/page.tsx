'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { AnchorCard } from '@/components/app/AnchorCard'
import { AnchorEditor } from '@/components/app/AnchorEditor'
import { STARTER_ANCHORS } from '@/lib/constants/starterAnchors'
import type { Anchor, ConcernLevel } from '@/types'
import { useCaregiver } from '@/lib/contexts/CaregiverContext'

const PATIENT_ID = process.env.NEXT_PUBLIC_DEMO_PATIENT_ID ?? ''

export default function AnchorsPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-mirsa-text/5 rounded-card" />
          ))}
        </div>
      </div>
    }>
      <AnchorsContent />
    </Suspense>
  )
}

function AnchorsContent() {
  const { caregiverId } = useCaregiver()
  const searchParams = useSearchParams()
  const teachQuestion = searchParams.get('teach')
  const [anchors, setAnchors] = useState<Anchor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingAnchor, setEditingAnchor] = useState<Partial<Anchor> | null>(null)
  const [showEditor, setShowEditor] = useState(!!teachQuestion)

  useEffect(() => {
    async function loadAnchors() {
      try {
        const { data, error } = await supabase
          .from('anchors')
          .select('*')
          .eq('patient_id', PATIENT_ID)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        setAnchors((data as Anchor[]) ?? [])
      } catch {
        // Load failed
      } finally {
        setIsLoading(false)
      }
    }
    loadAnchors()
  }, [])

  const handleSave = useCallback(async (data: {
    label: string
    question_examples: string[]
    response_text: string
    concern_level: ConcernLevel
    photo_url: string | null
  }) => {
    try {
      if (editingAnchor?.id) {
        const { data: updated, error } = await supabase
          .from('anchors')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAnchor.id)
          .select()
          .single()

        if (error) throw error
        setAnchors(prev => prev.map(a => a.id === editingAnchor.id ? updated as Anchor : a))
      } else {
        const { data: created, error } = await supabase
          .from('anchors')
          .insert({
            ...data,
            patient_id: PATIENT_ID,
            created_by_id: caregiverId,
            is_active: true,
          })
          .select()
          .single()

        if (error) throw error
        setAnchors(prev => [created as Anchor, ...prev])
      }

      setShowEditor(false)
      setEditingAnchor(null)
    } catch (err) {
      throw err
    }
  }, [editingAnchor, caregiverId])

  const handleAddStarter = useCallback(async (starter: typeof STARTER_ANCHORS[number]) => {
    try {
      const { data, error } = await supabase
        .from('anchors')
        .insert({
          patient_id: PATIENT_ID,
          created_by_id: caregiverId,
          label: starter.label,
          question_examples: starter.question_examples,
          response_text: starter.response_text,
          concern_level: starter.concern_level,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error
      setAnchors(prev => [data as Anchor, ...prev])
    } catch {
      // Add failed
    }
  }, [caregiverId])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-mirsa-text/5 rounded-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sans text-lg font-semibold text-mirsa-text">Anchors</h1>
        <button
          onClick={() => { setEditingAnchor(null); setShowEditor(true) }}
          className="font-sans text-sm font-medium text-mirsa-teal min-h-[48px] flex items-center"
        >
          + New anchor
        </button>
      </div>

      {anchors.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-serif text-base text-mirsa-muted">
            No anchors yet. Add your first answer for Robert below.
          </p>
        </div>
      ) : (
        anchors.map(anchor => (
          <AnchorCard
            key={anchor.id}
            anchor={anchor}
            onEdit={(a) => { setEditingAnchor(a); setShowEditor(true) }}
          />
        ))
      )}

      <div className="mt-8">
        <h3 className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider mb-3">
          Starter library
        </h3>
        <div className="space-y-2">
          {STARTER_ANCHORS.filter(s => !anchors.some(a => a.label === s.label)).map(starter => (
            <button
              key={starter.label}
              onClick={() => handleAddStarter(starter)}
              className="w-full text-left border border-dashed border-mirsa-text/15 rounded-card p-3 hover:border-mirsa-teal/40 transition-colors"
            >
              <p className="font-sans text-sm font-medium text-mirsa-text">
                {starter.label.replace(/_/g, ' ')}
              </p>
              <p className="font-sans text-xs text-mirsa-muted mt-0.5">
                {starter.question_examples[0]}
              </p>
            </button>
          ))}
        </div>
      </div>

      {showEditor && (
        <AnchorEditor
          anchor={editingAnchor}
          prefillQuestion={teachQuestion ?? undefined}
          onSave={handleSave}
          onClose={() => { setShowEditor(false); setEditingAnchor(null) }}
        />
      )}
    </div>
  )
}
