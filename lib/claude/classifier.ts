import Anthropic from '@anthropic-ai/sdk'
import type { ClassifyResponse } from '@/types'

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

interface AnchorForClassifier {
  label: string
  question_examples: string[]
}

export async function classifyTranscript(
  transcript: string,
  anchors: AnchorForClassifier[]
): Promise<ClassifyResponse> {
  try {
    const anchorList = anchors
      .map(a => `- "${a.label}": ${a.question_examples.map(q => `"${q}"`).join(', ')}`)
      .join('\n')

    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `You are a question classifier for an Alzheimer's care device. Given a transcript of what the patient said, determine which anchor (if any) matches their intent.

Available anchors:
${anchorList}

Transcript: "${transcript}"

Respond with ONLY valid JSON, no markdown, no explanation:
{"match": "anchor_label_or_null", "confidence": 0.0_to_1.0}

If no anchor matches well, respond: {"match": null, "confidence": 0.0}
The match field must be exactly one of the anchor labels listed above, or null.`,
        },
      ],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return { match: null, confidence: 0 }
    }

    const parsed: unknown = JSON.parse(textBlock.text.trim())

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('match' in parsed) ||
      !('confidence' in parsed)
    ) {
      return { match: null, confidence: 0 }
    }

    const result = parsed as { match: unknown; confidence: unknown }
    const match = typeof result.match === 'string' ? result.match : null
    const confidence = typeof result.confidence === 'number' ? result.confidence : 0

    return { match, confidence }
  } catch {
    return { match: null, confidence: 0 }
  }
}
