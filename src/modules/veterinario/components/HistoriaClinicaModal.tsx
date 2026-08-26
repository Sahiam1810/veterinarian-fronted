import { PawIcon } from '@/global/components'
import type { HistoriaClinicaPayload } from '../types'
import { CloseIcon } from './MascotasIcons'
import { ViewPopup } from './ViewPopup'

interface HistoriaClinicaModalProps {
  historia: HistoriaClinicaPayload
  onClose: () => void
}

// Modal centrado sobre toda la UI; sin scroll (info compacta)
export function HistoriaClinicaModal({ historia, onClose }: HistoriaClinicaModalProps) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Historia clínica de ${historia.displayName}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] cursor-pointer border-0"
        aria-label="Cerrar historia clínica"
        onClick={onClose}
      />

      <ViewPopup
        animationKey={historia.petId}
        className="relative z-10 w-full max-w-5xl max-h-[min(92vh,880px)] min-h-0"
      >
        <div className="bg-bone border border-border-tan rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[min(92vh,880px)]">
          <header className="shrink-0 flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border-b border-border-tan bg-white">
            <PhotoBlock name={historia.displayName} sexLabel={historia.sexLabel} photoUrl={historia.photoUrl} />

            <div className="flex-1 min-w-0 grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2 content-start">
              <div className="col-span-2 lg:col-span-4 flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-extrabold text-brand tracking-tight truncate">
                    {historia.displayName}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-sage font-medium">
                    ID: {historia.patientCode}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-sage-soft text-brand text-[11px] font-bold">
                    {historia.breed}
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center bg-white"
                    aria-label="Cerrar"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <MetaItem label="Edad" value={historia.ageLabel} />
              <MetaItem label="Peso Actual" value={historia.weightLabel} />
              <MetaItem label="Dueño" value={historia.ownerName} />
              <MetaItem label="Contacto" value={historia.ownerPhone} />
            </div>
          </header>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-3 p-3 sm:p-4 overflow-hidden">
            {/* Consultas */}
            <section className="lg:col-span-3 min-h-0 min-w-0 overflow-hidden flex flex-col gap-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-sage shrink-0">
                Historial de Consultas
              </h3>
              <div className="min-h-0 flex-1 overflow-hidden flex flex-col gap-2">
                {historia.consultas.map((consulta) => (
                  <article
                    key={consulta.id}
                    className="rounded-xl border border-border-tan bg-white p-2.5 sm:p-3 min-w-0 overflow-hidden"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1.5">
                      <span className="text-xs font-extrabold text-brand">{consulta.dateLabel}</span>
                      <span className="text-xs font-bold text-charcoal">{consulta.typeLabel}</span>
                      {consulta.veterinarian && (
                        <span className="text-[11px] text-sage font-medium">
                          · {consulta.veterinarian}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-charcoal/85 leading-snug line-clamp-2">
                      <span className="font-bold text-sage">Motivo: </span>
                      {consulta.motivo}
                    </p>
                    {consulta.diagnostico && (
                      <p className="text-[11px] sm:text-xs text-charcoal/85 leading-snug mt-1 line-clamp-2">
                        <span className="font-bold text-sage">Diagnóstico: </span>
                        {consulta.diagnostico}
                      </p>
                    )}
                    {consulta.tratamientoIndicaciones.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {consulta.tratamientoIndicaciones.map((item) => (
                          <li
                            key={item}
                            className="text-[11px] sm:text-xs text-charcoal/80 leading-snug line-clamp-1 pl-2 relative before:content-['•'] before:absolute before:left-0 before:text-brand"
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

            {/* Vacunas + signos */}
            <section className="lg:col-span-2 min-h-0 min-w-0 overflow-hidden flex flex-col gap-3">
              <div className="rounded-xl border border-border-tan bg-white p-2.5 sm:p-3 overflow-hidden shrink-0">
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-sage mb-2">
                  Control Vacunas
                </h3>
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
              </div>

              <div className="rounded-xl border border-border-tan bg-white p-2.5 sm:p-3 overflow-hidden flex-1 min-h-0">
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-sage mb-2">
                  Últimos Signos Vitales
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <VitalItem label="Temp" value={historia.signosVitales.temperatura} />
                  <VitalItem label="F.C." value={historia.signosVitales.frecuenciaCardiaca} />
                  <VitalItem label="F.R." value={historia.signosVitales.frecuenciaRespiratoria} />
                  <VitalItem label="Mucosas" value={historia.signosVitales.mucosas} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </ViewPopup>
    </div>
  )
}

function PhotoBlock({
  name,
  sexLabel,
  photoUrl,
}: {
  name: string
  sexLabel: string
  photoUrl?: string | null
}) {
  return (
    <div className="relative shrink-0">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-border-tan"
        />
      ) : (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-cream text-sage flex items-center justify-center border border-border-tan">
          <PawIcon className="w-7 h-7" />
        </div>
      )}
      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-brand text-white text-[9px] sm:text-[10px] font-bold shadow-sm">
        {sexLabel}
      </span>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-sage">{label}</p>
      <p className="text-xs sm:text-sm font-bold text-charcoal truncate" title={value}>
        {value}
      </p>
    </div>
  )
}

function VitalItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bone/80 border border-border-tan/70 px-2.5 py-2 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-sage">{label}</p>
      <p className="text-sm font-extrabold text-brand truncate">{value}</p>
    </div>
  )
}
