import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mirsa-bg font-sans overflow-hidden">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-mirsa-bg/80 backdrop-blur-md">
        <span className="font-serif text-xl font-semibold text-mirsa-text">Mirsa</span>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="font-sans text-sm font-medium text-mirsa-muted hover:text-mirsa-text transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="font-sans text-sm font-medium text-white bg-mirsa-teal px-5 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* Subtle gradient orbs */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2d9e75 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-2xl">
          <p className="font-sans text-sm font-medium tracking-widest text-mirsa-teal uppercase mb-6">
            For Alzheimer&apos;s caregivers
          </p>
          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-semibold text-mirsa-text mb-6 leading-[0.95]">
            Mirsa
          </h1>
          <p className="font-serif text-xl md:text-2xl text-mirsa-muted italic mb-4">
            A gentle memory companion
          </p>
          <p className="font-sans text-base md:text-lg text-mirsa-muted/80 max-w-lg mx-auto mb-10 leading-relaxed">
            When your loved one asks the same question for the tenth time today,
            Mirsa answers in your words — so they feel safe, and you get a moment to breathe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="bg-mirsa-teal text-white font-sans text-base font-medium px-8 py-4 rounded-card hover:opacity-90 transition-opacity min-h-[56px] flex items-center"
            >
              Get started free
            </Link>
            <Link
              href="/demo"
              className="text-mirsa-muted font-sans text-base font-medium px-8 py-4 rounded-card border border-mirsa-text/10 hover:border-mirsa-text/25 transition-colors min-h-[56px] flex items-center"
            >
              See the demo
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b6b6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </header>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-mirsa-text text-center mb-4">
            Two surfaces, one family
          </h2>
          <p className="font-sans text-base text-mirsa-muted text-center mb-16 max-w-xl mx-auto">
            An ambient screen that listens for Robert, and a mobile app that keeps Margaret connected.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Device */}
            <div className="border border-mirsa-text/10 rounded-card p-8">
              <div className="w-12 h-12 rounded-full bg-mirsa-device flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#faf9f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className="font-sans text-lg font-semibold text-mirsa-text mb-2">
                The Device
              </h3>
              <p className="font-sans text-sm text-mirsa-muted leading-relaxed">
                An iPad in the living room that listens for Robert&apos;s questions. When he asks
                &ldquo;Where are my keys?&rdquo;, it answers in Margaret&apos;s own words — with a photo
                of the key hook, if she set one.
              </p>
            </div>

            {/* Caregiver app */}
            <div className="border border-mirsa-text/10 rounded-card p-8">
              <div className="w-12 h-12 rounded-full bg-mirsa-teal/10 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d9e75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <h3 className="font-sans text-lg font-semibold text-mirsa-text mb-2">
                The Caregiver App
              </h3>
              <p className="font-sans text-sm text-mirsa-muted leading-relaxed">
                Margaret sees every conversation, tracks patterns over weeks, receives real-time alerts
                when Robert is distressed, and teaches Mirsa new answers — all from her phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core principle */}
      <section className="py-24 px-6 bg-mirsa-device">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-sans text-sm font-medium tracking-widest text-mirsa-teal uppercase mb-6">
            Core principle
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#faf9f6] mb-6">
            Mirsa never makes things up
          </h2>
          <p className="font-sans text-base text-[#faf9f6]/60 leading-relaxed">
            Every answer Robert hears was written by Margaret. The AI classifies which answer to play —
            it never generates content spoken to the patient. This is not a design choice. It is an
            architectural constraint enforced in code.
          </p>
        </div>
      </section>

      {/* The four moments */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-mirsa-text text-center mb-16">
            Four moments that matter
          </h2>

          <div className="space-y-12">
            {[
              {
                number: '01',
                title: 'The voice',
                description: 'Robert asks "Where are my keys?" The iPad answers in a warm voice. A photo of the key hook fades in. He nods and walks to the door.',
              },
              {
                number: '02',
                title: 'The real-time alert',
                description: 'Robert asks about his medication — an elevated concern. Margaret\'s phone buzzes within two seconds. She knows, even from another room.',
              },
              {
                number: '03',
                title: 'The teach-this loop',
                description: 'Robert asks something new. Margaret sees it in her log, taps "Teach this", writes an answer. Robert asks again. The device answers immediately.',
              },
              {
                number: '04',
                title: 'The weekly summary',
                description: '"Margaret, you answered every one of those questions before you even knew he\'d asked." A letter that sees her.',
              },
            ].map((moment) => (
              <div key={moment.number} className="flex gap-6">
                <div className="shrink-0">
                  <span className="font-sans text-3xl font-bold text-mirsa-teal/20">
                    {moment.number}
                  </span>
                </div>
                <div>
                  <h3 className="font-sans text-lg font-semibold text-mirsa-text mb-2">
                    {moment.title}
                  </h3>
                  <p className="font-sans text-sm text-mirsa-muted leading-relaxed">
                    {moment.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-mirsa-text mb-4">
            Try Mirsa for your family
          </h2>
          <p className="font-sans text-base text-mirsa-muted mb-8">
            Set up a companion for your loved one in minutes. Free to use.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center bg-mirsa-teal text-white font-sans text-base font-medium px-10 py-4 rounded-card hover:opacity-90 transition-opacity min-h-[56px]"
            >
              Create your account
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center text-mirsa-muted font-sans text-base font-medium px-8 py-4 rounded-card border border-mirsa-text/10 hover:border-mirsa-text/25 transition-colors min-h-[56px]"
            >
              Try the demo first
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-mirsa-text/10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="font-serif text-lg font-semibold text-mirsa-text">Mirsa</p>
          <p className="font-sans text-xs text-mirsa-muted">
            Built with care. Hackathon 2026.
          </p>
        </div>
      </footer>
    </div>
  )
}
