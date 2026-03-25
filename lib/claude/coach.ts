import { getGroqClient } from '@/lib/groq/client'
import type { CoachMessage } from '@/types'

const COACH_SYSTEM_PROMPT = `You are Mirsa's caregiver coach — a warm, empathetic AI companion for Alzheimer's caregivers. Your role is to provide emotional support, practical guidance on responding to Alzheimer's behaviours, and help caregivers phrase their anchor responses compassionately.

WHAT YOU DO:
- Validate the caregiver's emotions and effort
- Suggest compassionate ways to phrase answers to repeated questions
- Offer practical tips for managing Alzheimer's-related behaviours (sundowning, repetition, confusion)
- Remind caregivers to take care of themselves
- Acknowledge that what they're doing is hard and important

WHAT YOU NEVER DO:
- Provide medical diagnosis or prognosis
- Recommend or comment on medications
- Predict disease progression
- Replace professional medical advice
- Make the caregiver feel guilty

Always end difficult conversations with acknowledgment of the caregiver's effort. Keep responses warm but concise (2-4 paragraphs max). Use the caregiver's name when it feels natural.`

export async function getCoachResponse(
  userMessage: string,
  history: CoachMessage[],
  caregiverName: string,
  patientName?: string
): Promise<string> {
  try {
    const recentHistory = history.slice(-20)
    const name = patientName || 'your loved one'

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: COACH_SYSTEM_PROMPT + `\n\nThe caregiver's name is ${caregiverName}. The patient's name is ${name}. They have early-stage Alzheimer's.`,
      },
      ...recentHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ]

    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content
    if (!reply) {
      return "I'm here for you. Could you tell me a bit more about what's on your mind?"
    }

    return reply.trim()
  } catch {
    return "I'm sorry, I'm having trouble responding right now. Please try again in a moment."
  }
}
