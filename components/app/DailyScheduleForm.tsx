'use client'

import { useState, useCallback } from 'react'
import type { DailySchedule } from '@/types'

interface DailyScheduleFormProps {
  schedule: DailySchedule | null
  onSave: (schedule: Partial<DailySchedule>) => void
}

export function DailyScheduleForm({ schedule, onSave }: DailyScheduleFormProps) {
  const [breakfast, setBreakfast] = useState(schedule?.breakfast ?? '')
  const [lunch, setLunch] = useState(schedule?.lunch ?? '')
  const [dinner, setDinner] = useState(schedule?.dinner ?? '')
  const [visitors, setVisitors] = useState(schedule?.visitors ?? '')
  const [activities, setActivities] = useState(schedule?.activities ?? '')

  const handleSave = useCallback(() => {
    onSave({ breakfast, lunch, dinner, visitors, activities })
  }, [breakfast, lunch, dinner, visitors, activities, onSave])

  return (
    <div className="space-y-4">
      {[
        { label: 'Breakfast', value: breakfast, onChange: setBreakfast },
        { label: 'Lunch', value: lunch, onChange: setLunch },
        { label: 'Dinner', value: dinner, onChange: setDinner },
        { label: 'Visitors', value: visitors, onChange: setVisitors },
        { label: 'Activities', value: activities, onChange: setActivities },
      ].map(field => (
        <div key={field.label}>
          <label className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider block mb-1">
            {field.label}
          </label>
          <input
            type="text"
            value={field.value}
            onChange={e => field.onChange(e.target.value)}
            className="w-full font-sans text-sm text-mirsa-text bg-white border border-mirsa-text/10 rounded-card px-4 py-3 focus:outline-none focus:border-mirsa-teal"
          />
        </div>
      ))}
      <button
        onClick={handleSave}
        className="w-full bg-mirsa-teal text-white font-sans text-sm font-medium py-3 rounded-card min-h-[48px] hover:opacity-90 transition-opacity"
      >
        Save schedule
      </button>
    </div>
  )
}
