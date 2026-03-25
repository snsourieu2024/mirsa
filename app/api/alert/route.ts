import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import type { Alert, AlertResponse } from '@/types'

export async function GET(
  request: NextRequest
): Promise<NextResponse<{ alerts: Alert[] }>> {
  try {
    const patientId = request.nextUrl.searchParams.get('patientId')
    if (!patientId) {
      return NextResponse.json({ alerts: [] })
    }

    const { data, error } = await supabaseAdmin
      .from('alerts')
      .select('*')
      .eq('patient_id', patientId)
      .order('triggered_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ alerts: (data as Alert[]) ?? [] })
  } catch {
    return NextResponse.json({ alerts: [] })
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<AlertResponse>> {
  try {
    const body = (await request.json()) as {
      patient_id: string
      alert_type: 'elevated_anchor' | 'unmatched_cluster'
      detail: string
      is_critical: boolean
    }

    if (!body.patient_id || !body.alert_type || !body.detail) {
      return NextResponse.json({ alert: null })
    }

    const { data, error } = await supabaseAdmin
      .from('alerts')
      .insert({
        patient_id: body.patient_id,
        alert_type: body.alert_type,
        detail: body.detail,
        is_critical: body.is_critical ?? false,
        acknowledged: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ alert: data as Alert })
  } catch {
    return NextResponse.json({ alert: null })
  }
}

export async function PATCH(
  request: NextRequest
): Promise<NextResponse<AlertResponse>> {
  try {
    const body = (await request.json()) as { alertId: string }
    if (!body.alertId) {
      return NextResponse.json({ alert: null })
    }

    const { data, error } = await supabaseAdmin
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', body.alertId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ alert: data as Alert })
  } catch {
    return NextResponse.json({ alert: null })
  }
}
