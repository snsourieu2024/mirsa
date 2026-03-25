import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface EnvCheck {
  present: boolean
}

interface HealthResult {
  ok: boolean
  env: Record<string, EnvCheck>
  missing: string[]
  supabase: {
    connected: boolean
    patientCount: number | null
    error: string | null
  }
  seed: {
    patients: boolean
    caregivers: boolean
    anchors: boolean
    interactions: boolean
    weeklySummaries: boolean
    alerts: boolean
  }
}

export async function GET(): Promise<NextResponse<HealthResult>> {
  const envChecks: Record<string, EnvCheck> = {
    NEXT_PUBLIC_SUPABASE_URL: {
      present: !!(process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https')),
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    ANTHROPIC_API_KEY: {
      present: !!process.env.ANTHROPIC_API_KEY,
    },
    GROQ_API_KEY: {
      present: !!process.env.GROQ_API_KEY,
    },
    NEXT_PUBLIC_DEMO_PATIENT_ID: {
      present: !!process.env.NEXT_PUBLIC_DEMO_PATIENT_ID,
    },
    NEXT_PUBLIC_DEMO_CAREGIVER_ID: {
      present: !!process.env.NEXT_PUBLIC_DEMO_CAREGIVER_ID,
    },
    NEXT_PUBLIC_DEMO_SECONDARY_CAREGIVER_ID: {
      present: !!process.env.NEXT_PUBLIC_DEMO_SECONDARY_CAREGIVER_ID,
    },
    DEMO_MODE: {
      present: !!process.env.DEMO_MODE,
    },
    NEXT_PUBLIC_APP_URL: {
      present: !!process.env.NEXT_PUBLIC_APP_URL,
    },
  }

  const missing = Object.entries(envChecks)
    .filter(([key, val]) => !val.present && key !== 'NEXT_PUBLIC_APP_URL')
    .map(([key]) => key)

  let supabaseStatus = { connected: false, patientCount: null as number | null, error: null as string | null }
  const seedStatus = {
    patients: false,
    caregivers: false,
    anchors: false,
    interactions: false,
    weeklySummaries: false,
    alerts: false,
  }

  try {
    const { count: patientCount, error: patErr } = await supabaseAdmin
      .from('patients')
      .select('id', { count: 'exact', head: true })

    if (patErr) {
      supabaseStatus = { connected: false, patientCount: null, error: patErr.message }
    } else {
      supabaseStatus = { connected: true, patientCount: patientCount ?? 0, error: null }
      seedStatus.patients = (patientCount ?? 0) >= 1

      const [cgRes, anchorRes, interRes, summaryRes, alertRes] = await Promise.all([
        supabaseAdmin.from('caregiver_profiles').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('anchors').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('interactions').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('weekly_summaries').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('alerts').select('id', { count: 'exact', head: true }).eq('acknowledged', false),
      ])

      seedStatus.caregivers = (cgRes.count ?? 0) >= 2
      seedStatus.anchors = (anchorRes.count ?? 0) >= 10
      seedStatus.interactions = (interRes.count ?? 0) >= 40
      seedStatus.weeklySummaries = (summaryRes.count ?? 0) >= 1
      seedStatus.alerts = (alertRes.count ?? 0) >= 1
    }
  } catch (err) {
    supabaseStatus = {
      connected: false,
      patientCount: null,
      error: err instanceof Error ? err.message : 'Connection failed',
    }
  }

  const allEnvOk = missing.length === 0
  const allSeedOk = Object.values(seedStatus).every(Boolean)

  return NextResponse.json({
    ok: allEnvOk && supabaseStatus.connected && allSeedOk,
    env: envChecks,
    missing,
    supabase: supabaseStatus,
    seed: seedStatus,
  })
}
