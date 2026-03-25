import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getCoachResponse } from '@/lib/claude/coach'
import type { CoachResponse, CoachMessage, CoachConversation } from '@/types'

export async function GET(
  request: NextRequest
): Promise<NextResponse<{ messages: CoachMessage[] }>> {
  try {
    const caregiverId = request.nextUrl.searchParams.get('caregiverId')
    if (!caregiverId) {
      return NextResponse.json({ messages: [] })
    }

    const { data, error } = await supabaseAdmin
      .from('coach_conversations')
      .select('*')
      .eq('caregiver_id', caregiverId)
      .single()

    if (error) throw error

    const conversation = data as CoachConversation
    return NextResponse.json({ messages: conversation.messages })
  } catch {
    return NextResponse.json({ messages: [] })
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CoachResponse>> {
  try {
    const body = (await request.json()) as {
      caregiverId: string
      caregiverName: string
      message: string
    }

    if (!body.caregiverId || !body.message) {
      return NextResponse.json({ message: '' })
    }

    const { data: caregiverRow } = await supabaseAdmin
      .from('caregiver_profiles')
      .select('full_name, patient_id')
      .eq('id', body.caregiverId)
      .single()

    let resolvedCaregiverName = body.caregiverName || 'there'
    let resolvedPatientName = 'your loved one'

    if (caregiverRow) {
      resolvedCaregiverName = caregiverRow.full_name || resolvedCaregiverName

      const { data: patientRow } = await supabaseAdmin
        .from('patients')
        .select('name')
        .eq('id', caregiverRow.patient_id)
        .single()

      if (patientRow) {
        resolvedPatientName = patientRow.name
      }
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('coach_conversations')
      .select('*')
      .eq('caregiver_id', body.caregiverId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

    const conversation = existing as CoachConversation | null
    const history: CoachMessage[] = conversation?.messages ?? []

    const responseText = await getCoachResponse(
      body.message,
      history,
      resolvedCaregiverName,
      resolvedPatientName
    )

    const now = new Date().toISOString()
    const updatedMessages: CoachMessage[] = [
      ...history,
      { role: 'user', content: body.message, timestamp: now },
      { role: 'assistant', content: responseText, timestamp: now },
    ]

    if (conversation) {
      const { error: updateError } = await supabaseAdmin
        .from('coach_conversations')
        .update({
          messages: updatedMessages as unknown as Record<string, unknown>[],
          updated_at: now,
        })
        .eq('caregiver_id', body.caregiverId)

      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('coach_conversations')
        .insert({
          caregiver_id: body.caregiverId,
          messages: updatedMessages as unknown as Record<string, unknown>[],
        })

      if (insertError) throw insertError
    }

    return NextResponse.json({ message: responseText })
  } catch {
    return NextResponse.json({
      message: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
    })
  }
}
