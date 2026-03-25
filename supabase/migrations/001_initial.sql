-- Mirsa — Initial Database Schema
-- RLS disabled for hackathon demo build

-- ============================================================
-- patients
-- The person living with Alzheimer's. One patient per device.
-- RLS disabled: demo uses hardcoded DEMO_PATIENT_ID, no multi-tenant isolation needed.
-- ============================================================
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  device_token text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- caregiver_profiles
-- Family members who manage anchors and receive alerts.
-- RLS disabled: demo uses hardcoded DEMO_CAREGIVER_ID, no auth layer.
-- ============================================================
CREATE TABLE caregiver_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'caregiver' CHECK (role IN ('owner', 'caregiver')),
  quiet_hours_start time NOT NULL DEFAULT '22:00',
  quiet_hours_end time NOT NULL DEFAULT '07:00',
  proactive_checkins_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE caregiver_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- anchors
-- Pre-written answers to Robert's repeated questions.
-- Each anchor has question examples for classifier matching
-- and a stored response that the device reads aloud.
-- RLS disabled: demo bypasses auth — all anchors visible to all clients.
-- ============================================================
CREATE TABLE anchors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  label text NOT NULL,
  question_examples text[] NOT NULL,
  response_text text NOT NULL,
  response_audio_url text,
  photo_url text,
  concern_level text NOT NULL DEFAULT 'normal' CHECK (concern_level IN ('normal', 'elevated')),
  is_active boolean NOT NULL DEFAULT true,
  created_by_id uuid REFERENCES caregiver_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE anchors DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- daily_schedules
-- One row per day per patient. Drives {{schedule}} placeholder
-- substitution in anchor response_text on the device.
-- RLS disabled: demo has a single patient with a single schedule.
-- ============================================================
CREATE TABLE daily_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  schedule_date date NOT NULL,
  breakfast text,
  lunch text,
  dinner text,
  visitors text,
  activities text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(patient_id, schedule_date)
);
ALTER TABLE daily_schedules DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- interactions
-- Every utterance Robert makes that passes the intent gate.
-- Stores the transcript, which anchor matched (if any),
-- confidence score, and what the device actually said back.
-- RLS disabled: demo reads all interactions for charts and log.
-- ============================================================
CREATE TABLE interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  transcription text NOT NULL,
  matched_anchor_id uuid REFERENCES anchors(id),
  classifier_confidence float,
  response_type text NOT NULL CHECK (response_type IN ('anchor', 'fallback_a', 'fallback_b', 'fallback_c', 'caregiver_name')),
  response_text_delivered text NOT NULL,
  is_flagged boolean NOT NULL DEFAULT false,
  caregiver_note text,
  alert_triggered boolean NOT NULL DEFAULT false
);
ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- alerts
-- Fired when an elevated-concern anchor triggers or when
-- there's a cluster of unmatched questions. Caregiver
-- acknowledges from the app.
-- RLS disabled: demo displays all alerts without filtering by user.
-- ============================================================
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('elevated_anchor', 'unmatched_cluster')),
  detail text NOT NULL,
  triggered_at timestamptz NOT NULL DEFAULT now(),
  is_critical boolean NOT NULL DEFAULT false,
  acknowledged boolean NOT NULL DEFAULT false
);
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- weekly_summaries
-- Pre-generated compassionate narrative about Robert's week.
-- Stored verbatim — never regenerated live during demo.
-- RLS disabled: demo reads summaries directly without auth.
-- ============================================================
CREATE TABLE weekly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  summary_text text NOT NULL,
  total_interactions int,
  unmatched_count int,
  generated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE weekly_summaries DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- coach_conversations
-- Persists the AI coach chat history for each caregiver.
-- One conversation per caregiver (upsert pattern).
-- RLS disabled: demo loads conversation by hardcoded caregiver ID.
-- ============================================================
CREATE TABLE coach_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id uuid NOT NULL REFERENCES caregiver_profiles(id) ON DELETE CASCADE,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(caregiver_id)
);
ALTER TABLE coach_conversations DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Enable Realtime for tables that need live sync
-- anchors: teach-this loop (Demo Moment 3)
-- alerts: real-time alert badge (Demo Moment 2)
-- interactions: live log updates
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE anchors;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE interactions;
