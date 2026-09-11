import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled React error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6 text-charcoal">
          <div className="max-w-md w-full bg-white rounded-3xl border border-border-tan shadow-xl p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 text-red-700 flex items-center justify-center text-2xl font-bold">
              ⚠️
            </div>
            <h1 className="text-xl font-extrabold text-brand">Ocurrió un problema en la pantalla</h1>
            <p className="text-xs text-sage leading-relaxed">
              La aplicación encontró un detalle inesperado pero tus datos están a salvo.
            </p>
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-left font-mono text-[11px] overflow-x-auto border border-red-200">
              {String(this.state.error?.message || this.state.error)}
            </div>
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.href = '/'
                }}
                className="flex-1 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer"
              >
                Volver al Inicio
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 rounded-xl bg-bone border border-border-tan text-charcoal text-xs font-bold hover:bg-white transition cursor-pointer"
              >
                Recargar
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
)
