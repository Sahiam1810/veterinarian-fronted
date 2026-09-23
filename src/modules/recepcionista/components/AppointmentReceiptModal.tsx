import type { SVGProps } from 'react'
import type { AppointmentReceiptResponse } from '../services/recepAgendaService'

function PrinterIcon({ className = 'w-4 h-4', ...props }: SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

function XIcon({ className = 'w-5 h-5', ...props }: SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

interface AppointmentReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receipt: AppointmentReceiptResponse | null
}

export function AppointmentReceiptModal({
  open,
  onOpenChange,
  receipt,
}: AppointmentReceiptModalProps) {
  if (!open || !receipt) return null

  const handlePrint = () => {
    window.print()
  }

  const formattedDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(receipt.scheduledStart))

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
  }).format(receipt.servicePrice)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm print:bg-white print:p-0 print:backdrop-blur-none">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:max-w-none">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-tan print:hidden">
          <h2 className="text-lg font-bold text-brand">Recibo de Pago</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-sage hover:text-charcoal transition"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="text-center pb-4 border-b border-border-tan">
            <h3 className="font-extrabold text-xl text-brand">Huellitas Veterinarian</h3>
            <p className="text-sm font-medium text-sage">NIT: 900.123.456-7</p>
          </div>

          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div className="font-bold text-sage">Fecha:</div>
            <div className="text-right font-medium text-charcoal">{formattedDate}</div>

            <div className="font-bold text-sage">Mascota:</div>
            <div className="text-right font-medium text-charcoal">{receipt.petName}</div>

            <div className="font-bold text-sage">Dueño:</div>
            <div className="text-right font-medium text-charcoal">{receipt.ownerName}</div>

            <div className="font-bold text-sage">Teléfono:</div>
            <div className="text-right font-medium text-charcoal">{receipt.ownerPhone || 'N/A'}</div>

            <div className="font-bold text-sage">Servicio:</div>
            <div className="text-right font-medium text-charcoal">{receipt.serviceName}</div>
          </div>

          <div className="border-t border-border-tan pt-4 flex justify-between items-center">
            <span className="font-bold text-sage">Total Pagado:</span>
            <span className="text-xl font-black text-brand">{formattedPrice}</span>
          </div>

          <div className="text-center pt-2 text-sm text-green-600 font-bold bg-green-50 rounded-lg p-2 border border-green-100">
            ¡Pago Registrado Exitosamente!
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-bone/30 border-t border-border-tan flex justify-end gap-3 print:hidden">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-xl text-sm font-bold text-charcoal hover:bg-bone transition"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-brand text-white hover:bg-brand-hover transition flex items-center gap-2"
          >
            <PrinterIcon className="w-4 h-4" />
            Imprimir Recibo
          </button>
        </div>
      </div>
    </div>
  )
}
