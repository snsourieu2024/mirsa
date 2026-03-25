# Mirsa — Product Requirements Document
**Version:** 2.0 — Hackathon Demo Build  
**Patient:** Robert  
**Primary caregiver:** Margaret  
**App name:** Mirsa  
**Stack:** Next.js 14 · Supabase · Claude API · Vercel  
**Demo device:** iPad (device surface) + any browser (caregiver app)

---

## HACKATHON DEMO PHILOSOPHY

This is a demo build. Every decision prioritises:
1. **Zero friction to start** — judges should see a working product in under 60 seconds
2. **Nothing can break during the demo** — no auth flows, no email verification, no loading spinners that hang
3. **iPad as the device screen** — the /device route must be flawless on Safari iOS
4. **Pre-seeded data everywhere** — no blank states during the presentation

There is no authentication. There is no login. The app opens and works immediately. Seed data is pre-loaded. The demo starts on page load.

---

## 1. Product Vision & Personas

### What Mirsa is
Mirsa is a two-surface web application that reduces the cognitive and emotional load of caring for an Alzheimer's patient at home. It has a **device display** — a warm ambient screen that lives in the patient's space and answers their repeated questions using only the caregiver's own words — and a **caregiver app** that lets family members manage answers, receive alerts, track patterns over time, and access an AI coach for guidance and emotional support.

**Core design principle:** Mirsa never generates information. It only retrieves what caregivers have explicitly provided. The AI classifies and coaches — it never speaks as a source of truth about the patient's life.

### Demo personas
- **Robert** — the patient. Early-stage Alzheimer's. Asks repeated questions. Voice only.
- **Margaret** — primary caregiver. Spouse. Sets up anchors, reads summaries, receives alerts.
- **Sarah** — Margaret's daughter. Secondary caregiver. Views log remotely.

---

## 2. Authentication — NONE FOR DEMO

There is no login, no signup, no email verification, no magic links, no passwords for the demo build.

**How it works instead:**

The app has two hardcoded demo accounts pre-seeded in Supabase:
- Margaret: `margaret@mirsa.app` / `demo1234`
- Sarah: `sarah@mirsa.app` / `demo1234`

But these are **never shown to judges**. Instead:

- Visiting `/app` immediately loads Margaret's dashboard — no login screen. The app reads a hardcoded `DEMO_CAREGIVER_ID` from an environment variable and uses that to fetch all data. There is a simple "Switch to Sarah's view" button in the top right for demo purposes only.
- Visiting `/device` immediately loads Robert's device display — no token, no QR scan needed. It reads a hardcoded `DEMO_PATIENT_ID` from an environment variable.
- There is a `/demo` landing page that has two large buttons: "Open Caregiver App" and "Open Device Display". This is what you show judges first.

**Environment variables for demo bypass:**
```
DEMO_MODE=true
DEMO_PATIENT_ID=<robert's patient uuid from seed>
DEMO_CAREGIVER_ID=<margaret's caregiver uuid from seed>
DEMO_SECONDARY_CAREGIVER_ID=<sarah's caregiver uuid from seed>
```

When `DEMO_MODE=true`, all auth checks are bypassed. All API routes use the demo IDs directly. This is explicitly a demo-only flag — documented clearly in the README.

---

## 3. The Critical Technical Challenge — Ambient Listening on iPad

This is the most important engineering problem in the product. **Robert will not say a wake word.** He will shout "Where are my keys?" into an empty room. The device — an iPad — must hear this and respond without being triggered by background noise.

### iPad-specific requirements

The device page runs in **Safari on iPad**. This has specific constraints:

- **Web Speech API on iOS Safari:** The `webkitSpeechRecognition` API is available on iOS 14.5+ but requires a user gesture to start. Solve this with a large "Start Mirsa" button on first load that initialises the speech recognition on tap. After that first tap it runs continuously.
- **No background audio on iOS:** Safari will pause audio playback when the screen locks. The device iPad should have **Auto-Lock set to Never** in Settings. Document this in the README and show it during setup.
- **TTS on iOS Safari:** The Web Speech API `SpeechSynthesis` works on iOS Safari. On iOS the voice list loads asynchronously — use the `voiceschanged` event to select the best available voice, not a synchronous `getVoices()` call.
- **Fullscreen on iPad:** True fullscreen via `requestFullscreen()` is NOT supported in Safari iOS. Instead use a PWA approach — the `/device` page should have a manifest and `apple-mobile-web-app-capable` meta tag so it can be added to the iPad home screen and launched as a fullscreen PWA. Include a banner on first load: "For best experience, add Mirsa to your home screen." Also set `viewport` to prevent any scrolling or bounce.
- **Prevent screen sleep:** Use the Screen Wake Lock API (`navigator.wakeLock.request('screen')`) to prevent the iPad screen from dimming. Re-acquire the wake lock if the page regains visibility.

### The three-layer listening architecture

**Layer 1 — Continuous speech recognition**
Use `webkitSpeechRecognition` with `continuous: true` and `interimResults: false`. Auto-restart on `onend` event — it stops after silence on iOS. Every utterance above threshold is captured as a transcript.

**Layer 2 — Intent gate (pure JavaScript, zero API calls)**
Every transcript passes through a local function before any API call:
- Contains interrogative words: where, what, when, who, is, did, have, am, are, can, how
- OR ends with a question mark
- OR contains the caregiver's name ("Margaret") as a distress call
- AND is longer than 3 words
- AND is not just background noise (filter single words, numbers only, etc.)

If passes → send to classifier. If fails → discard silently.

**Layer 3 — Claude classifier with confidence threshold**
Returns `{match: string|null, confidence: number}`. If confidence < 0.85 → safe fallback. If no API connection → Fuse.js local fallback.

**Caregiver name trigger**
If transcript contains "Margaret" and no anchor matches → play hardcoded: "Margaret will be with you soon. Everything is okay, Robert." Never AI-generated.

**Offline fallback**
Fuse.js fuzzy matching against locally cached anchor `question_examples`. Anchors cached to localStorage on every successful load.

---

## 4. Demo Landing Page (/demo)

This is the first URL you open in front of judges. It must be beautiful and load instantly.

**Design:**
- Full screen, warm background (#faf9f6)
- Mirsa logo/wordmark centred
- Tagline: "A gentle memory companion"
- Two large cards side by side:
  - **"Device Display"** — "Robert's screen — open this on the iPad" — teal button
  - **"Caregiver App"** — "Margaret's view — open this on your phone or laptop" — slate button
- Below: a small "Demo data loaded — Robert & Margaret" badge confirming seed data is present
- Clicking either card opens the respective route in a new tab

---

## 5. System Architecture

### Routes

| Route | Purpose | Opens on |
|---|---|---|
| `/demo` | Demo landing page | Laptop (show to judges first) |
| `/device` | Ambient display | iPad (propped up as "the device") |
| `/app` | Caregiver dashboard | Phone or second laptop tab |
| `/app/anchors` | Anchor management | Phone |
| `/app/log` | Interaction log + charts | Phone |
| `/app/alerts` | Alert history | Phone |
| `/app/coach` | AI caregiver coach | Phone |
| `/api/*` | Server routes | Internal |

### Tech stack

**Frontend**
- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui components
- Recharts (trend charts)
- Fuse.js (offline fuzzy matching)
- Web Speech API (continuous listening + TTS)
- MediaRecorder API (voice recording for anchors)
- Google Fonts: Lora (serif) + DM Sans (sans)

**Backend**
- Supabase Postgres (database)
- Supabase Realtime (anchor sync + live alerts)
- Supabase Storage (photos + voice recordings)
- Vercel (hosting + cron jobs)
- **No Supabase Auth for demo** — direct table queries using service role key on server, anon key on client with RLS disabled for demo mode

**AI**
- Claude claude-sonnet-4-5 — intent classifier (JSON only, never speaks to patient)
- Claude claude-sonnet-4-5 — weekly summary (data-only input)
- Claude claude-sonnet-4-5 — caregiver AI coach (bounded, empathetic)
- OpenAI Whisper — audio transcription fallback
- Web Speech API — primary TTS

---

## 6. Feature Specifications

### 6.1 Device display (/device) — iPad optimised

**On first load (before any gesture)**
- Full screen warm dark background (#0d0d0b)
- Mirsa wordmark centred
- One large button: **"Start Mirsa"** — tap to initialise speech recognition
- Subtitle: "Listening for Robert"
- This gesture requirement is iOS Safari's limitation — frame it as an intentional "activate" moment

**After Start is tapped — idle state**
- Family photos rotate as full-bleed background, CSS crossfade every 12 seconds
- Photo captions in small Lora serif at bottom when photo is active
- Current date, day, time-appropriate greeting: "Good morning, Robert" in large Lora serif
- Daily reminders rotate every 20 seconds: "Sarah is visiting this Sunday" / "Lunch is at 12:30 today"
- Breathing pulse indicator — 3 animated dots, bottom right — always listening
- Screen Wake Lock active — screen never dims
- PWA fullscreen — no browser chrome visible if launched from home screen

**Response state**
- Matched anchor photo surfaces as background (if set)
- Frosted glass card fades in at bottom centre
- Response text in Lora serif minimum 22px: "Robert, your keys are on the hook by the front door"
- TTS reads response — on iOS uses best available `speechSynthesis` voice
- If caregiver recorded voice for this anchor → their audio plays instead
- `{{date}}` replaced with today's full date at runtime
- `{{schedule}}` replaced with today's schedule at runtime
- Card fades out after 8 seconds

**Mute toggle**
- Small mute button in top left corner (icon only, unobtrusive)
- Pauses speech recognition when tapped — amber dot appears
- Tap again to resume
- Prevents false triggers if someone is watching TV near the device

**Fallback phrases (hardcoded)**
- fallback_a: "That's a good question. Margaret knows the answer — she'll be back soon."
- fallback_b: "I'm not sure about that one, but you're safe and everything is okay."
- fallback_c: "Let me get Margaret for you. She won't be long."
- caregiver_name: "Margaret will be with you soon. Everything is okay, Robert."

**Offline state**
- Subtle amber dot top right
- Fuse.js local matching continues
- No error shown to Robert

**PWA configuration**
```json
{
  "name": "Mirsa",
  "short_name": "Mirsa",
  "display": "fullscreen",
  "orientation": "landscape",
  "background_color": "#0d0d0b",
  "theme_color": "#0d0d0b",
  "start_url": "/device"
}
```

Add to `<head>` of device page:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Mirsa">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

### 6.2 Caregiver app (/app) — mobile-first

**Dashboard — what Margaret sees on load**
- Unacknowledged alert banner at top (amber) if any exist — pre-seeded with one unacknowledged alert
- Stat row: total questions this week, change vs last week, most asked question today
- Weekly summary card in Lora serif — pre-seeded with the demo summary text
- Quick anchors — 3 most triggered anchors with last triggered time
- Unanswered questions section — unmatched questions with "+ Teach this" button on each
- "Switch to Sarah's view" button top right (demo only — shows same data, different name in greeting)

**Anchor management (/app/anchors)**
- List of all active anchors as cards
- Each card: question examples as pills, response text preview, last triggered time, concern level badge (amber for elevated)
- Tap to expand inline editor
- "+ New anchor" opens a bottom sheet with:
  - Question examples (tag input — Enter to add each phrase)
  - Response text (textarea — warm placeholder: "Write the answer exactly as you'd say it to Robert...")
  - "Record my voice" button — MediaRecorder captures audio, stores to Supabase Storage
  - Optional photo upload — shown on device when this anchor triggers
  - Concern level toggle: Normal / Elevated
- Starter library section: 12 pre-built anchors Margaret can tap to add and customise

**Interaction log (/app/log)**
- Chronological list, full history
- Each row: time, transcription, matched anchor or "No match" badge, confidence pill, response delivered, flag icon, note field
- Filter tabs: All / Matched / Unmatched / Flagged
- "+ Teach this" on every unmatched row — pre-fills anchor creation with the transcription
- Trend charts below the list:
  - Bar chart: interactions by day of week
  - Line chart: weekly total over time
  - Donut chart: top triggered anchors
  - Heatmap: time-of-day activity grid
- "Export for doctor" button → print-friendly PDF view

**Alerts (/app/alerts)**
- List of all alerts chronologically
- Unacknowledged alerts highlighted in amber
- Tap to acknowledge
- Alert settings: quiet hours start/end time picker

**AI coach (/app/coach)**
- Full-screen chat interface
- Warm empty state: "Hi Margaret. I'm here to help you navigate the hard moments — and to remind you that what you're doing takes real courage."
- Contextual check-in banner if today was a hard day (based on log data)
- Chat history persisted in coach_conversations table
- Disclaimer at bottom: "Mirsa's coach offers general caregiver guidance, not medical advice."

### 6.3 Anchor data structure

Each anchor:
- `label` — slug (e.g. "keys_location")
- `question_examples[]` — minimum 4 phrases
- `response_text` — required typed answer
- `response_audio_url` — optional caregiver voice recording
- `photo_url` — optional photo shown on device on trigger
- `concern_level` — "normal" or "elevated"
- `is_active` — boolean toggle
- `{{date}}` and `{{schedule}}` placeholder support in response_text

### 6.4 Real-time sync

Supabase Realtime subscription on device page listens to anchor INSERT/UPDATE for this patient. Changes reflect on device in under 2 seconds. This powers Demo Moment 3 — teach-this loop. Heartbeat re-subscription every 60 seconds.

### 6.5 Alerts

**Elevated-concern anchor triggered**
- Fires on first trigger of elevated anchor each day
- Critical — bypasses quiet hours
- In-app badge + banner on dashboard
- Powers Demo Moment 2

**Unmatched question cluster**
- 3+ unmatched in 30 minutes
- Low priority — held during quiet hours
- In-app only

### 6.6 Weekly summary

Generated by Claude from raw stats only. Stored in weekly_summaries table. Displayed in Lora serif on dashboard. Pre-seeded for demo — never depends on a live API call during presentation.

**Pre-seeded demo summary text (exact):**
> "Robert had 34 conversations with Mirsa this week, up from 27 the week before. He asked about his keys most often — 12 times — usually between 1pm and 3pm. He asked about his mother twice this week, which is new. His most settled time of day was the morning, before 10am. Margaret, you answered every one of those questions before you even knew he'd asked."

### 6.7 AI caregiver coach

Powered by Claude claude-sonnet-4-5 with a strictly bounded system prompt. Scope: responding to Alzheimer's behaviours, phrasing anchor responses compassionately, emotional validation, caregiver wellbeing. Forbidden: medical diagnosis, prognosis, medication advice. Always ends difficult conversations with acknowledgment of the caregiver's effort. Proactive check-in if the day's log shows a spike or elevated anchor triggered.

---

## 7. Database Schema

### Tables

**patients**
```sql
id uuid primary key default gen_random_uuid()
name text not null
device_token text unique not null
created_at timestamptz default now()
```

**caregiver_profiles**
```sql
id uuid primary key default gen_random_uuid()
full_name text not null
email text unique not null
patient_id uuid references patients(id) on delete cascade
role text default 'caregiver' check (role in ('owner', 'caregiver'))
quiet_hours_start time default '22:00'
quiet_hours_end time default '07:00'
proactive_checkins_enabled boolean default true
created_at timestamptz default now()
```

**anchors**
```sql
id uuid primary key default gen_random_uuid()
patient_id uuid references patients(id) on delete cascade
label text not null
question_examples text[] not null
response_text text not null
response_audio_url text
photo_url text
concern_level text default 'normal' check (concern_level in ('normal', 'elevated'))
is_active boolean default true
created_by_id uuid references caregiver_profiles(id)
created_at timestamptz default now()
updated_at timestamptz default now()
```

**daily_schedules**
```sql
id uuid primary key default gen_random_uuid()
patient_id uuid references patients(id) on delete cascade
schedule_date date not null
breakfast text
lunch text
dinner text
visitors text
activities text
created_at timestamptz default now()
unique(patient_id, schedule_date)
```

**interactions**
```sql
id uuid primary key default gen_random_uuid()
patient_id uuid references patients(id) on delete cascade
occurred_at timestamptz default now()
transcription text not null
matched_anchor_id uuid references anchors(id)
classifier_confidence float
response_type text not null check (response_type in ('anchor','fallback_a','fallback_b','fallback_c','caregiver_name'))
response_text_delivered text not null
is_flagged boolean default false
caregiver_note text
alert_triggered boolean default false
```

**alerts**
```sql
id uuid primary key default gen_random_uuid()
patient_id uuid references patients(id) on delete cascade
alert_type text not null check (alert_type in ('elevated_anchor','unmatched_cluster'))
detail text not null
triggered_at timestamptz default now()
is_critical boolean default false
acknowledged boolean default false
```

**weekly_summaries**
```sql
id uuid primary key default gen_random_uuid()
patient_id uuid references patients(id) on delete cascade
week_start date not null
summary_text text not null
total_interactions int
unmatched_count int
generated_at timestamptz default now()
```

**coach_conversations**
```sql
id uuid primary key default gen_random_uuid()
caregiver_id uuid references caregiver_profiles(id) on delete cascade
messages jsonb not null default '[]'
created_at timestamptz default now()
updated_at timestamptz default now()
unique(caregiver_id)
```

### RLS for demo
For the demo build, disable RLS on all tables and use the Supabase service role key on all server-side queries. Add a comment in every migration file: `-- RLS disabled for hackathon demo build`. This is explicitly acknowledged as a demo simplification.

---

## 8. AI Usage Map

| Use case | Model | Input | Output | Safety constraint |
|---|---|---|---|---|
| Intent classifier | claude-sonnet-4-5 | Transcript + anchor list | `{match: string\|null, confidence: number}` | Confidence < 0.85 → null. Non-JSON → null. Label validated against allowlist. Stateless. |
| Weekly summary | claude-sonnet-4-5 | Raw log stats only | 3–5 sentence narrative | No medical inference. No speculation. Data only. |
| Caregiver coach | claude-sonnet-4-5 | Message + system prompt + last 20 messages | Empathetic guidance | No diagnosis. No prognosis. No medication advice. |
| Proactive check-in | claude-sonnet-4-5 | Day's log summary | Single contextual message | Once per day max. Caregiver can disable. |

**Inviolable rule:** Claude never generates content spoken to Robert. Device speaks only stored response_text. Classify route returns a key only. Device retrieves text from local cache.

---

## 9. Risk Register

### HIGH — iOS Safari Web Speech API requires gesture
Safari will not start speech recognition without a user gesture. 
**Mitigation:** "Start Mirsa" tap-to-activate button on device load. Frame as intentional activation. Document for demo setup.

### HIGH — iOS Safari fullscreen limitations
`requestFullscreen()` not supported in Safari iOS.
**Mitigation:** PWA manifest + apple-mobile-web-app-capable meta tags. Add to iPad home screen before demo. Test this the day before.

### HIGH — Screen sleep during demo
iPad will dim and lock during presentation.
**Mitigation:** Screen Wake Lock API. Also set iPad Auto-Lock to Never in Settings before demo. Both belts and braces.

### HIGH — TTS voice quality on iOS
iOS voices vary — some are robotic.
**Mitigation:** Use `voiceschanged` event to select best available voice. Test on the actual demo iPad. Consider a recorded audio file for the demo anchor responses so Margaret's real voice plays — far more impressive than TTS.

### MEDIUM — Supabase Realtime on iPad Safari
WebSocket connections can drop on iOS when app is backgrounded briefly.
**Mitigation:** Heartbeat re-subscription every 60 seconds. Visual indicator when offline.

### MEDIUM — Claude classifier latency
If API response takes > 2 seconds, there is an awkward silence after Robert speaks.
**Mitigation:** Show a subtle "..." animation on the device while classifying. Pre-warm the connection. For demo anchors, Fuse.js local matching will respond in milliseconds — only new/complex questions hit the API.

### LOW — Demo data missing on load
If seed script wasn't run, the app shows empty states.
**Mitigation:** Seed script must be run as the very first step after Vercel deploy. Add a `/api/health` endpoint that checks if demo data exists and returns a warning if not. Show a "Demo data not loaded" banner on the /demo landing page if health check fails.

---

## 10. Visual Design

### Device page (iPad)
- Background: #0d0d0b
- Full-bleed photos, CSS crossfade 12s
- Vignette: radial gradient transparent → rgba(0,0,0,0.55)
- Typography: Lora serif, warm white (#faf9f6)
- Greeting: minimum 32px (larger on iPad)
- Response text: minimum 24px Lora serif
- Response card: backdrop-filter blur(20px), rgba(255,255,255,0.08) bg, 0.5px rgba(255,255,255,0.15) border
- Pulse dots: 3 dots, bottom right, 2s breathing animation
- Landscape optimised — all key content in lower third of screen
- No scrolling, no bounce, no browser chrome

### Caregiver app (mobile)
- Background: #faf9f6
- Text: #1c1c1e
- Accent: #2d9e75 (teal)
- Alert: #d97706 (amber)
- Muted: #6b6b6e
- Font: DM Sans UI, Lora for summary + emotional text
- Border radius: 16px minimum
- Touch targets: 48px minimum
- Max width: 430px centred on desktop
- No harsh shadows — 0.5px borders only
- Empty states: warm human copy

---

## 11. Demo Script

**Physical setup:**
- iPad propped up landscape — `/device` open (or added to home screen as PWA)
- Your phone or laptop — `/app` open on Margaret's dashboard
- Both connected to same wifi
- iPad Auto-Lock set to Never
- Seed data confirmed loaded (/api/health returns OK)

**Opening:** Open `/demo` on the laptop. Show judges the two-button landing page. Say: "This is Robert's home. The iPad is his Memory Anchor. This is Margaret's phone."

**Moment 1 — The voice (90 seconds)**
Tap "Start Mirsa" on iPad. Show idle state — photo, date, pulse breathing. Speak naturally: "Where are my keys?" — device responds in warm voice, text fades in, photo surfaces. Speak: "What day is it?" — auto-date responds. Speak: "Where is Margaret?" — reassurance phrase plays.
*Judges feel: this is real, this is warm, this works.*

**Moment 2 — The real-time alert (60 seconds)**
Speak: "Did I take my medication?" — device responds. Show phone simultaneously — alert badge appears on dashboard in real time. Open the alert: "Robert asked about his medication at [time]."
*Judges feel: the caregiver is never alone in this.*

**Moment 3 — The teach-this loop (90 seconds)**
Speak: "What's on television tonight?" — warm fallback plays. Open phone → log → unmatched questions → "+ Teach this" → type answer → save. Speak same question again. Device answers.
*Judges feel: this learns. Margaret is in control.*

**Moment 4 — The weekly summary (60 seconds)**
Open dashboard on phone. Scroll to summary card. Read it aloud slowly. Pause after the last line. Say nothing. Let it land.
*Judges feel: this product understands something deeply human.*

---

## 12. Build Order

| Stage | Scope | Gate before next stage |
|---|---|---|
| 1 | Scaffold, deps, folder structure, fonts, Tailwind, PWA manifest, README | `tsc --noEmit` passes |
| 2 | Database schema, TypeScript types, Supabase client (no auth), seed script | Seed runs cleanly, data visible in Supabase dashboard |
| 3 | Classifier API route — reviewed in isolation | All 5 safety layers present, tested with 10 sample transcripts |
| 4 | Remaining API routes: transcribe, summary, alert, coach, export | All routes return correct types |
| 5 | Core hooks: useVoiceListener (3-layer + iPad), useRealtimeAlerts, useAnchorCache, useOfflineQueue | Intent gate tested with 10 sample transcripts in isolation |
| 6 | Device page — iPad optimised, Start Mirsa button, idle state, response overlay, mute toggle, wake lock | Tested on actual iPad Safari before proceeding |
| 7 | Caregiver app — all screens, charts, teach-this flow, coach, alerts | All 4 demo moments completable end to end |
| 8 | Demo landing page, health check endpoint, final wiring, README complete | Full demo run-through without errors |

---

## 13. Seed Data

**Script:** `scripts/seed.ts`  
**Run:** `npx ts-node scripts/seed.ts`  
**Idempotent:** Running twice does not create duplicates — check for existing demo data first.

**Creates:**
- Patient: Robert (with pre-generated device_token)
- Caregiver: Margaret — owner, `margaret@mirsa.app`
- Caregiver: Sarah — caregiver, `sarah@mirsa.app`
- 12 anchors with 4+ question_examples each — medication/location/deceased_family marked elevated
- Today's daily schedule: breakfast 8:00am, lunch 12:30pm, dinner 6:00pm, visitors: Sarah on Sunday
- 47 interactions over past 3 weeks — realistic distribution, afternoon cluster, mix of matched/unmatched
- 1 acknowledged alert (yesterday, medication question)
- 1 unacknowledged alert (today 2:14pm, medication question) — this fires Demo Moment 2
- Pre-written weekly summary (exact text from Section 6.6) — do NOT generate live
- Empty coach conversation for Margaret — ready for first message

---

## 14. README Requirements

The README must include:

1. What Mirsa is (2 sentences)
2. Demo setup checklist (numbered, exact steps):
   - Clone and install
   - Copy .env.example to .env.local and fill in keys
   - Run Supabase migration
   - Run seed script
   - Run `npm run dev`
   - Open `/demo` in browser
   - iPad setup: open `/device` in Safari → tap Share → Add to Home Screen → launch from home screen → tap Start Mirsa
   - Set iPad Auto-Lock to Never (Settings → Display & Brightness → Auto-Lock → Never)
3. Environment variables explained
4. The 4 demo moments with exact phrases to speak
5. `/api/health` endpoint — what it checks, what green looks like
6. Known iOS Safari limitations and their mitigations

---

*End of PRD — Mirsa Hackathon Demo Build v2.0*