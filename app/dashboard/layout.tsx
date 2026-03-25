'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { AuthProvider, useAuth } from '@/lib/contexts/AuthContext'
import { DashboardErrorBoundary } from '@/components/dashboard/ErrorBoundary'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { href: '/dashboard/anchors', label: 'Questions', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { href: '/dashboard/photos', label: 'Photos', icon: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 13a3 3 0 100-6 3 3 0 000 6z' },
  { href: '/dashboard/coach', label: 'Coach', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { href: '/dashboard/device', label: 'Device', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
]

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, signOut, profile } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mirsa-bg flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl font-semibold text-mirsa-text mb-2">Mirsa</p>
          <p className="font-sans text-sm text-mirsa-muted">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-mirsa-bg">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-mirsa-text/10 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-5 py-3">
          <Link href="/dashboard" className="font-serif text-xl font-semibold text-mirsa-text">
            Mirsa
          </Link>
          <div className="flex items-center gap-3">
            {profile && (
              <span className="font-sans text-xs text-mirsa-muted">
                {profile.full_name}
              </span>
            )}
            <button
              onClick={signOut}
              className="font-sans text-xs text-mirsa-muted hover:text-mirsa-text transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto pb-24 px-5">
        <DashboardErrorBoundary>
          {children}
        </DashboardErrorBoundary>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-mirsa-text/10 z-40">
        <div className="max-w-2xl mx-auto flex">
          {NAV_ITEMS.map(item => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 flex flex-col items-center py-2 min-h-[56px] justify-center transition-colors',
                  isActive ? 'text-mirsa-teal' : 'text-mirsa-muted'
                )}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
                <span className="font-sans text-[10px] mt-0.5">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  )
}
