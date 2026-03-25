'use client'

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'mirsa_active_caregiver'

const MARGARET_ID = process.env.NEXT_PUBLIC_DEMO_CAREGIVER_ID ?? ''
const SARAH_ID = process.env.NEXT_PUBLIC_DEMO_SECONDARY_CAREGIVER_ID ?? ''

interface CaregiverState {
  caregiverId: string
  caregiverName: string
  isSecondary: boolean
  toggleCaregiver: () => void
}

const CaregiverContext = createContext<CaregiverState>({
  caregiverId: MARGARET_ID,
  caregiverName: 'Margaret',
  isSecondary: false,
  toggleCaregiver: () => {},
})

export function CaregiverProvider({ children }: { children: ReactNode }) {
  const [isSecondary, setIsSecondary] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'sarah') {
        setIsSecondary(true)
      }
    } catch {
      // localStorage unavailable
    }
    setIsHydrated(true)
  }, [])

  const toggleCaregiver = useCallback(() => {
    setIsSecondary(prev => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? 'sarah' : 'margaret')
      } catch {
        // localStorage unavailable
      }
      return next
    })
  }, [])

  const caregiverId = isSecondary ? SARAH_ID : MARGARET_ID
  const caregiverName = isSecondary ? 'Sarah' : 'Margaret'

  if (!isHydrated) {
    return <>{children}</>
  }

  return (
    <CaregiverContext.Provider value={{ caregiverId, caregiverName, isSecondary, toggleCaregiver }}>
      {children}
    </CaregiverContext.Provider>
  )
}

export function useCaregiver(): CaregiverState {
  return useContext(CaregiverContext)
}
