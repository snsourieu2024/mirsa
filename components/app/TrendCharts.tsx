'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import type { Interaction } from '@/types'

interface TrendChartsProps {
  interactions: Interaction[]
}

const COLORS = ['#2d9e75', '#d97706', '#6b6b6e', '#3b82f6', '#8b5cf6', '#ec4899']

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDayOfWeekData(interactions: Interaction[]) {
  const counts = new Array(7).fill(0) as number[]
  interactions.forEach(i => {
    const day = new Date(i.occurred_at).getDay()
    counts[day]++
  })
  return DAY_NAMES.map((name, i) => ({ name, count: counts[i] }))
}

function getWeeklyData(interactions: Interaction[]) {
  const weeks = new Map<string, number>()
  interactions.forEach(i => {
    const d = new Date(i.occurred_at)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().split('T')[0]
    weeks.set(key, (weeks.get(key) ?? 0) + 1)
  })
  return Array.from(weeks.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week: week.slice(5), count }))
}

function getTopAnchors(interactions: Interaction[]) {
  const counts = new Map<string, number>()
  interactions.forEach(i => {
    if (i.response_type === 'anchor' && i.matched_anchor_id) {
      const label = i.matched_anchor_id.slice(0, 8)
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
  })
  return Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }))
}

function getHeatmapData(interactions: Interaction[]) {
  const grid: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0) as number[])
  interactions.forEach(i => {
    const d = new Date(i.occurred_at)
    grid[d.getDay()][d.getHours()]++
  })
  return grid
}

export function TrendCharts({ interactions }: TrendChartsProps) {
  if (interactions.length === 0) {
    return (
      <div className="border border-mirsa-text/10 rounded-card p-6">
        <p className="font-sans text-sm text-mirsa-muted italic text-center">
          Charts will appear as Robert talks to Mirsa throughout the week
        </p>
      </div>
    )
  }

  const dayData = getDayOfWeekData(interactions)
  const weeklyData = getWeeklyData(interactions)
  const anchorData = getTopAnchors(interactions)
  const heatmap = getHeatmapData(interactions)

  return (
    <div className="space-y-6">
      <div className="border border-mirsa-text/10 rounded-card p-4">
        <h4 className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider mb-3">
          By day of week
        </h4>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dayData}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b6b6e' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="count" fill="#2d9e75" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border border-mirsa-text/10 rounded-card p-4">
        <h4 className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider mb-3">
          Weekly trend
        </h4>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={weeklyData}>
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b6b6e' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Line type="monotone" dataKey="count" stroke="#2d9e75" strokeWidth={2} dot={{ r: 3, fill: '#2d9e75' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {anchorData.length > 0 && (
        <div className="border border-mirsa-text/10 rounded-card p-4">
          <h4 className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider mb-3">
            Top triggers
          </h4>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={anchorData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
              >
                {anchorData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="border border-mirsa-text/10 rounded-card p-4">
        <h4 className="font-sans text-xs font-medium text-mirsa-muted uppercase tracking-wider mb-3">
          Activity by hour
        </h4>
        <div className="overflow-x-auto">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `40px repeat(24, 1fr)` }}>
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="font-sans text-[9px] text-mirsa-muted text-center">
                {h}
              </div>
            ))}
            {heatmap.map((row, day) => (
              <div key={`row-${day}`} className="contents">
                <div className="font-sans text-[10px] text-mirsa-muted flex items-center">
                  {DAY_NAMES[day]}
                </div>
                {row.map((count, hour) => {
                  const maxCount = Math.max(...heatmap.flat(), 1)
                  const intensity = count / maxCount
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="aspect-square rounded-sm"
                      style={{
                        backgroundColor: count > 0
                          ? `rgba(45, 158, 117, ${0.15 + intensity * 0.85})`
                          : 'rgba(0, 0, 0, 0.03)',
                      }}
                      title={`${DAY_NAMES[day]} ${hour}:00 — ${count} interactions`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
