'use client'

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  return (
    <div className="fixed inset-0 z-50 bg-mirsa-bg flex flex-col items-center justify-center p-6">
      <div className="max-w-app w-full text-center">
        <h1 className="font-serif text-3xl font-semibold text-mirsa-text mb-3">
          Welcome to Mirsa
        </h1>
        <p className="font-sans text-base text-mirsa-muted mb-8 leading-relaxed">
          A gentle memory companion for Robert. Everything you set up here helps him feel safe when you&apos;re not in the room.
        </p>
        <button
          onClick={onComplete}
          className="bg-mirsa-teal text-white font-sans text-base font-medium px-8 py-4 rounded-card min-h-[56px] hover:opacity-90 transition-opacity"
        >
          Get started
        </button>
      </div>
    </div>
  )
}
