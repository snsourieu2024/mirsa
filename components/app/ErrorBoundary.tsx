'use client'

import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-mirsa-bg flex items-center justify-center p-6">
          <div className="text-center max-w-xs">
            <p className="font-serif text-lg text-mirsa-text mb-2">
              Something went wrong
            </p>
            <p className="font-sans text-sm text-mirsa-muted mb-6">
              This page ran into an issue. You can go back to the dashboard and try again.
            </p>
            <a
              href="/app"
              className="inline-block font-sans text-sm font-medium text-white bg-mirsa-teal px-6 py-3 rounded-card min-h-[48px]"
            >
              Back to dashboard
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
