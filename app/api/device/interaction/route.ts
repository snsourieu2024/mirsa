import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface LogRequest {
  patient_id: string
  transcription: string
  matched_anchor_id: string | null
  classifier_confidence: number | null
  response_type: string
  response_text_delivered: string
  is_flagged: boolean
  caregiver_note: string | null
  alert_triggered: boolean
  occurred_at: string
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<{ ok: boolean }>> {
  try {
    const body = (await request.json()) as LogRequest

    if (!body.patient_id || !body.transcription) {
      return NextResponse.json({ ok: false })
    }

    const { error } = await supabaseAdmin
      .from('interactions')
      .insert({
        patient_id: body.patient_id,
        transcription: body.transcription,
        matched_anchor_id: body.matched_anchor_id,
        classifier_confidence: body.classifier_confidence,
        response_type: body.response_type,
        response_text_delivered: body.response_text_delivered,
        is_flagged: body.is_flagged,
        caregiver_note: body.caregiver_note,
        alert_triggered: body.alert_triggered,
        occurred_at: body.occurred_at,
      })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
