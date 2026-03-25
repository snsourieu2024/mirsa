import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import type { ExportResponse, Interaction, Patient } from '@/types'

export async function GET(
  request: NextRequest
): Promise<NextResponse<ExportResponse | { error: string }>> {
  try {
    const patientId = request.nextUrl.searchParams.get('patientId')
    const days = parseInt(request.nextUrl.searchParams.get('days') ?? '30', 10)

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      )
    }

    const start = new Date()
    start.setDate(start.getDate() - days)

    const [patientResult, interactionsResult] = await Promise.all([
      supabaseAdmin
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single(),
      supabaseAdmin
        .from('interactions')
        .select('*')
        .eq('patient_id', patientId)
        .gte('occurred_at', start.toISOString())
        .order('occurred_at', { ascending: true }),
    ])

    if (patientResult.error) throw patientResult.error
    if (interactionsResult.error) throw interactionsResult.error

    return NextResponse.json({
      patient: patientResult.data as Patient,
      interactions: (interactionsResult.data as Interaction[]) ?? [],
      period: {
        start: start.toISOString(),
        end: new Date().toISOString(),
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}
