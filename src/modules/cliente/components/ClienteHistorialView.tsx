import { CalendarPlusIcon, StethoscopeIcon } from '@/global/components'
import type {
  ClienteHistorialConsultation,
  ClienteHistorialPetRecord,
  ClienteHistorialVaccine,
} from '../types'

interface ClienteHistorialViewProps {
  pets: ClienteHistorialPetRecord[]
  selectedPetId: string | null
  selectedRecord: ClienteHistorialPetRecord | null
  onSelectPet: (petId: string) => void
  onScheduleVaccineAppointment?: () => void
}

export function ClienteHistorialView({
  pets,
  selectedPetId,
  selectedRecord,
  onSelectPet,
  onScheduleVaccineAppointment,
}: ClienteHistorialViewProps) {
  return (
    <section className="h-full min-h-0 flex flex-col gap-5 sm:gap-6 overflow-hidden">
      <header className="shrink-0">
        <h1 className="text-base sm:text-lg font-bold text-charcoal">
          Selecciona una mascota
        </h1>
        <div className="mt-4 flex items-end gap-3 sm:gap-4 overflow-x-auto pb-1">
          {pets.map((record) => {
            const isActive = record.pet.id === selectedPetId
            return (
              <button
                key={record.pet.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectPet(record.pet.id)}
                className={`flex flex-col items-center gap-2.5 shrink-0 cursor-pointer rounded-2xl px-3 py-2.5 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bone ${
                  isActive
                    ? 'bg-brand/5 shadow-[0_4px_14px_rgba(35,78,70,0.08)]'
                    : 'hover:bg-white/70'
                }`}
              >
                <PetSelectorAvatar
                  name={record.pet.name}
                  photoUrl={record.pet.photoUrl}
                  isActive={isActive}
                />
                <span
                  className={`text-sm font-bold transition-colors ${
                    isActive ? 'text-brand' : 'text-sage group-hover:text-charcoal'
                  }`}
                >
                  {record.pet.name}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {selectedRecord ? (
        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-4 sm:gap-5 overflow-hidden">
          <ConsultasRecientesPanel consultations={selectedRecord.consultations} />
          <VacunasPanel
            vaccines={selectedRecord.vaccines}
            onScheduleVaccineAppointment={onScheduleVaccineAppointment}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white rounded-3xl border border-border-tan">
          <p className="text-sm text-sage font-medium">Selecciona una mascota para ver su historial.</p>
        </div>
      )}
    </section>
  )
}

function ConsultasRecientesPanel({
  consultations,
}: {
  consultations: ClienteHistorialConsultation[]
}) {
  return (
    <section className="min-h-0 flex flex-col bg-white rounded-3xl border border-border-tan shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-border-tan/70 shrink-0">
        <h2 className="text-base sm:text-lg font-bold text-charcoal">Consultas Recientes</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5 sm:py-6">
        {consultations.length === 0 ? (
          <p className="text-sm text-sage font-medium">No hay consultas registradas.</p>
        ) : (
          <ol className="relative space-y-8 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border-tan">
            {consultations.map((item) => (
              <li key={item.id} className="relative pl-8">
                <span className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-brand ring-4 ring-white" />
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-sage">
                  {item.dateLabel}
                </p>
                <h3 className="mt-1 text-base sm:text-lg font-bold text-charcoal">{item.serviceName}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-sage font-medium">
                  <StethoscopeIcon className="w-4 h-4 shrink-0" />
                  <span>{item.professionalName}</span>
                </p>

                <div className="mt-4 rounded-2xl bg-bone/70 border border-border-tan/60 p-4 space-y-3">
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-sage">
                      Síntomas
                    </p>
                    <p className="mt-1 text-sm text-charcoal leading-relaxed">{item.symptoms}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-sage">
                      Diagnóstico
                    </p>
                    <p className="mt-1 text-sm text-charcoal leading-relaxed">{item.diagnosis}</p>
                  </div>
                  {item.treatment ? (
                    <div>
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-sage">
                        Tratamiento
                      </p>
                      <p className="mt-1 text-sm text-charcoal leading-relaxed">{item.treatment}</p>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

function VacunasPanel({
  vaccines,
  onScheduleVaccineAppointment,
}: {
  vaccines: ClienteHistorialVaccine[]
  onScheduleVaccineAppointment?: () => void
}) {
  return (
    <section className="min-h-0 flex flex-col bg-white rounded-3xl border border-border-tan shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-border-tan/70 shrink-0">
        <h2 className="text-base sm:text-lg font-bold text-charcoal">Vacunas</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.9fr)] gap-2 px-4 sm:px-5 py-3 bg-brand/10 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-brand">
          <span>Vacuna</span>
          <span>Dosis</span>
          <span>Aplicación</span>
        </div>

        <div className="divide-y divide-border-tan/60">
          {vaccines.map((vaccine) => (
            <div key={vaccine.id} className="px-4 sm:px-5 py-4">
              <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.9fr)] gap-2 items-start">
                <span className="text-sm font-bold text-charcoal">{vaccine.name}</span>
                <span className="text-sm text-sage">{vaccine.doseLabel}</span>
                <span className="text-sm text-sage">{vaccine.appliedDateLabel}</span>
              </div>
              <VaccineStatusBadge vaccine={vaccine} />
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5 border-t border-border-tan/70 shrink-0">
        <button
          type="button"
          onClick={onScheduleVaccineAppointment}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white px-4 py-3 text-sm font-bold hover:bg-brand-hover transition cursor-pointer"
        >
          <CalendarPlusIcon className="w-5 h-5 shrink-0" />
          Agendar Cita para Vacuna
        </button>
      </div>
    </section>
  )
}

function VaccineStatusBadge({ vaccine }: { vaccine: ClienteHistorialVaccine }) {
  if (vaccine.status === 'vencida') {
    return (
      <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-red-600">
        <WarningIcon className="w-3.5 h-3.5 shrink-0" />
        {vaccine.statusLabel}
      </p>
    )
  }

  if (vaccine.status === 'proxima') {
    return (
      <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand">
        <CalendarSmallIcon className="w-3.5 h-3.5 shrink-0" />
        {vaccine.statusLabel}
      </p>
    )
  }

  return (
    <p className="mt-2 text-xs font-bold text-sage">{vaccine.statusLabel}</p>
  )
}

function PetSelectorAvatar({
  name,
  photoUrl,
  isActive,
}: {
  name: string
  photoUrl: string | null
  isActive: boolean
}) {
  const shellClass = isActive
    ? 'ring-[3px] ring-brand ring-offset-[3px] ring-offset-bone shadow-[0_4px_14px_rgba(35,78,70,0.14)] scale-100'
    : 'ring-1 ring-border-tan/80 ring-offset-0 scale-[0.96] opacity-75 saturate-50'

  const innerClass = isActive
    ? 'border-brand/20 bg-brand/10 text-brand'
    : 'border-border-tan/70 bg-white text-sage'

  if (photoUrl) {
    return (
      <span
        className={`inline-flex rounded-full transition-all duration-200 ${shellClass}`}
      >
        <img
          src={photoUrl}
          alt={name}
          className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full object-cover border-2 ${innerClass}`}
        />
      </span>
    )
  }

  return (
    <span
      className={`inline-flex w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full border-2 items-center justify-center text-xl font-extrabold transition-all duration-200 ${shellClass} ${innerClass}`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

function CalendarSmallIcon({ className = 'w-4 h-4' }: { className?: string }) {
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
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function WarningIcon({ className = 'w-4 h-4' }: { className?: string }) {
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
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
