import type { DailySchedule } from '@/types'

export function buildReminders(schedule: DailySchedule | null): string[] {
  if (!schedule) return []
  const reminders: string[] = []

  if (schedule.breakfast) reminders.push(`Breakfast: ${schedule.breakfast}`)
  if (schedule.lunch) reminders.push(`Lunch: ${schedule.lunch}`)
  if (schedule.dinner) reminders.push(`Dinner: ${schedule.dinner}`)
  if (schedule.visitors) reminders.push(schedule.visitors)
  if (schedule.activities) reminders.push(schedule.activities)

  return reminders
}

export function replaceSchedulePlaceholder(
  text: string,
  schedule: DailySchedule | null
): string {
  if (!text.includes('{{schedule}}') && !text.includes('{{date}}')) return text

  let result = text

  if (result.includes('{{date}}')) {
    const dateStr = new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    result = result.replace(/\{\{date\}\}/g, dateStr)
  }

  if (result.includes('{{schedule}}') && schedule) {
    const parts: string[] = []
    if (schedule.breakfast) parts.push(`Breakfast at ${schedule.breakfast}`)
    if (schedule.lunch) parts.push(`Lunch at ${schedule.lunch}`)
    if (schedule.dinner) parts.push(`Dinner at ${schedule.dinner}`)
    if (schedule.visitors) parts.push(schedule.visitors)
    if (schedule.activities) parts.push(schedule.activities)
    result = result.replace(/\{\{schedule\}\}/g, parts.join('. ') || 'Nothing scheduled for today.')
  } else if (result.includes('{{schedule}}')) {
    result = result.replace(/\{\{schedule\}\}/g, 'Nothing scheduled for today.')
  }

  return result
}
