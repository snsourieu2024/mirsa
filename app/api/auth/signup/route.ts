import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface SignupRequest {
  email: string
  password: string
  fullName: string
  patientName: string
}

interface SignupResponse {
  ok: boolean
  error?: string
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createClient(url, serviceKey)
}

export async function POST(request: Request): Promise<NextResponse<SignupResponse>> {
  try {
    const body = (await request.json()) as SignupRequest
    const { email, password, fullName, patientName } = body

    if (!email || !password || !fullName || !patientName) {
      return NextResponse.json(
        { ok: false, error: 'All fields are required.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    const admin = getServiceClient()

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message?.includes('already been registered')) {
        return NextResponse.json(
          { ok: false, error: 'An account with this email already exists.' },
          { status: 409 }
        )
      }
      throw authError
    }

    if (!authData.user) {
      throw new Error('Auth user was not created')
    }

    const deviceToken = `device_${crypto.randomUUID().slice(0, 8)}`

    const { data: patient, error: patientErr } = await admin
      .from('patients')
      .insert({ name: patientName, device_token: deviceToken })
      .select('id')
      .single()

    if (patientErr) throw patientErr

    const { error: profileErr } = await admin
      .from('caregiver_profiles')
      .insert({
        full_name: fullName,
        email,
        patient_id: patient.id,
        role: 'owner',
      })

    if (profileErr) throw profileErr

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signup failed'
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
