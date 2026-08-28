import type { ReactNode } from 'react'
import {
  CLIENTE_CLINIC_PHONE_LABEL,
  CLIENTE_CLINIC_PHONE_TEL,
} from '../utils/appointmentRules'

interface ClienteCallClinicButtonProps {
  variant?: 'brand' | 'light' | 'outline'
  className?: string
  children?: ReactNode
}

// Botón para contactar recepción cuando la cita ya no es modificable en línea
export function ClienteCallClinicButton({
  variant = 'light',
  className = '',
  children,
}: ClienteCallClinicButtonProps) {
  const variantClass =
    variant === 'brand'
      ? 'bg-brand text-white hover:bg-brand-hover'
      : variant === 'outline'
        ? 'border border-border-tan bg-white text-charcoal hover:bg-bone'
        : 'bg-white text-brand hover:bg-bone'

  return (
    <a
      href={`tel:${CLIENTE_CLINIC_PHONE_TEL}`}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${variantClass} ${className}`.trim()}
    >
      <PhoneIcon className="w-4 h-4 shrink-0" />
      {children ?? `Llamar ${CLIENTE_CLINIC_PHONE_LABEL}`}
    </a>
  )
}

export function ClienteCallClinicHint({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-white/75 leading-relaxed ${className}`.trim()}>
      Las citas ya atendidas solo pueden gestionarse llamando a recepción.
    </p>
  )
}

function PhoneIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
