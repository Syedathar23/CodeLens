import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center font-body text-on-surface p-6">
          <div className="max-w-md w-full bg-surface-container rounded-xl p-8 border border-outline-variant/20">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-6 border border-error/30">
              <span className="material-symbols-outlined text-error text-2xl">error</span>
            </div>
            <h1 className="font-headline font-bold text-2xl mb-2">Something went wrong.</h1>
            <p className="text-on-surface-variant text-sm mb-6 leading-6">
              The CodeLens AI interface encountered an unexpected error. This has been logged.
            </p>
            <div className="bg-surface-container-low p-4 rounded border border-outline-variant/20 mb-8 overflow-auto">
              <p className="font-mono-code text-[10px] text-error-dim whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="gradient-primary w-full py-3 rounded-lg text-on-primary font-bold text-sm tracking-widest uppercase hover:opacity-90"
            >
              Return Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
