export interface HospitalizacionDetalleViewProps {
  stayId: string
  canEdit?: boolean
  onBack?: () => void
}

export function HospitalizacionDetalleView({
  stayId,
  canEdit: _canEdit = false,
  onBack,
}: HospitalizacionDetalleViewProps) {
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
            Detalle de Hospitalización
          </h1>
          <p className="text-sm text-sage mt-1">
            Seguimiento de evolución, notas médicas y alta del paciente.
          </p>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="self-start sm:self-auto px-4 py-2 text-sm font-medium rounded-xl border border-warm-grey text-charcoal hover:bg-bone transition"
          >
            Volver a la lista
          </button>
        )}
      </div>

      <div className="p-8 sm:p-12 bg-white rounded-2xl border border-warm-grey/40 shadow-xs flex flex-col items-center justify-center text-center">
        <p className="text-base font-semibold text-charcoal">
          Detalle de estadía: {stayId}
        </p>
        <p className="text-sm text-sage mt-1">
          Detalle, notas de evolución y alta médica en preparación.
        </p>
      </div>
    </div>
  )
}
