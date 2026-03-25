'use client'

import { useEffect, useState, useMemo } from 'react'

interface AmbientDisplayProps {
  patientName: string
  reminders: string[]
}

const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=1920&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80',
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1920&q=80',
  'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=1920&q=80',
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function AmbientDisplay({ patientName, reminders }: AmbientDisplayProps) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const [reminderIndex, setReminderIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(formatDate())
  const greeting = useMemo(() => getGreeting(), [])

  useEffect(() => {
    const photoTimer = setInterval(() => {
      setPhotoIndex(prev => (prev + 1) % DEMO_PHOTOS.length)
    }, 12000)
    return () => clearInterval(photoTimer)
  }, [])

  useEffect(() => {
    if (reminders.length <= 1) return
    const reminderTimer = setInterval(() => {
      setReminderIndex(prev => (prev + 1) % reminders.length)
    }, 20000)
    return () => clearInterval(reminderTimer)
  }, [reminders])

  useEffect(() => {
    const timeTimer = setInterval(() => {
      setCurrentTime(formatDate())
    }, 60000)
    return () => clearInterval(timeTimer)
  }, [])

  return (
    <div className="fixed inset-0 z-0">
      {DEMO_PHOTOS.map((photo, i) => (
        <div
          key={photo}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out"
          style={{
            backgroundImage: `url(${photo})`,
            opacity: i === photoIndex ? 1 : 0,
          }}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      <div className="absolute bottom-0 left-0 right-0 p-12 z-10">
        <p className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-[#faf9f6] mb-3">
          {greeting}, {patientName}
        </p>
        <p className="font-sans text-lg md:text-xl text-[#faf9f6]/70 mb-6">
          {currentTime}
        </p>
        {reminders.length > 0 && (
          <p className="font-serif text-lg md:text-xl text-[#faf9f6]/60 italic transition-opacity duration-500">
            {reminders[reminderIndex]}
          </p>
        )}
      </div>
    </div>
  )
}
