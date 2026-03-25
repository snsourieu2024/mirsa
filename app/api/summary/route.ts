import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { generateWeeklySummary } from '@/lib/claude/summarizer'
import type { SummaryResponse, WeeklySummary } from '@/types'

export async function GET(
  request: NextRequest
): Promise<NextResponse<SummaryResponse>> {
  try {
    const patientId = request.nextUrl.searchParams.get('patientId')
    if (!patientId) {
      return NextResponse.json({ summary: '' })
    }

    const { data, error } = await supabaseAdmin
      .from('weekly_summaries')
      .select('*')
      .eq('patient_id', patientId)
      .order('week_start', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    const summary = data as WeeklySummary
    return NextResponse.json({ summary: summary.summary_text })
  } catch {
    return NextResponse.json({ summary: '' })
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SummaryResponse>> {
  try {
    const body = (await request.json()) as {
      patientId: string
      patientName: string
      caregiverName: string
    }

    if (!body.patientId) {
      return NextResponse.json({ summary: '' })
    }

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)

    const { data: interactions, error: intError } = await supabaseAdmin
      .from('interactions')
      .select('*')
      .eq('patient_id', body.patientId)
      .gte('occurred_at', weekStart.toISOString())

    if (intError) throw intError

    const total = interactions?.length ?? 0
    const unmatched = interactions?.filter(i => !i.matched_anchor_id).length ?? 0

    const summaryText = await generateWeeklySummary({
      patientName: body.patientName || 'Robert',
      caregiverName: body.caregiverName || 'Margaret',
      totalInteractions: total,
      previousWeekTotal: Math.round(total * 0.8),
      topAnchorLabel: 'keys',
      topAnchorCount: Math.round(total * 0.35),
      topAnchorTimePattern: 'usually in the afternoon',
      newPatterns: [],
      settledTimeOfDay: 'morning, before 10am',
      unmatchedCount: unmatched,
    })

    const { error: insertError } = await supabaseAdmin
      .from('weekly_summaries')
      .insert({
        patient_id: body.patientId,
        week_start: weekStart.toISOString().split('T')[0],
        summary_text: summaryText,
        total_interactions: total,
        unmatched_count: unmatched,
      })

    if (insertError) throw insertError

    return NextResponse.json({ summary: summaryText })
  } catch {
    return NextResponse.json({ summary: '' })
  }
}
