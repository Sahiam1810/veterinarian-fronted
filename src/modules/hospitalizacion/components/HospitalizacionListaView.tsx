export interface HospitalizacionListaViewProps {
  canView?: boolean
  canCreate?: boolean
  canEdit?: boolean
  onSelectStay?: (stayId: string) => void
}

export function HospitalizacionListaView({
  canView = false,
  canCreate: _canCreate = false,
  canEdit: _canEdit = false,
  onSelectStay: _onSelectStay,
}: HospitalizacionListaViewProps) {
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-warm-grey/40 text-center gap-3">
        <p className="text-base font-bold text-charcoal">Acceso Restringido</p>
        <p className="text-sm text-sage">
          No tienes permisos para visualizar el módulo de hospitalización.
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
            Hospitalización
          </h1>
          <p className="text-sm text-sage mt-1">
            Gestión de pacientes hospitalizados y seguimiento clínico.
          </p>
        </div>
      </div>

      <div className="p-8 sm:p-12 bg-white rounded-2xl border border-warm-grey/40 shadow-xs flex flex-col items-center justify-center text-center">
        <p className="text-base font-semibold text-charcoal">
          Lista de hospitalización
        </p>
        <p className="text-sm text-sage mt-1">
          Módulo de hospitalización en preparación.
        </p>
      </div>
    </div>
  )
}
