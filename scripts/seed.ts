import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load env vars from .env.local
function loadEnv(): void {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    process.stdout.write('ERROR: .env.local not found. Copy .env.example to .env.local first.\n')
    process.exit(1)
  }
  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  process.stdout.write('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY\n')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const PATIENT_ID = '00000000-0000-0000-0000-000000000001'
const MARGARET_ID = '00000000-0000-0000-0000-000000000002'
const SARAH_ID = '00000000-0000-0000-0000-000000000003'

const ANCHOR_IDS = {
  keys_location: '00000000-0000-0000-0000-0000000000a1',
  medication: '00000000-0000-0000-0000-0000000000a2',
  day_date: '00000000-0000-0000-0000-0000000000a3',
  daily_schedule: '00000000-0000-0000-0000-0000000000a4',
  caregiver_location: '00000000-0000-0000-0000-0000000000a5',
  meals: '00000000-0000-0000-0000-0000000000a6',
  visitors: '00000000-0000-0000-0000-0000000000a7',
  home_safety: '00000000-0000-0000-0000-0000000000a8',
  time_of_day: '00000000-0000-0000-0000-0000000000a9',
  deceased_family: '00000000-0000-0000-0000-0000000000aa',
  wallet_location: '00000000-0000-0000-0000-0000000000ab',
  glasses_location: '00000000-0000-0000-0000-0000000000ac',
} as const

type AnchorLabel = keyof typeof ANCHOR_IDS

const ANCHORS: Array<{
  id: string
  label: AnchorLabel
  question_examples: string[]
  response_text: string
  concern_level: 'normal' | 'elevated'
}> = [
  {
    id: ANCHOR_IDS.keys_location,
    label: 'keys_location',
    question_examples: ['Where are my keys?', 'Have you seen my keys?', "I can't find my keys", 'Where did I put my keys?'],
    response_text: 'Robert, your keys are on the hook by the front door.',
    concern_level: 'normal',
  },
  {
    id: ANCHOR_IDS.medication,
    label: 'medication',
    question_examples: ['Did I take my medication?', 'Have I had my pills?', 'When do I take my medicine?', 'Did I already take that?'],
    response_text: 'You took your morning medication at 8am with breakfast. Your next dose is at 8pm tonight.',
    concern_level: 'elevated',
  },
  {
    id: ANCHOR_IDS.day_date,
    label: 'day_date',
    question_examples: ['What day is it?', "What is today's date?", 'What day of the week is it?', 'Is it Monday?'],
    response_text: 'Today is {{date}}.',
    concern_level: 'normal',
  },
  {
    id: ANCHOR_IDS.daily_schedule,
    label: 'daily_schedule',
    question_examples: ["What's happening today?", 'What are we doing today?', 'Do I have anything on today?', "What's the plan for today?"],
    response_text: '{{schedule}}',
    concern_level: 'normal',
  },
  {
    id: ANCHOR_IDS.caregiver_location,
    label: 'caregiver_location',
    question_examples: ['Where is Margaret?', 'Where has Margaret gone?', 'When is Margaret coming back?', 'Where is my wife?'],
    response_text: "Margaret is nearby. She'll be with you soon, Robert.",
    concern_level: 'normal',
  },
  {
    id: ANCHOR_IDS.meals,
    label: 'meals',
    question_examples: ['Have I eaten?', 'Did I have breakfast?', 'When is lunch?', "What's for dinner?"],
    response_text: '{{schedule}}',
    concern_level: 'normal',
  },
  {
    id: ANCHOR_IDS.visitors,
    label: 'visitors',
    question_examples: ['Is anyone coming today?', 'Who is visiting?', 'When is Sarah coming?', 'Are the grandchildren coming?'],
    response_text: '{{schedule}}',
    concern_level: 'normal',
  },
  {
    id: ANCHOR_IDS.home_safety,
    label: 'home_safety',
    question_examples: ['Is the door locked?', 'Did I leave the stove on?', 'Is the house locked up?', 'Are the windows closed?'],
    response_text: 'Everything is safe and secure, Robert. The doors are locked.',
    concern_level: 'normal',
  },
  {
    id: ANCHOR_IDS.time_of_day,
    label: 'time_of_day',
    question_examples: ['What time is it?', 'Is it morning or afternoon?', 'How long until dinner?', 'Is it bedtime?'],
    response_text: 'Today is {{date}}.',
    concern_level: 'normal',
  },
  {
    id: ANCHOR_IDS.deceased_family,
    label: 'deceased_family',
    question_examples: ['Where is my mother?', 'When is dad coming?', 'I want to see my parents', 'Where has mother gone?'],
    response_text: 'Your mother loved you very much, Robert. Margaret is here with you now.',
    concern_level: 'elevated',
  },
  {
    id: ANCHOR_IDS.wallet_location,
    label: 'wallet_location',
    question_examples: ['Where is my wallet?', 'Have you seen my wallet?', "I can't find my wallet", 'Where did I leave my wallet?'],
    response_text: 'Your wallet is in the top drawer of your bedside table, Robert.',
    concern_level: 'normal',
  },
  {
    id: ANCHOR_IDS.glasses_location,
    label: 'glasses_location',
    question_examples: ['Where are my glasses?', 'Have you seen my glasses?', "I can't find my reading glasses", 'Where did I put my glasses?'],
    response_text: 'Your glasses are on the side table next to your chair, Robert.',
    concern_level: 'normal',
  },
]

function randomDate(daysAgo: number, hourMin: number, hourMax: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hourMin + Math.floor(Math.random() * (hourMax - hourMin)))
  d.setMinutes(Math.floor(Math.random() * 60))
  d.setSeconds(Math.floor(Math.random() * 60))
  return d.toISOString()
}

function generateInteractions(): Array<Record<string, unknown>> {
  const interactions: Array<Record<string, unknown>> = []
  const anchorLabels = Object.keys(ANCHOR_IDS) as AnchorLabel[]

  const transcripts: Record<AnchorLabel, string[]> = {
    keys_location: ['Where are my keys?', 'Have you seen my keys?', "I can't find my keys"],
    medication: ['Did I take my medication?', 'Have I had my pills today?'],
    day_date: ['What day is it?', "What's today's date?"],
    daily_schedule: ["What's happening today?", 'What are we doing today?'],
    caregiver_location: ['Where is Margaret?', 'Where is my wife?'],
    meals: ['Have I eaten?', 'When is lunch?'],
    visitors: ['Is anyone coming today?', 'When is Sarah coming?'],
    home_safety: ['Is the door locked?', 'Did I leave the stove on?'],
    time_of_day: ['What time is it?', 'Is it morning or afternoon?'],
    deceased_family: ['Where is my mother?', 'When is dad coming?'],
    wallet_location: ['Where is my wallet?', "I can't find my wallet"],
    glasses_location: ['Where are my glasses?', 'Have you seen my glasses?'],
  }

  const unmatchedTranscripts = [
    "What's on television tonight?",
    'Can I go outside?',
    'Where are we going?',
    'Who was that on the phone?',
    'When can I drive again?',
    "What happened to my dog?",
    "Where's the newspaper?",
    "Why is it so cold in here?",
  ]

  const fallbacks: Array<'fallback_a' | 'fallback_b' | 'fallback_c'> = ['fallback_a', 'fallback_b', 'fallback_c']

  // Generate 47 interactions over 3 weeks
  // Week 1 (14-21 days ago): ~10 interactions
  // Week 2 (7-13 days ago): ~15 interactions
  // Week 3 (0-6 days ago): ~22 interactions (increasing trend)

  // Week 1
  for (let i = 0; i < 10; i++) {
    const daysAgo = 14 + Math.floor(Math.random() * 7)
    const label = anchorLabels[Math.floor(Math.random() * anchorLabels.length)]
    const anchor = ANCHORS.find((a) => a.label === label)!
    const transcript = transcripts[label][Math.floor(Math.random() * transcripts[label].length)]

    interactions.push({
      patient_id: PATIENT_ID,
      occurred_at: randomDate(daysAgo, 9, 17),
      transcription: transcript,
      matched_anchor_id: ANCHOR_IDS[label],
      classifier_confidence: 0.88 + Math.random() * 0.12,
      response_type: 'anchor',
      response_text_delivered: anchor.response_text,
      is_flagged: false,
      alert_triggered: anchor.concern_level === 'elevated',
    })
  }

  // Week 2
  for (let i = 0; i < 15; i++) {
    const daysAgo = 7 + Math.floor(Math.random() * 7)
    const isUnmatched = i >= 13

    if (isUnmatched) {
      const transcript = unmatchedTranscripts[Math.floor(Math.random() * unmatchedTranscripts.length)]
      const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)]
      interactions.push({
        patient_id: PATIENT_ID,
        occurred_at: randomDate(daysAgo, 10, 16),
        transcription: transcript,
        matched_anchor_id: null,
        classifier_confidence: 0.3 + Math.random() * 0.4,
        response_type: fallback,
        response_text_delivered:
          fallback === 'fallback_a'
            ? "That's a good question. Margaret knows the answer — she'll be back soon."
            : fallback === 'fallback_b'
              ? "I'm not sure about that one, but you're safe and everything is okay."
              : "Let me get Margaret for you. She won't be long.",
        is_flagged: false,
        alert_triggered: false,
      })
    } else {
      const label = anchorLabels[Math.floor(Math.random() * anchorLabels.length)]
      const anchor = ANCHORS.find((a) => a.label === label)!
      const transcript = transcripts[label][Math.floor(Math.random() * transcripts[label].length)]
      interactions.push({
        patient_id: PATIENT_ID,
        occurred_at: randomDate(daysAgo, 10, 18),
        transcription: transcript,
        matched_anchor_id: ANCHOR_IDS[label],
        classifier_confidence: 0.87 + Math.random() * 0.13,
        response_type: 'anchor',
        response_text_delivered: anchor.response_text,
        is_flagged: false,
        alert_triggered: anchor.concern_level === 'elevated',
      })
    }
  }

  // Week 3 (this week) — 22 interactions with afternoon cluster
  for (let i = 0; i < 19; i++) {
    const daysAgo = Math.floor(Math.random() * 7)
    const label = i < 12 ? ('keys_location' as AnchorLabel) : anchorLabels[Math.floor(Math.random() * anchorLabels.length)]
    const anchor = ANCHORS.find((a) => a.label === label)!
    const transcript = transcripts[label][Math.floor(Math.random() * transcripts[label].length)]

    // Afternoon cluster: 70% of interactions between 1pm-3pm
    const isAfternoon = Math.random() < 0.7
    const hourMin = isAfternoon ? 13 : 8
    const hourMax = isAfternoon ? 15 : 18

    interactions.push({
      patient_id: PATIENT_ID,
      occurred_at: randomDate(daysAgo, hourMin, hourMax),
      transcription: transcript,
      matched_anchor_id: ANCHOR_IDS[label],
      classifier_confidence: 0.88 + Math.random() * 0.12,
      response_type: 'anchor',
      response_text_delivered: anchor.response_text,
      is_flagged: false,
      alert_triggered: anchor.concern_level === 'elevated',
    })
  }

  // 3 unmatched interactions TODAY — for teach-this demo flow
  const todayUnmatched = ["What's on television tonight?", 'Can I go outside for a walk?', "Where's the newspaper?"]
  for (const transcript of todayUnmatched) {
    const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)]
    interactions.push({
      patient_id: PATIENT_ID,
      occurred_at: randomDate(0, 10, 16),
      transcription: transcript,
      matched_anchor_id: null,
      classifier_confidence: 0.2 + Math.random() * 0.3,
      response_type: fallback,
      response_text_delivered:
        fallback === 'fallback_a'
          ? "That's a good question. Margaret knows the answer — she'll be back soon."
          : fallback === 'fallback_b'
            ? "I'm not sure about that one, but you're safe and everything is okay."
            : "Let me get Margaret for you. She won't be long.",
      is_flagged: false,
      alert_triggered: false,
    })
  }

  return interactions
}

async function seed(): Promise<void> {
  process.stdout.write('Mirsa seed script starting...\n')

  // Check if demo data exists
  const { data: existing } = await supabase.from('patients').select('id').eq('id', PATIENT_ID).single()

  if (existing) {
    process.stdout.write('Demo data already exists. Skipping seed.\n')
    printIds()
    return
  }

  // 1. Patient
  process.stdout.write('Creating patient Robert...\n')
  const { error: patientErr } = await supabase.from('patients').insert({
    id: PATIENT_ID,
    name: 'Robert',
    device_token: 'mirsa-demo-device',
  })
  if (patientErr) throw patientErr

  // 2. Caregivers
  process.stdout.write('Creating caregivers Margaret & Sarah...\n')
  const { error: caregiverErr } = await supabase.from('caregiver_profiles').insert([
    {
      id: MARGARET_ID,
      full_name: 'Margaret',
      email: 'margaret@mirsa.app',
      patient_id: PATIENT_ID,
      role: 'owner',
    },
    {
      id: SARAH_ID,
      full_name: 'Sarah',
      email: 'sarah@mirsa.app',
      patient_id: PATIENT_ID,
      role: 'caregiver',
    },
  ])
  if (caregiverErr) throw caregiverErr

  // 3. Anchors
  process.stdout.write('Creating 12 anchors...\n')
  const anchorRows = ANCHORS.map((a) => ({
    id: a.id,
    patient_id: PATIENT_ID,
    label: a.label,
    question_examples: a.question_examples,
    response_text: a.response_text,
    concern_level: a.concern_level,
    is_active: true,
    created_by_id: MARGARET_ID,
  }))
  const { error: anchorErr } = await supabase.from('anchors').insert(anchorRows)
  if (anchorErr) throw anchorErr

  // 4. Daily schedule
  process.stdout.write("Creating today's schedule...\n")
  const today = new Date().toISOString().split('T')[0]
  const { error: scheduleErr } = await supabase.from('daily_schedules').insert({
    patient_id: PATIENT_ID,
    schedule_date: today,
    breakfast: '8:00am',
    lunch: '12:30pm',
    dinner: '6:00pm',
    visitors: 'Sarah is visiting this Sunday',
    activities: null,
  })
  if (scheduleErr) throw scheduleErr

  // 5. Interactions
  process.stdout.write('Creating 47 interactions...\n')
  const interactions = generateInteractions()
  const { error: intErr } = await supabase.from('interactions').insert(interactions)
  if (intErr) throw intErr

  // 6. Alerts
  process.stdout.write('Creating alerts...\n')
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(14, 30, 0, 0)

  const todayAlert = new Date()
  todayAlert.setHours(14, 14, 0, 0)

  const { error: alertErr } = await supabase.from('alerts').insert([
    {
      patient_id: PATIENT_ID,
      alert_type: 'elevated_anchor',
      detail: 'Robert asked about his medication: "Did I take my medication?"',
      triggered_at: yesterday.toISOString(),
      is_critical: true,
      acknowledged: true,
    },
    {
      patient_id: PATIENT_ID,
      alert_type: 'elevated_anchor',
      detail: 'Robert asked about his medication: "Have I had my pills today?"',
      triggered_at: todayAlert.toISOString(),
      is_critical: true,
      acknowledged: false,
    },
  ])
  if (alertErr) throw alertErr

  // 7. Weekly summary
  process.stdout.write('Creating weekly summary...\n')
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const { error: summaryErr } = await supabase.from('weekly_summaries').insert({
    patient_id: PATIENT_ID,
    week_start: weekStart.toISOString().split('T')[0],
    summary_text:
      "Robert had 34 conversations with Mirsa this week, up from 27 the week before. He asked about his keys most often \u2014 12 times \u2014 usually between 1pm and 3pm. He asked about his mother twice this week, which is new. His most settled time of day was the morning, before 10am. Margaret, you answered every one of those questions before you even knew he\u2019d asked.",
    total_interactions: 34,
    unmatched_count: 5,
  })
  if (summaryErr) throw summaryErr

  // 8. Empty coach conversation
  process.stdout.write('Creating coach conversation...\n')
  const { error: coachErr } = await supabase.from('coach_conversations').insert({
    caregiver_id: MARGARET_ID,
    messages: [],
  })
  if (coachErr) throw coachErr

  process.stdout.write('\nSeed complete!\n')
  printIds()
}

function printIds(): void {
  process.stdout.write('\n--- Add these to your .env.local ---\n')
  process.stdout.write(`DEMO_PATIENT_ID=${PATIENT_ID}\n`)
  process.stdout.write(`DEMO_CAREGIVER_ID=${MARGARET_ID}\n`)
  process.stdout.write(`DEMO_SECONDARY_CAREGIVER_ID=${SARAH_ID}\n`)
  process.stdout.write(`NEXT_PUBLIC_DEMO_PATIENT_ID=${PATIENT_ID}\n`)
  process.stdout.write(`NEXT_PUBLIC_DEMO_CAREGIVER_ID=${MARGARET_ID}\n`)
  process.stdout.write(`NEXT_PUBLIC_DEMO_SECONDARY_CAREGIVER_ID=${SARAH_ID}\n`)
  process.stdout.write('---\n')
}

seed().catch((err: Error) => {
  process.stderr.write(`Seed failed: ${err.message}\n`)
  process.exit(1)
})
