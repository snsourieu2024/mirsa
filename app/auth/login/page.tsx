'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : authError.message)
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
    <div className="min-h-screen bg-mirsa-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-10">
          <span className="font-serif text-4xl font-semibold text-mirsa-text">Mirsa</span>
        </Link>

        <div className="bg-white border border-mirsa-text/10 rounded-card p-8">
          <h1 className="font-sans text-xl font-semibold text-mirsa-text mb-1">
            Welcome back
          </h1>
          <p className="font-sans text-sm text-mirsa-muted mb-6">
            Sign in to manage your loved one&apos;s companion.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block font-sans text-sm font-medium text-mirsa-text mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full font-sans text-sm border border-mirsa-text/15 rounded-xl px-4 py-3 text-mirsa-text placeholder:text-mirsa-muted/50 focus:outline-none focus:ring-2 focus:ring-mirsa-teal/30 focus:border-mirsa-teal"
                placeholder="margaret@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-sans text-sm font-medium text-mirsa-text mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full font-sans text-sm border border-mirsa-text/15 rounded-xl px-4 py-3 text-mirsa-text placeholder:text-mirsa-muted/50 focus:outline-none focus:ring-2 focus:ring-mirsa-teal/30 focus:border-mirsa-teal"
                placeholder="Your password"
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center font-sans text-sm text-mirsa-muted mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-mirsa-teal font-medium hover:underline">
            Create one
          </Link>
        </p>

        <p className="text-center font-sans text-xs text-mirsa-muted/60 mt-4">
          <Link href="/demo" className="hover:text-mirsa-teal transition-colors">
            Or try the demo instead
          </Link>
        </p>
      </div>
    </div>
  )
}
