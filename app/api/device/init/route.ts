import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import type { Patient, CaregiverProfile, Anchor, DailySchedule } from '@/types'

interface DeviceInitResponse {
  patient: Patient | null
  caregiver: CaregiverProfile | null
  anchors: Anchor[]
  schedule: DailySchedule | null
  error?: string
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<DeviceInitResponse>> {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({
        patient: null,
        caregiver: null,
        anchors: [],
        schedule: null,
        error: 'no_token',
      })
    }

    const { data: patientData, error: patientErr } = await supabaseAdmin
      .from('patients')
      .select('*')
      .eq('device_token', token)
      .single()

    if (patientErr || !patientData) {
      return NextResponse.json({
        patient: null,
        caregiver: null,
        anchors: [],
        schedule: null,
        error: 'not_found',
      })
    }

    const patient = patientData as Patient

    const [cgResult, anchorsResult, scheduleResult] = await Promise.all([
      supabaseAdmin
        .from('caregiver_profiles')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('role', 'owner')
        .limit(1)
        .single(),

      supabaseAdmin
        .from('anchors')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('is_active', true),

      supabaseAdmin
        .from('daily_schedules')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('schedule_date', new Date().toISOString().split('T')[0])
        .single(),
    ])

    return NextResponse.json({
      patient,
      caregiver: (cgResult.data as CaregiverProfile) ?? null,
      anchors: (anchorsResult.data as Anchor[]) ?? [],
      schedule: scheduleResult.error ? null : (scheduleResult.data as DailySchedule),
    })
  } catch {
    return NextResponse.json({
      patient: null,
      caregiver: null,
      anchors: [],
      schedule: null,
      error: 'server_error',
    })
  }
}
