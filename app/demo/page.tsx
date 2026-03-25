import Link from 'next/link'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-mirsa-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-5xl md:text-6xl font-semibold text-mirsa-text mb-3">
          Mirsa
        </h1>
        <p className="font-serif text-xl text-mirsa-muted italic">
          A gentle memory companion
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full mb-12">
        <Link
          href="/device"
          target="_blank"
          className="group border border-mirsa-text/10 rounded-card p-8 text-center hover:border-mirsa-teal/40 transition-all hover:shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-mirsa-teal/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2d9e75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h2 className="font-sans text-lg font-semibold text-mirsa-text mb-2">
            Device Display
          </h2>
          <p className="font-sans text-sm text-mirsa-muted mb-5">
            Robert&apos;s screen — open this on the iPad
          </p>
          <span className="inline-flex items-center justify-center bg-mirsa-teal text-white font-sans text-sm font-medium px-6 py-3 rounded-card group-hover:opacity-90 transition-opacity min-h-[48px]">
            Open Device
          </span>
        </Link>

        <Link
          href="/app"
          target="_blank"
          className="group border border-mirsa-text/10 rounded-card p-8 text-center hover:border-mirsa-text/30 transition-all hover:shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-mirsa-text/5 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b6b6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <h2 className="font-sans text-lg font-semibold text-mirsa-text mb-2">
            Caregiver App
          </h2>
          <p className="font-sans text-sm text-mirsa-muted mb-5">
            Margaret&apos;s view — open this on your phone or laptop
          </p>
          <span className="inline-flex items-center justify-center bg-mirsa-text text-white font-sans text-sm font-medium px-6 py-3 rounded-card group-hover:opacity-90 transition-opacity min-h-[48px]">
            Open Caregiver App
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 bg-mirsa-teal/10 px-4 py-2 rounded-full">
        <div className="w-2 h-2 rounded-full bg-mirsa-teal" />
        <p className="font-sans text-sm text-mirsa-teal font-medium">
          Demo data loaded — Robert &amp; Margaret
        </p>
      </div>
    </div>
  )
}
