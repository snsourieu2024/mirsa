'use client'

import { useEffect, useState } from 'react'

interface ResponseOverlayProps {
  responseText: string | null
  photoUrl: string | null
  onDismiss: () => void
}

export function ResponseOverlay({
  responseText,
  photoUrl,
  onDismiss,
}: ResponseOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    if (responseText) {
      setIsVisible(true)
      setIsFadingOut(false)

      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true)
      }, 7000)

      const dismissTimer = setTimeout(() => {
        setIsVisible(false)
        setIsFadingOut(false)
        onDismiss()
      }, 8000)

      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(dismissTimer)
      }
    } else {
      setIsVisible(false)
      setIsFadingOut(false)
    }
  }, [responseText, onDismiss])

  if (!isVisible || !responseText) return null

  return (
    <>
      {photoUrl && (
        <div
          className={`fixed inset-0 z-20 bg-cover bg-center transition-opacity duration-1000 ${
            isFadingOut ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ backgroundImage: `url(${photoUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      )}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-16 px-8 ${
          isFadingOut ? 'animate-fade-out' : 'animate-fade-in'
        }`}
      >
        <div
          className="max-w-2xl w-full rounded-[20px] px-10 py-8 border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: '0.5px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <p className="font-serif text-2xl md:text-3xl leading-relaxed text-[#faf9f6]">
            {responseText}
          </p>
        </div>
      </div>
    </>
  )
}
