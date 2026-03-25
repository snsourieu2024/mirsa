import { getGroqClient } from '@/lib/groq/client'

interface SummaryStats {
  patientName: string
  caregiverName: string
  totalInteractions: number
  previousWeekTotal: number
  topAnchorLabel: string
  topAnchorCount: number
  topAnchorTimePattern: string
  newPatterns: string[]
  settledTimeOfDay: string
  unmatchedCount: number
}

export async function generateWeeklySummary(stats: SummaryStats): Promise<string> {
  try {
    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: `You are writing a weekly summary for an Alzheimer's caregiver. Write 3-5 sentences as a warm, compassionate letter. Use only the data provided — no medical inference, no speculation, no advice.

Data:
- Patient: ${stats.patientName}
- Caregiver: ${stats.caregiverName}
- Total conversations this week: ${stats.totalInteractions}
- Last week: ${stats.previousWeekTotal}
- Most asked topic: "${stats.topAnchorLabel}" (${stats.topAnchorCount} times, ${stats.topAnchorTimePattern})
- New patterns: ${stats.newPatterns.length > 0 ? stats.newPatterns.join(', ') : 'None'}
- Most settled time: ${stats.settledTimeOfDay}
- Unanswered questions: ${stats.unmatchedCount}

Write the summary as a direct address to ${stats.caregiverName}. End with acknowledgment of their effort. No bullet points, no headers — flowing prose only.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content
    if (!reply) {
      return 'Summary could not be generated at this time.'
    }

    return reply.trim()
  } catch {
    return 'Summary could not be generated at this time.'
  }
}
