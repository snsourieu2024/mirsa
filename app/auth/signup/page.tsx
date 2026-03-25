'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [patientName, setPatientName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, patientName }),
      })

      const body = (await res.json()) as { ok: boolean; error?: string }

      if (!body.ok) {
        setError(body.error ?? 'Signup failed.')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Account created! Please sign in.')
        router.push('/auth/login')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mirsa-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-10">
          <span className="font-serif text-4xl font-semibold text-mirsa-text">Mirsa</span>
        </Link>

        <div className="bg-white border border-mirsa-text/10 rounded-card p-8">
          <h1 className="font-sans text-xl font-semibold text-mirsa-text mb-1">
            Get started
          </h1>
          <p className="font-sans text-sm text-mirsa-muted mb-6">
            Set up a memory companion for your loved one.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block font-sans text-sm font-medium text-mirsa-text mb-1.5">
                Your name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full font-sans text-sm border border-mirsa-text/15 rounded-xl px-4 py-3 text-mirsa-text placeholder:text-mirsa-muted/50 focus:outline-none focus:ring-2 focus:ring-mirsa-teal/30 focus:border-mirsa-teal"
                placeholder="Margaret"
              />
            </div>

            <div>
              <label htmlFor="patientName" className="block font-sans text-sm font-medium text-mirsa-text mb-1.5">
                Your loved one&apos;s name
              </label>
              <input
                id="patientName"
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full font-sans text-sm border border-mirsa-text/15 rounded-xl px-4 py-3 text-mirsa-text placeholder:text-mirsa-muted/50 focus:outline-none focus:ring-2 focus:ring-mirsa-teal/30 focus:border-mirsa-teal"
                placeholder="Robert"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block font-sans text-sm font-medium text-mirsa-text mb-1.5">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full font-sans text-sm border border-mirsa-text/15 rounded-xl px-4 py-3 text-mirsa-text placeholder:text-mirsa-muted/50 focus:outline-none focus:ring-2 focus:ring-mirsa-teal/30 focus:border-mirsa-teal"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="block font-sans text-sm font-medium text-mirsa-text mb-1.5">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full font-sans text-sm border border-mirsa-text/15 rounded-xl px-4 py-3 text-mirsa-text placeholder:text-mirsa-muted/50 focus:outline-none focus:ring-2 focus:ring-mirsa-teal/30 focus:border-mirsa-teal"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-sans text-sm font-medium text-white bg-mirsa-teal rounded-xl px-4 py-3 min-h-[48px] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center font-sans text-sm text-mirsa-muted mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-mirsa-teal font-medium hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center font-sans text-xs text-mirsa-muted/60 mt-4">
          <Link href="/demo" className="hover:text-mirsa-teal transition-colors">
            Or try the demo first
          </Link>
        </p>
      </div>
    </div>
  )
}
