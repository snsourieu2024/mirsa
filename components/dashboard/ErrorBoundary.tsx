'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="text-center max-w-xs">
            <p className="font-serif text-lg text-mirsa-text mb-2">
              Something went wrong
            </p>
            <p className="font-sans text-sm text-mirsa-muted mb-6">
              This page ran into an issue. You can go back and try again.
            </p>
            <a
              href="/dashboard"
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
