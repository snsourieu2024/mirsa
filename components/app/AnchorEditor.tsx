'use client'

import { useState, useCallback, type KeyboardEvent } from 'react'
import type { Anchor, ConcernLevel } from '@/types'
import { cn } from '@/lib/utils'

interface AnchorEditorProps {
  anchor: Partial<Anchor> | null
  onSave: (data: {
    label: string
    question_examples: string[]
    response_text: string
    concern_level: ConcernLevel
    photo_url: string | null
  }) => Promise<void>
  onClose: () => void
  prefillQuestion?: string
}

export function AnchorEditor({ anchor, onSave, onClose, prefillQuestion }: AnchorEditorProps) {
  const [label, setLabel] = useState(anchor?.label ?? '')
  const [examples, setExamples] = useState<string[]>(
    anchor?.question_examples ?? (prefillQuestion ? [prefillQuestion] : [])
  )
  const [inputValue, setInputValue] = useState('')
  const [responseText, setResponseText] = useState(anchor?.response_text ?? '')
  const [concernLevel, setConcernLevel] = useState<ConcernLevel>(
    anchor?.concern_level ?? 'normal'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault()
        setExamples(prev => [...prev, inputValue.trim()])
        setInputValue('')
      }
    },
    [inputValue]
  )

  const removeExample = useCallback((index: number) => {
    setExamples(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleSave = useCallback(async () => {
    if (!label.trim() || examples.length === 0 || !responseText.trim()) return
    setIsSaving(true)
    setSaveError(null)

    try {
      await onSave({
        label: label.trim().toLowerCase().replace(/\s+/g, '_'),
        question_examples: examples,
        response_text: responseText.trim(),
        concern_level: concernLevel,
        photo_url: anchor?.photo_url ?? null,
      })
    } catch {
      setSaveError('Failed to save anchor. Please try again.')
      setIsSaving(false)
    }
  }, [label, examples, responseText, concernLevel, anchor?.photo_url, onSave])

  const isValid = label.trim().length > 0 && examples.length > 0 && responseText.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-app bg-mirsa-bg rounded-t-[24px] p-6 max-h-[85vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sans text-lg font-semibold text-mirsa-text">
            {anchor?.id ? 'Edit anchor' : 'New anchor'}
          </h2>
          <button
            onClick={onClose}
            className="font-sans text-sm text-mirsa-muted hover:text-mirsa-text min-h-[48px] px-2"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider block mb-2">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. keys_location"
              className="w-full font-sans text-sm text-mirsa-text bg-white border border-mirsa-text/10 rounded-card px-4 py-3 focus:outline-none focus:border-mirsa-teal"
            />
          </div>

          <div>
            <label className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider block mb-2">
              Question examples
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {examples.map((ex, i) => (
                <span
                  key={`${ex}-${i}`}
                  className="font-sans text-xs text-mirsa-text bg-mirsa-teal/10 px-2.5 py-1 rounded-full flex items-center gap-1.5"
                >
                  {ex}
                  <button
                    onClick={() => removeExample(i)}
                    className="text-mirsa-muted hover:text-mirsa-text"
                    aria-label={`Remove "${ex}"`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a question and press Enter..."
              className="w-full font-sans text-sm text-mirsa-text bg-white border border-mirsa-text/10 rounded-card px-4 py-3 focus:outline-none focus:border-mirsa-teal"
            />
          </div>

          <div>
            <label className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider block mb-2">
              Response
            </label>
            <textarea
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder="Write the answer exactly as you'd say it to Robert..."
              rows={3}
              className="w-full font-sans text-sm text-mirsa-text bg-white border border-mirsa-text/10 rounded-card px-4 py-3 focus:outline-none focus:border-mirsa-teal resize-none"
            />
            <p className="font-sans text-xs text-mirsa-muted mt-1">
              Use {'{{date}}'} for today&apos;s date or {'{{schedule}}'} for today&apos;s plan
            </p>
          </div>

          <div>
            <label className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider block mb-2">
              Concern level
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setConcernLevel('normal')}
                className={cn(
                  'font-sans text-sm px-4 py-2.5 rounded-card border transition-colors min-h-[48px]',
                  concernLevel === 'normal'
                    ? 'border-mirsa-teal bg-mirsa-teal/10 text-mirsa-teal'
                    : 'border-mirsa-text/10 text-mirsa-muted'
                )}
              >
                Normal
              </button>
              <button
                onClick={() => setConcernLevel('elevated')}
                className={cn(
                  'font-sans text-sm px-4 py-2.5 rounded-card border transition-colors min-h-[48px]',
                  concernLevel === 'elevated'
                    ? 'border-mirsa-amber bg-mirsa-amber/10 text-mirsa-amber'
                    : 'border-mirsa-text/10 text-mirsa-muted'
                )}
              >
                Elevated
              </button>
            </div>
          </div>

          {saveError && (
            <p className="font-sans text-sm text-red-500 text-center">{saveError}</p>
          )}

          <button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className={cn(
              'w-full font-sans text-base font-medium py-4 rounded-card min-h-[56px] transition-colors',
              isValid && !isSaving
                ? 'bg-mirsa-teal text-white hover:opacity-90'
                : 'bg-mirsa-text/10 text-mirsa-muted cursor-not-allowed'
            )}
          >
            {isSaving ? 'Saving...' : anchor?.id ? 'Save changes' : 'Create anchor'}
          </button>
        </div>
      </div>
    </div>
  )
}
