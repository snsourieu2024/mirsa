'use client'

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { CaregiverProfile, Patient } from '@/types'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: CaregiverProfile | null
  patient: Patient | null
  isLoading: boolean
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  patient: null,
  isLoading: true,
  signOut: async () => {},
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<CaregiverProfile | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async (authUser: User) => {
    try {
      const { data: profileData, error: profileErr } = await supabase
        .from('caregiver_profiles')
        .select('*')
        .eq('email', authUser.email ?? '')
        .limit(1)
        .single()

      if (profileErr) throw profileErr
      const prof = profileData as CaregiverProfile
      setProfile(prof)

      const { data: patientData, error: patientErr } = await supabase
        .from('patients')
        .select('*')
        .eq('id', prof.patient_id)
        .single()

      if (patientErr) throw patientErr
      setPatient(patientData as Patient)
    } catch {
      setProfile(null)
      setPatient(null)
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await loadProfile(session.user)
      }
    } catch {
      // Refresh failed
    }
  }, [loadProfile])

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user)
        }
      } catch {
        // No session
      } finally {
        setIsLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user)
        } else {
          setUser(null)
          setProfile(null)
          setPatient(null)
        }
        setIsLoading(false)
      }
    )

    return () => { subscription.unsubscribe() }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setPatient(null)
    } catch {
      // Sign out failed
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, patient, isLoading, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  return useContext(AuthContext)
}
