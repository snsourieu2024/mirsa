# Mirsa — A Gentle Memory Companion for Alzheimer's Caregivers

Caring for someone with Alzheimer's is one of the most demanding 
things a human being can do. Not because of any single hard moment 
— but because of the thousand small ones. The same question asked 
fourteen times before lunch. The same reassurance given with the 
same warmth, the two hundredth time, as the first. The slow, 
invisible erosion of a caregiver who has no one asking how they 
are doing.

Mirsa was built for them.

---

## Who it is for

Mirsa is for the 11 million unpaid family caregivers in the US 
alone who are caring for a loved one with Alzheimer's or dementia 
at home. Specifically it is for the spouse, the adult child, or 
the sibling who has become the primary anchor of someone else's 
reality — answering the same questions on repeat, managing the 
household alone, and doing it all without a manual, a co-pilot, 
or anyone checking in on them.

---

## What it does

Mirsa is a two-surface web application.

**The device display** is a warm ambient screen that lives in 
the patient's space — running on an iPad, tablet, or any browser. 
It listens continuously for the patient's voice using a three-layer 
ambient listening architecture. When the patient asks a question 
the caregiver has already answered — where are my keys, what day 
is it, where is Margaret — Mirsa responds instantly in a warm 
voice using the caregiver's exact words. Not generated. Not 
invented. Theirs.

**The caregiver app** is a mobile-first web application for 
the family. It lets caregivers build a library of questions and 
answers, upload family photos that surface on the device when 
relevant anchors are triggered, and invite up to five family 
members to share the caregiving load. It tracks every interaction 
the patient has with the device and surfaces patterns over time — 
which questions are being asked more, what time of day is hardest, 
what is new this week. Every Sunday it generates a plain-English 
letter summarising the week. Not a dashboard. Not a chart. A letter.

**The AI coach** is a compassionate chat companion built into 
the caregiver app. It helps caregivers navigate difficult 
situations — how to respond when a patient asks about a deceased 
parent, how to phrase a reassuring answer, how to get through a 
hard afternoon. It checks in when the data suggests a rough day. 
It never gives medical advice. It always ends difficult 
conversations by acknowledging that what the caregiver is doing 
takes extraordinary courage.

---

## How it solves the problem

The core insight behind Mirsa is that caregiver exhaustion is 
not caused by the difficulty of any single answer. It is caused 
by the cumulative weight of giving the same answer, with the same 
love, indefinitely — while also managing alerts, patterns, family 
communication, and their own emotional state entirely alone.

Mirsa addresses each part of that weight directly.

The device carries the repetition. When Robert asks where his 
keys are for the twelfth time today, Mirsa answers. Margaret does 
not have to.

The weekly letter carries the uncertainty. Caregivers rarely know 
if things are getting better or worse because they are too close 
to see the trend. Mirsa surfaces it in plain human language every 
week without requiring them to read a single graph.

The alert system carries the vigilance. If Robert asks about his 
medication four times in an hour, or asks a question Mirsa has 
never heard before, Margaret's phone receives a quiet notification. 
She does not have to be in the room to know something has changed.

The coach carries the isolation. There is no one a primary 
caregiver can call at 11pm to ask whether what they are feeling 
is normal. Mirsa is there.

The teach-this loop carries the learning. When Mirsa cannot answer 
a question, the caregiver sees it flagged in the app and can teach 
Mirsa the answer in one tap. The device responds correctly the 
next time Robert asks — without a page refresh, without a delay.

---

## The technical foundation

Mirsa is built on a zero-hallucination architecture. The AI 
never generates content that is spoken to the patient. Every 
response Robert hears is a word Margaret wrote. Claude acts 
as a classifier — matching questions to answers — and returns 
a key, never a sentence. The device retrieves the stored 
response from a local cache. If the classifier is not confident 
enough, it returns null and a warm hardcoded fallback plays 
instead. There is no scenario in which Mirsa invents information 
about Robert's life.

The ambient listening system uses three layers — continuous voice 
activity detection, a local intent gate that filters noise without 
any API call, and a Claude classifier with a confidence threshold 
of 0.85. False positives produce fallback phrases, never invented 
answers. The system works offline via Fuse.js fuzzy matching 
against a locally cached anchor library.

**Stack:** Next.js 14 · TypeScript strict · Supabase · 
Claude API · Groq · Vercel · Tailwind CSS · shadcn/ui · 
Recharts · Fuse.js · Web Speech API

---

## The demo

Open `/demo` to see both surfaces. The device display runs at 
`/device` — tap Start Mirsa and speak naturally. The caregiver 
app runs at `/app` — pre-loaded with Robert and Margaret's data.

The four moments that matter:
1. Speak a stored question — hear Margaret's voice answer
2. Ask about medication — watch the real-time alert appear 
   on the caregiver app within seconds
3. Ask something Mirsa does not know — teach it in one tap — 
   ask again — it answers
4. Read the weekly summary out loud — pause on the last line

---

*Mirsa is a hackathon prototype. It is not a medical device.*
Add this to the end of the README:

---

```markdown
## Running Mirsa locally

**Prerequisites**
- Node.js 18 or higher
- A Supabase account
- An Anthropic API key
- A Groq API key

**Setup**

1. Clone the repository
   ```
   git clone https://github.com/yourusername/mirsa.git
   cd mirsa
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Copy the environment variables file and fill in your values
   ```
   cp .env.example .env.local
   ```

4. Open `.env.local` and add your keys
   ```
   NEXT_PUBLIC_SUPABASE_URL=your supabase project URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your supabase anon key
   SUPABASE_SERVICE_ROLE_KEY=your supabase service role key
   ANTHROPIC_API_KEY=your anthropic key
   GROQ_API_KEY=your groq key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   DEMO_MODE=true
   NEXT_PUBLIC_DEMO_PATIENT_ID=fill in after running seed
   NEXT_PUBLIC_DEMO_CAREGIVER_ID=fill in after running seed
   NEXT_PUBLIC_DEMO_SECONDARY_CAREGIVER_ID=fill in after running seed
   ```

5. Run the Supabase migration to create the database tables
   — go to your Supabase project dashboard, open the SQL
   editor, paste the contents of
   `supabase/migrations/001_initial.sql` and run it

6. Seed the demo data
   ```
   npx ts-node scripts/seed.ts
   ```
   Copy the printed IDs into your `.env.local` for the
   three DEMO_ variables

7. Start the development server
   ```
   npm run dev
   ```

8. Open your browser and go to `http://localhost:3000/demo`

**iPad setup for the device display**

1. Make sure your iPad and laptop are on the same WiFi network
2. Find your laptop's local IP address
   - Mac: System Settings → WiFi → Details → IP Address
   - Windows: run `ipconfig` in terminal → IPv4 Address
3. On the iPad open Safari and go to
   `http://your-laptop-ip:3000/device`
4. Tap the Share button → Add to Home Screen → Add
5. Launch Mirsa from the home screen for fullscreen mode
6. Go to Settings → Display & Brightness → Auto-Lock → Never

**Deploying to Vercel**

```
npm run build
vercel --prod
```

Add all variables from `.env.local` to your Vercel project
under Settings → Environment Variables, then redeploy.
```