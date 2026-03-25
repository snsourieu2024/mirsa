import { NextRequest, NextResponse } from 'next/server'
import { classifyTranscript } from '@/lib/claude/classifier'
import type { ClassifyResponse } from '@/types'

interface ClassifyRequestBody {
  transcript: string
  anchors: Array<{
    label: string
    question_examples: string[]
  }>
}

/**
 * POST /api/classify
 *
 * Safety-critical route: classifies a patient's spoken transcript against
 * a list of caregiver-authored anchors. Returns a matched anchor label
 * or null — never generates content spoken to the patient.
 *
 * This route is the architectural boundary that prevents Claude from
 * ever speaking as a source of truth about the patient's life.
 * It returns a KEY only. The device retrieves stored response_text
 * from its local anchor cache.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ClassifyResponse>> {
  try {
    const body = (await request.json()) as ClassifyRequestBody

    if (!body.transcript || !Array.isArray(body.anchors)) {
      // SAFETY LAYER 5: Malformed input → safe default, not an error
      return NextResponse.json({ match: null, confidence: 0 })
    }

    // SAFETY LAYER 4: Stateless classification — no conversation history.
    // Each call is independent. Claude receives only the current transcript
    // and the anchor list. No context accumulates across calls, preventing
    // the model from building a narrative about the patient.
    const result = await classifyTranscript(body.transcript, body.anchors)

    // SAFETY LAYER 1: JSON-only response from Claude.
    // The classifyTranscript function parses Claude's response as JSON.
    // If Claude returns anything other than valid JSON (markdown, prose,
    // apologies), the parser fails and returns {match: null, confidence: 0}.
    // This is handled inside classifyTranscript's catch block.

    // SAFETY LAYER 2: Confidence threshold.
    // If Claude is less than 85% confident in the match, we discard it.
    // A wrong match is worse than no match — Robert hearing the wrong
    // answer to "where is my wife?" could cause real distress.
    if (result.confidence < 0.85) {
      return NextResponse.json({ match: null, confidence: result.confidence })
    }

    // SAFETY LAYER 3: Allowlist validation.
    // The returned label MUST exist in the anchor list the caregiver created.
    // Even if Claude hallucinates a plausible-sounding label, it gets rejected
    // unless a caregiver explicitly authored an anchor with that exact label.
    const validLabels = new Set(body.anchors.map(a => a.label))
    if (result.match !== null && !validLabels.has(result.match)) {
      return NextResponse.json({ match: null, confidence: 0 })
    }

    return NextResponse.json(result)
  } catch {
    // SAFETY LAYER 5: Error containment.
    // Any unhandled error — network failure, malformed request, Claude outage —
    // returns a safe default. The device will fall back to Fuse.js local
    // matching or a hardcoded warm phrase. The patient never sees an error.
    // This route NEVER returns a 500.
    return NextResponse.json({ match: null, confidence: 0 })
  }
}
