import { ClinicalHistoryIcon, PawIcon, UserAvatarIcon } from '@/global/components'
import type { RecepMascotaDetail, RecepMascotaEstado } from '../types'
import { ViewPopup } from './ViewPopup'
import { AlertTriangleIcon, CloseIcon, PhoneIcon } from './RecepMascotasIcons'

interface RecepMascotaDetailPanelProps {
  detail: RecepMascotaDetail
  onClose: () => void
  onViewClinicalHistory?: () => void
}

// Panel derecho: solo se monta cuando hay una mascota seleccionada
export function RecepMascotaDetailPanel({
  detail,
  onClose,
  onViewClinicalHistory,
}: RecepMascotaDetailPanelProps) {
  return (
    <ViewPopup
      animationKey={detail.id}
      className="w-full lg:w-[340px] xl:w-[360px] shrink-0 min-w-0"
    >
      <aside className="h-full min-h-0 overflow-y-auto overflow-x-hidden rounded-2xl border border-border-tan bg-white shadow-[0_2px_16px_rgba(35,78,70,0.04)] p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <DetailPhoto name={detail.name} photoUrl={detail.photoUrl} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-extrabold text-brand tracking-tight truncate">
                {detail.name}
              </h2>
              <div className="flex items-center gap-1.5 shrink-0">
                <EstadoPill estado={detail.estado} />
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border border-border-tan text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center"
                  aria-label="Cerrar detalle"
                  title="Cerrar"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-sage font-medium mt-0.5">ID: {detail.patientCode}</p>
          </div>
        </div>

        <div className="rounded-xl bg-bone/80 border border-border-tan/70 p-3 grid grid-cols-2 gap-3">
          <InfoCell label="Especie / Raza" value={`${detail.species} / ${detail.breed}`} />
          <InfoCell label="Edad / Sexo" value={`${detail.ageLabel} / ${detail.sexLabel}`} />
          <InfoCell label="Peso Actual" value={detail.weightLabel} />
          <InfoCell label="Microchip" value={detail.microchip} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sage">
            <UserAvatarIcon className="w-3.5 h-3.5" />
            <span>Propietario</span>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border-tan bg-white px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-bold text-charcoal truncate">{detail.ownerName}</p>
              <p className="text-xs text-sage font-medium truncate">{detail.ownerPhone}</p>
            </div>
            <span className="w-8 h-8 rounded-lg bg-bone text-brand inline-flex items-center justify-center shrink-0">
              <PhoneIcon className="w-4 h-4" />
            </span>
          </div>
        </div>

        {detail.allergyAlert && (
          <div className="rounded-xl bg-terracotta-soft border border-terracotta/25 px-3 py-2.5 flex items-start gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-charcoal/90 font-medium leading-snug">
              {detail.allergyAlert}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onViewClinicalHistory}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white px-4 py-3 text-sm font-bold hover:bg-brand-hover transition cursor-pointer"
        >
          <ClinicalHistoryIcon className="w-4 h-4" />
          <span>Ver Historia Clínica</span>
        </button>
      </aside>
    </ViewPopup>
  )
}

function DetailPhoto({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-xl object-cover border border-border-tan shrink-0"
      />
    )
  }

  return (
    <div className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-xl bg-cream text-sage flex items-center justify-center border border-border-tan shrink-0">
      <PawIcon className="w-6 h-6" />
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-sage">{label}</p>
      <p className="text-xs sm:text-sm font-bold text-charcoal mt-0.5 truncate" title={value}>
        {value}
      </p>
    </div>
  )
}

function EstadoPill({ estado }: { estado: RecepMascotaEstado }) {
  const styles =
    estado === 'Activo'
      ? 'bg-sage-soft text-brand'
      : 'bg-bone text-sage border border-border-tan'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${styles}`}>
      {estado}
    </span>
  )
}
