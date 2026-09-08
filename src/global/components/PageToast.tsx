import { createPortal } from 'react-dom'

// Toast arriba y centrado en toda la ventana (portal a body).

export type PageToastTone = 'success' | 'warning'

interface PageToastProps {
  message: string
  tone?: PageToastTone
}

export function PageToast({ message, tone = 'success' }: PageToastProps) {
  const isWarning = tone === 'warning'

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-5 z-[90] flex justify-center px-4"
      aria-live="polite"
    >
      <div
        role="alert"
        className={`toast-pop-up-y w-full max-w-[26rem] rounded-2xl border px-4 py-3 flex items-start gap-3 shadow-[0_12px_32px_rgba(35,78,70,0.22)] ${
          isWarning
            ? 'bg-white text-charcoal border-terracotta/30'
            : 'bg-brand text-white border-white/20'
        }`}
      >
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
            isWarning ? 'bg-terracotta-soft text-terracotta' : 'bg-white/20 text-white'
          }`}
          aria-hidden
        >
          {isWarning ? '!' : '✓'}
        </span>
        <p className="text-sm font-semibold leading-snug">{message}</p>
      </div>
    </div>,
    document.body,
  )
}
