// Mirsa — TypeScript types derived directly from database schema.
// Every type mirrors the exact column names and types from 001_initial.sql.

export interface Patient {
  id: string
  name: string
  device_token: string
  created_at: string
}

export interface CaregiverProfile {
  id: string
  full_name: string
  email: string
  patient_id: string
  role: 'owner' | 'caregiver'
  quiet_hours_start: string
  quiet_hours_end: string
  proactive_checkins_enabled: boolean
  created_at: string
}

export type ConcernLevel = 'normal' | 'elevated'

export interface Anchor {
  id: string
  patient_id: string
  label: string
  question_examples: string[]
  response_text: string
  response_audio_url: string | null
  photo_url: string | null
  concern_level: ConcernLevel
  is_active: boolean
  created_by_id: string | null
  created_at: string
  updated_at: string
}

export interface DailySchedule {
  id: string
  patient_id: string
  schedule_date: string
  breakfast: string | null
  lunch: string | null
  dinner: string | null
  visitors: string | null
  activities: string | null
  created_at: string
}

export type ResponseType = 'anchor' | 'fallback_a' | 'fallback_b' | 'fallback_c' | 'caregiver_name'

export interface Interaction {
  id: string
  patient_id: string
  occurred_at: string
  transcription: string
  matched_anchor_id: string | null
  classifier_confidence: number | null
  response_type: ResponseType
  response_text_delivered: string
  is_flagged: boolean
  caregiver_note: string | null
  alert_triggered: boolean
}

export type AlertType = 'elevated_anchor' | 'unmatched_cluster'

export interface Alert {
  id: string
  patient_id: string
  alert_type: AlertType
  detail: string
  triggered_at: string
  is_critical: boolean
  acknowledged: boolean
}

export interface WeeklySummary {
  id: string
  patient_id: string
  week_start: string
  summary_text: string
  total_interactions: number | null
  unmatched_count: number | null
  generated_at: string
}

export interface CoachMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface CoachConversation {
  id: string
  caregiver_id: string
  messages: CoachMessage[]
  created_at: string
  updated_at: string
}

// API response types — every route returns a typed shape

export interface ClassifyResponse {
  match: string | null
  confidence: number
}

export interface TranscribeResponse {
  text: string
}

export interface SummaryResponse {
  summary: string
}

export interface AlertResponse {
  alert: Alert | null
}

export interface CoachResponse {
  message: string
}

export interface ExportResponse {
  interactions: Interaction[]
  patient: Patient
  period: { start: string; end: string }
}

export interface HealthResponse {
  ok: boolean
  missing: string[]
}

// Interaction with joined anchor data for the log view
export interface InteractionWithAnchor extends Interaction {
  anchor?: Pick<Anchor, 'label' | 'question_examples'> | null
}

// Fallback phrases — hardcoded, never AI-generated
export const FALLBACK_PHRASES = {
  fallback_a: "That's a good question. Margaret knows the answer — she'll be back soon.",
  fallback_b: "I'm not sure about that one, but you're safe and everything is okay.",
  fallback_c: "Let me get Margaret for you. She won't be long.",
  caregiver_name: "Margaret will be with you soon. Everything is okay, Robert.",
} as const satisfies Record<string, string>

export type FallbackKey = keyof typeof FALLBACK_PHRASES
