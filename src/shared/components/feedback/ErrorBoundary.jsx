import React from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Crash Caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-ivory flex items-center justify-center p-6 font-body">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-brand-gold/10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 heritage-gradient"></div>
            
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="text-red-500 w-10 h-10" />
            </div>

            <h2 className="font-headline text-2xl font-bold text-[#2B2620] mb-4">System Interruption</h2>
            <p className="text-brand-text/60 text-sm leading-relaxed mb-10 italic">
              An unexpected error occurred in the luxury interface. Our automated audit system has been notified.
            </p>

            <div className="bg-brand-gold/5 p-4 rounded-2xl mb-10 text-left border border-brand-gold/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-goldDark mb-2">Technical Insight</p>
              <code className="text-[10px] text-[#2B2620] block break-words opacity-70">
                {this.state.error?.message || 'Internal logic mismatch'}
              </code>
            </div>

            <button 
              onClick={() => window.location.href = '/'}
              className="w-full heritage-gradient text-white py-5 rounded-full font-bold text-sm shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <RefreshCcw className="w-5 h-5" />
              Reset Heritage Experience
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
