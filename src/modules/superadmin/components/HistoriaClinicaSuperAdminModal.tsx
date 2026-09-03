import { PawIcon, MedicalHistoryIcon } from '@/global/components'
import type { SuperAdminMascota } from '../types'
import { useHistoriaClinicaSuperAdmin } from '../hooks'

export interface HistoriaClinicaSuperAdminModalProps {
  mascota: SuperAdminMascota | null
  onClose: () => void
}

export function HistoriaClinicaSuperAdminModal({
  mascota,
  onClose,
}: HistoriaClinicaSuperAdminModalProps) {
  const { historia, isLoading, error, reload } = useHistoriaClinicaSuperAdmin(mascota)

  if (!mascota) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 overflow-hidden modal-backdrop-animate"
      role="dialog"
      aria-modal="true"
      aria-label={`Historia clínica de ${mascota.name}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-xs cursor-pointer border-0"
        aria-label="Cerrar historia clínica"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl max-h-[min(92vh,880px)] min-h-0 modal-content-animate">
        <div className="bg-bone border border-border-tan rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[min(92vh,880px)]">
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-10">
              <div className="w-10 h-10 border-4 border-[#234E46]/20 border-t-[#234E46] rounded-full animate-spin" />
              <p className="text-sm font-semibold text-sage">Cargando historia clínica...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-10 text-center">
              <p className="text-sm font-semibold text-terracotta">{error}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reload}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#234E46] text-white hover:bg-[#1B3C36] transition cursor-pointer"
                >
                  Reintentar
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-border-tan text-sage hover:text-brand transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && historia && (
            <>
              {/* Header Superior con Información del Paciente */}
              <header className="shrink-0 flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border-b border-border-tan bg-white">
                {/* Foto / Avatar con badge de sexo */}
                <div className="relative shrink-0">
                  {historia.photoUrl ? (
                    <img
                      src={historia.photoUrl}
                      alt={historia.displayName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-border-tan"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#E8F2EF] text-[#234E46] flex items-center justify-center border border-[#234E46]/15 font-bold text-2xl">
                      {historia.displayName.charAt(0)}
                    </div>
                  )}
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-brand text-white text-[9px] sm:text-[10px] font-bold shadow-sm">
                    {historia.sexLabel}
                  </span>
                </div>

                {/* Metadatos en Grid */}
                <div className="flex-1 min-w-0 grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2 content-start">
                  <div className="col-span-2 lg:col-span-4 flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-extrabold text-brand tracking-tight truncate">
                          {historia.displayName}
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-mint-soft text-[#234E46] text-[11px] font-bold">
                          <MedicalHistoryIcon className="w-3.5 h-3.5" />
                          Historia Clínica
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-sage font-medium">
                        ID: {historia.patientCode}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-[#E8F2EF] text-[#234E46] text-[11px] font-bold border border-[#234E46]/15">
                        {historia.breed}
                      </span>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center bg-white"
                        aria-label="Cerrar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-sage">Edad</p>
                    <p className="text-xs sm:text-sm font-bold text-charcoal truncate">
                      {historia.ageLabel}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-sage">Peso Actual</p>
                    <p className="text-xs sm:text-sm font-bold text-charcoal truncate">
                      {historia.weightLabel}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-sage">Dueño</p>
                    <p className="text-xs sm:text-sm font-bold text-[#234E46] truncate">
                      {historia.ownerName}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-sage">Contacto</p>
                    <p className="text-xs sm:text-sm font-bold text-charcoal truncate">
                      {historia.ownerPhone}
                    </p>
                  </div>
                </div>
              </header>

              {/* Cuerpo Central con Consultas, Vacunas y Signos */}
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-3 p-3 sm:p-4 overflow-y-auto">
                {/* Columna Izquierda (3/5): Historial de Consultas */}
                <section className="lg:col-span-3 min-h-0 min-w-0 flex flex-col gap-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-sage shrink-0">
                    Historial de Consultas
                  </h3>
                  <div className="flex-1 flex flex-col gap-2">
                    {historia.consultas.length === 0 && (
                      <p className="text-xs text-sage font-medium py-4 text-center">
                        Esta mascota no tiene consultas registradas.
                      </p>
                    )}
                    {historia.consultas.map((consulta) => (
                      <article
                        key={consulta.id}
                        className="rounded-xl border border-border-tan bg-white p-3 min-w-0 shadow-2xs"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1.5">
                          <span className="text-xs font-extrabold text-[#234E46]">
                            {consulta.dateLabel}
                          </span>
                          <span className="text-xs font-bold text-charcoal">
                            {consulta.typeLabel}
                          </span>
                          {consulta.veterinarian && (
                            <span className="text-[11px] text-sage font-medium">
                              · {consulta.veterinarian}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-charcoal/85 leading-snug">
                          <span className="font-bold text-sage">Motivo: </span>
                          {consulta.motivo}
                        </p>
                        {consulta.diagnostico && (
                          <p className="text-[11px] sm:text-xs text-charcoal/85 leading-snug mt-1">
                            <span className="font-bold text-sage">Diagnóstico: </span>
                            {consulta.diagnostico}
                          </p>
                        )}
                        {consulta.tratamientoIndicaciones.length > 0 && (
                          <ul className="mt-2 space-y-0.5">
                            {consulta.tratamientoIndicaciones.map((item, idx) => (
                              <li
                                key={idx}
                                className="text-[11px] sm:text-xs text-charcoal/80 leading-snug pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[#234E46]"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </article>
                    ))}
                  </div>
                </section>

                {/* Columna Derecha (2/5): Vacunas + Signos Vitales */}
                <section className="lg:col-span-2 min-h-0 min-w-0 flex flex-col gap-3">
                  {/* Tabla de Vacunas */}
                  <div className="rounded-xl border border-border-tan bg-white p-3 shadow-2xs shrink-0">
                    <h3 className="text-[11px] font-bold uppercase tracking-wide text-sage mb-2">
                      Control Vacunas
                    </h3>
                    {historia.vacunas.length === 0 ? (
                      <p className="text-[11px] text-sage font-medium py-2 text-center">
                        Sin vacunas registradas.
                      </p>
                    ) : (
                      <table className="w-full text-left table-fixed">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-wide text-sage border-b border-border-tan">
                            <th className="py-1 pr-1 font-bold">Vacuna</th>
                            <th className="py-1 px-1 font-bold">Aplicada</th>
                            <th className="py-1 pl-1 font-bold">Próxima</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historia.vacunas.map((vacuna) => (
                            <tr key={vacuna.id} className="border-b border-border-tan/50 last:border-b-0">
                              <td className="py-1.5 pr-1 text-[11px] sm:text-xs font-bold text-charcoal truncate">
                                {vacuna.name}
                              </td>
                              <td className="py-1.5 px-1 text-[11px] sm:text-xs text-charcoal/80 whitespace-nowrap">
                                {vacuna.appliedLabel}
                              </td>
                              <td className="py-1.5 pl-1 text-[11px] sm:text-xs text-charcoal/80 whitespace-nowrap">
                                {vacuna.nextLabel}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Signos Vitales */}
                  <div className="rounded-xl border border-border-tan bg-white p-3 shadow-2xs flex-1 min-h-0">
                    <h3 className="text-[11px] font-bold uppercase tracking-wide text-sage mb-2">
                      Últimos Signos Vitales
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-bone/80 border border-border-tan/70 px-2.5 py-2 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-sage">Temp</p>
                        <p className="text-sm font-extrabold text-[#234E46] truncate">
                          {historia.signosVitales.temperatura}
                        </p>
                      </div>
                      <div className="rounded-lg bg-bone/80 border border-border-tan/70 px-2.5 py-2 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-sage">F.C.</p>
                        <p className="text-sm font-extrabold text-[#234E46] truncate">
                          {historia.signosVitales.frecuenciaCardiaca}
                        </p>
                      </div>
                      <div className="rounded-lg bg-bone/80 border border-border-tan/70 px-2.5 py-2 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-sage">F.R.</p>
                        <p className="text-sm font-extrabold text-[#234E46] truncate">
                          {historia.signosVitales.frecuenciaRespiratoria}
                        </p>
                      </div>
                      <div className="rounded-lg bg-bone/80 border border-border-tan/70 px-2.5 py-2 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-sage">Mucosas</p>
                        <p className="text-sm font-extrabold text-[#234E46] truncate">
                          {historia.signosVitales.mucosas}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* Footer del Modal */}
          <footer className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-t border-border-tan bg-white">
            <div className="flex items-center gap-1.5 text-xs text-sage font-medium">
              <PawIcon className="w-4 h-4 text-terracotta" />
              <span>Ficha médica oficial - Huellitas Veterinaria</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#234E46] text-white hover:bg-[#1B3C36] transition cursor-pointer"
            >
              Cerrar Ficha
            </button>
          </footer>
        </div>
      </div>
    </div>
  )
}
