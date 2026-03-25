'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CaregiverProvider } from '@/lib/contexts/CaregiverContext'
import { AppErrorBoundary } from '@/components/app/ErrorBoundary'

const NAV_ITEMS = [
  { href: '/app', label: 'Home', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { href: '/app/anchors', label: 'Anchors', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { href: '/app/log', label: 'Log', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
  { href: '/app/alerts', label: 'Alerts', icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0' },
  { href: '/app/coach', label: 'Coach', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <CaregiverProvider>
    <div className="min-h-screen bg-mirsa-bg">
      <div className="max-w-app mx-auto pb-20">
        <AppErrorBoundary>
          {children}
        </AppErrorBoundary>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-mirsa-text/10 z-40">
        <div className="max-w-app mx-auto flex">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
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
    </CaregiverProvider>
  )
}
