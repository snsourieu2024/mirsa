import { NextRequest, NextResponse } from 'next/server'
import type { TranscribeResponse } from '@/types'

export async function POST(
  request: NextRequest
): Promise<NextResponse<TranscribeResponse>> {
  try {
    const body = (await request.json()) as { text: string }

    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json({ text: '' })
    }

    return NextResponse.json({ text: body.text.trim() })
  } catch {
    return NextResponse.json({ text: '' })
  }
}
