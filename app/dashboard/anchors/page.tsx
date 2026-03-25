'use client'

import { useEffect, useState, useCallback, type FormEvent } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import type { Anchor } from '@/types'

interface StarterQuestion {
  label: string
  question_examples: string[]
  response_template: string
  concern_level: 'normal' | 'elevated'
}

const COMMON_QUESTIONS: StarterQuestion[] = [
  {
    label: 'keys_location',
    question_examples: ['Where are my keys?', "Have you seen my keys?", "I can't find my keys"],
    response_template: '{{name}}, your keys are on the hook by the front door.',
    concern_level: 'normal',
  },
  {
    label: 'medication',
    question_examples: ['Did I take my medication?', 'Have I had my pills?', 'When do I take my medicine?'],
    response_template: 'You took your morning medication at 8am with breakfast, {{name}}. Your next dose is at 8pm tonight.',
    concern_level: 'elevated',
  },
  {
    label: 'day_date',
    question_examples: ['What day is it?', "What is today's date?", 'What day of the week is it?'],
    response_template: 'Today is {{date}}.',
    concern_level: 'normal',
  },
  {
    label: 'caregiver_location',
    question_examples: ['Where is {{caregiver}}?', 'Where has {{caregiver}} gone?', 'When is {{caregiver}} coming back?'],
    response_template: '{{caregiver}} is nearby. They\'ll be with you soon, {{name}}.',
    concern_level: 'normal',
  },
  {
    label: 'meals',
    question_examples: ['Have I eaten?', 'Did I have breakfast?', 'When is lunch?'],
    response_template: '{{schedule}}',
    concern_level: 'normal',
  },
  {
    label: 'home_safety',
    question_examples: ['Is the door locked?', 'Did I leave the stove on?', 'Are the windows closed?'],
    response_template: 'Everything is safe and secure, {{name}}. The doors are locked.',
    concern_level: 'normal',
  },
  {
    label: 'wallet_location',
    question_examples: ['Where is my wallet?', "Have you seen my wallet?", "I can't find my wallet"],
    response_template: 'Your wallet is in the top drawer of your bedside table, {{name}}.',
    concern_level: 'normal',
  },
  {
    label: 'glasses_location',
    question_examples: ['Where are my glasses?', "Have you seen my glasses?", "I can't find my reading glasses"],
    response_template: 'Your glasses are on the side table next to your chair, {{name}}.',
    concern_level: 'normal',
  },
  {
    label: 'deceased_family',
    question_examples: ['Where is my mother?', 'When is dad coming?', 'I want to see my parents'],
    response_template: 'Your mother loved you very much, {{name}}. {{caregiver}} is here with you now.',
    concern_level: 'elevated',
  },
]

type ViewMode = 'list' | 'add' | 'library' | 'edit'

export default function DashboardAnchors() {
  const { patient, profile } = useAuth()
  const [anchors, setAnchors] = useState<Anchor[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')
  const [editAnchor, setEditAnchor] = useState<Anchor | null>(null)

  const [newExamples, setNewExamples] = useState<string[]>([])
  const [exampleInput, setExampleInput] = useState('')
  const [responseText, setResponseText] = useState('')
  const [label, setLabel] = useState('')
  const [concernLevel, setConcernLevel] = useState<'normal' | 'elevated'>('normal')
  const [photoUrl, setPhotoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const loadAnchors = useCallback(async () => {
    if (!patient) return
    try {
      const { data, error } = await supabase
        .from('anchors')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnchors((data ?? []) as Anchor[])
    } catch {
      // Failed to load
    } finally {
      setLoading(false)
    }
  }, [patient])

  useEffect(() => {
    loadAnchors()
  }, [loadAnchors])

  function resetForm() {
    setNewExamples([])
    setExampleInput('')
    setResponseText('')
    setLabel('')
    setConcernLevel('normal')
    setPhotoUrl('')
    setSaveError('')
    setEditAnchor(null)
  }

  function fillTemplate(template: string): string {
    return template
      .replace(/\{\{name\}\}/g, patient?.name ?? 'your loved one')
      .replace(/\{\{caregiver\}\}/g, profile?.full_name ?? 'your caregiver')
  }

  function addExample() {
    const trimmed = exampleInput.trim()
    if (trimmed && !newExamples.includes(trimmed)) {
      setNewExamples(prev => [...prev, trimmed])
      setExampleInput('')
    }
  }

  function removeExample(idx: number) {
    setNewExamples(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaveError('')

    if (newExamples.length === 0) {
      setSaveError('Add at least one question example.')
      return
    }
    if (!responseText.trim()) {
      setSaveError('Write a response for Mirsa to say.')
      return
    }

    setSaving(true)
    try {
      const anchorLabel = label.trim() || newExamples[0].toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30)

      const trimmedPhoto = photoUrl.trim() || null

      if (editAnchor) {
        const { error } = await supabase
          .from('anchors')
          .update({
            label: anchorLabel,
            question_examples: newExamples,
            response_text: responseText.trim(),
            concern_level: concernLevel,
            photo_url: trimmedPhoto,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editAnchor.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('anchors')
          .insert({
            patient_id: patient!.id,
            label: anchorLabel,
            question_examples: newExamples,
            response_text: responseText.trim(),
            concern_level: concernLevel,
            photo_url: trimmedPhoto,
            created_by_id: profile!.id,
          })

        if (error) throw error
      }

      resetForm()
      setView('list')
      await loadAnchors()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(anchorId: string) {
    try {
      const { error } = await supabase
        .from('anchors')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', anchorId)

      if (error) throw error
      await loadAnchors()
    } catch {
      // Delete failed
    }
  }

  function startEdit(anchor: Anchor) {
    setEditAnchor(anchor)
    setNewExamples([...anchor.question_examples])
    setResponseText(anchor.response_text)
    setLabel(anchor.label)
    setConcernLevel(anchor.concern_level)
    setPhotoUrl(anchor.photo_url ?? '')
    setView('edit')
  }

  function useStarter(starter: StarterQuestion) {
    const examples = starter.question_examples.map(q => fillTemplate(q))
    setNewExamples(examples)
    setResponseText(fillTemplate(starter.response_template))
    setLabel(starter.label)
    setConcernLevel(starter.concern_level)
    setView('add')
  }

  if (!patient || !profile) {
    return (
      <div className="pt-10 text-center">
        <p className="font-sans text-sm text-mirsa-muted">Loading...</p>
      </div>
    )
  }

  if (view === 'library') {
    const existing = new Set(anchors.map(a => a.label))
    const available = COMMON_QUESTIONS.filter(q => !existing.has(q.label))

    return (
      <div className="pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-xl font-semibold text-mirsa-text">
            Common questions
          </h1>
          <button
            onClick={() => setView('list')}
            className="font-sans text-sm text-mirsa-teal font-medium"
          >
            Back
          </button>
        </div>
        <p className="font-sans text-sm text-mirsa-muted">
          These are questions people with memory difficulties commonly ask.
          Tap one to customize the answer for {patient.name}.
        </p>

        {available.length === 0 ? (
          <div className="bg-white border border-mirsa-text/10 rounded-card p-6 text-center">
            <p className="font-sans text-sm text-mirsa-muted">
              You&apos;ve already added all the common questions. Nice work!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {available.map(q => (
              <button
                key={q.label}
                onClick={() => useStarter(q)}
                className="w-full text-left bg-white border border-mirsa-text/10 rounded-card p-5 hover:border-mirsa-teal/30 transition-colors"
              >
                <p className="font-sans text-sm font-medium text-mirsa-text mb-1">
                  &ldquo;{fillTemplate(q.question_examples[0])}&rdquo;
                </p>
                <p className="font-sans text-xs text-mirsa-muted">
                  {fillTemplate(q.response_template).slice(0, 80)}...
                </p>
                {q.concern_level === 'elevated' && (
                  <span className="inline-block mt-2 font-sans text-[10px] font-medium text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
                    Elevated concern
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (view === 'add' || view === 'edit') {
    return (
      <div className="pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-xl font-semibold text-mirsa-text">
            {view === 'edit' ? 'Edit question' : 'New question'}
          </h1>
          <button
            onClick={() => { resetForm(); setView('list') }}
            className="font-sans text-sm text-mirsa-teal font-medium"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block font-sans text-sm font-medium text-mirsa-text mb-2">
              How might {patient.name} ask this?
            </label>
            <p className="font-sans text-xs text-mirsa-muted mb-3">
              Add different ways they might phrase this question. Press Enter after each one.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={exampleInput}
                onChange={(e) => setExampleInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExample() } }}
                className="flex-1 font-sans text-sm border border-mirsa-text/15 rounded-xl px-4 py-2.5 text-mirsa-text placeholder:text-mirsa-muted/50 focus:outline-none focus:ring-2 focus:ring-mirsa-teal/30 focus:border-mirsa-teal"
                placeholder={`e.g. "Where are my keys?"`}
              />
              <button
                type="button"
                onClick={addExample}
                className="shrink-0 font-sans text-sm font-medium text-mirsa-teal border border-mirsa-teal/30 rounded-xl px-4 py-2.5 hover:bg-mirsa-teal/5 transition-colors"
              >
                Add
              </button>
            </div>
            {newExamples.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {newExamples.map((ex, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 font-sans text-xs text-mirsa-text bg-mirsa-teal/10 rounded-full px-3 py-1.5"
                  >
                    {ex}
                    <button
                      type="button"
                      onClick={() => removeExample(i)}
                      className="text-mirsa-muted hover:text-red-500 transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="responseText" className="block font-sans text-sm font-medium text-mirsa-text mb-2">
              What should Mirsa say back?
            </label>
            <p className="font-sans text-xs text-mirsa-muted mb-3">
              Write the answer in your own words — this is exactly what {patient.name} will hear.
            </p>
            <textarea
              id="responseText"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={3}
              className="w-full font-sans text-sm border border-mirsa-text/15 rounded-xl px-4 py-3 text-mirsa-text placeholder:text-mirsa-muted/50 focus:outline-none focus:ring-2 focus:ring-mirsa-teal/30 focus:border-mirsa-teal resize-none"
              placeholder={`e.g. "Your keys are on the hook by the front door, ${patient.name}."`}
            />
          </div>

          <div>
            <label htmlFor="photoUrl" className="block font-sans text-sm font-medium text-mirsa-text mb-2">
              Photo URL <span className="font-normal text-mirsa-muted">(optional)</span>
            </label>
            <p className="font-sans text-xs text-mirsa-muted mb-3">
              Paste a photo URL to show on the device when this answer is spoken.
              Upload photos in the Photos tab and copy the URL from there.
            </p>
            <input
              id="photoUrl"
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full font-sans text-sm border border-mirsa-text/15 rounded-xl px-4 py-2.5 text-mirsa-text placeholder:text-mirsa-muted/50 focus:outline-none focus:ring-2 focus:ring-mirsa-teal/30 focus:border-mirsa-teal"
              placeholder="https://...your-photo-url..."
            />
            {photoUrl.trim() && (
              <div className="mt-3 rounded-xl overflow-hidden border border-mirsa-text/10 bg-mirsa-text/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl.trim()}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-sans text-sm font-medium text-mirsa-text mb-2">
              Concern level
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConcernLevel('normal')}
                className={`flex-1 font-sans text-sm rounded-xl px-4 py-2.5 border transition-colors ${
                  concernLevel === 'normal'
                    ? 'border-mirsa-teal bg-mirsa-teal/10 text-mirsa-teal font-medium'
                    : 'border-mirsa-text/15 text-mirsa-muted'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setConcernLevel('elevated')}
                className={`flex-1 font-sans text-sm rounded-xl px-4 py-2.5 border transition-colors ${
                  concernLevel === 'elevated'
                    ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium'
                    : 'border-mirsa-text/15 text-mirsa-muted'
                }`}
              >
                Elevated
              </button>
            </div>
            <p className="font-sans text-xs text-mirsa-muted mt-1.5">
              Elevated questions send you a real-time alert when asked.
            </p>
          </div>

          {saveError && (
            <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">
              {saveError}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full font-sans text-sm font-medium text-white bg-mirsa-teal rounded-xl px-4 py-3 min-h-[48px] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving...' : view === 'edit' ? 'Update question' : 'Save question'}
          </button>

          {view === 'edit' && editAnchor && (
            <button
              type="button"
              onClick={async () => {
                await handleDelete(editAnchor.id)
                resetForm()
                setView('list')
              }}
              className="w-full font-sans text-sm font-medium text-red-600 bg-red-50 rounded-xl px-4 py-3 min-h-[48px] hover:bg-red-100 transition-colors"
            >
              Delete this question
            </button>
          )}
        </form>
      </div>
    )
  }

  return (
    <div className="pt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-mirsa-text">
          Questions &amp; Answers
        </h1>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { resetForm(); setView('add') }}
          className="flex-1 font-sans text-sm font-medium text-white bg-mirsa-teal rounded-xl px-4 py-3 min-h-[48px] hover:opacity-90 transition-opacity"
        >
          + Write your own
        </button>
        <button
          onClick={() => setView('library')}
          className="flex-1 font-sans text-sm font-medium text-mirsa-teal bg-white border border-mirsa-teal/30 rounded-xl px-4 py-3 min-h-[48px] hover:bg-mirsa-teal/5 transition-colors"
        >
          Common questions
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="font-sans text-sm text-mirsa-muted">Loading questions...</p>
        </div>
      ) : anchors.length === 0 ? (
        <div className="bg-white border border-mirsa-text/10 rounded-card p-8 text-center">
          <p className="font-serif text-base text-mirsa-text mb-2">
            No questions set up yet
          </p>
          <p className="font-sans text-sm text-mirsa-muted">
            Start by adding common questions that {patient.name} asks,
            or pick from the library of questions others have found helpful.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {anchors.map(anchor => (
            <button
              key={anchor.id}
              onClick={() => startEdit(anchor)}
              className="w-full text-left bg-white border border-mirsa-text/10 rounded-card p-5 hover:border-mirsa-teal/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-mirsa-text mb-1 truncate">
                    &ldquo;{anchor.question_examples[0]}&rdquo;
                  </p>
                  <p className="font-sans text-xs text-mirsa-muted line-clamp-2">
                    {anchor.response_text}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-sans text-[10px] text-mirsa-muted">
                      {anchor.question_examples.length} variation{anchor.question_examples.length !== 1 ? 's' : ''}
                    </span>
                    {anchor.photo_url && (
                      <span className="font-sans text-[10px] font-medium text-mirsa-teal bg-mirsa-teal/10 rounded-full px-2 py-0.5">
                        Has photo
                      </span>
                    )}
                    {anchor.concern_level === 'elevated' && (
                      <span className="font-sans text-[10px] font-medium text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
                        Elevated
                      </span>
                    )}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6b6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
