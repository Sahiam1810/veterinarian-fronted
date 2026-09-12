import { EditIcon, MedicalHistoryIcon } from '@/global/components'
import type { MascotaDuenoDetailItem } from '../types'

// Forma estructural compartida por MascotaDetail (veterinario) y
// RecepMascotaDetail (recepcionista) -- ambas ya calzan aquí tal cual, sin
// necesidad de mapear campos, solo el status/estado que cada rol nombra distinto.
export interface MascotaVitalsFichaData {
  name: string
  photoUrl?: string | null
  species: string
  breed: string
  ageLabel: string
  sexLabel: string
  weightLabel: string
  microchip: string
  ownerName: string
  ownerPhone: string
  allergyAlert?: string | null
  status: string
}

export type MascotaFichaModalItem =
  | MascotaDuenoDetailItem
  | { type: 'vetMascota'; data: MascotaVitalsFichaData }

interface MascotaFichaModalProps {
  item: MascotaFichaModalItem | null
  onClose: () => void
  // Solo aplica a vetMascota: acceso a la historia clínica completa desde la ficha.
  onViewHistoria?: () => void
  isHistoriaLoading?: boolean
  // Solo aplica a dueno: algunos roles (ej. Recepcionista) no tienen una fila
  // de tabla con acciones propias, así que editar se dispara desde la ficha.
  // SuperAdmin no lo pasa (edita desde la fila) y no cambia en nada para él.
  onEditDueno?: () => void
}

// Modal de ficha (mascota / dueño / mascota-veterinario) compartido entre
// SuperAdmin, Veterinario y Recepcionista, para que "Ver" luzca igual en
// todos los roles.
export function MascotaFichaModal({
  item,
  onClose,
  onViewHistoria,
  isHistoriaLoading = false,
  onEditDueno,
}: MascotaFichaModalProps) {
  if (!item) return null

  const isMascota = item.type === 'mascota'
  const isDueno = item.type === 'dueno'
  const isVetMascota = item.type === 'vetMascota'
  const mascota = isMascota ? item.data : null
  const dueno = isDueno ? item.data : null
  const vetMascota = isVetMascota ? item.data : null

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex items-center justify-center p-4 modal-backdrop-animate"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-border-tan overflow-hidden modal-content-animate"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-tan/70 bg-bone">
          <h3 className="text-base font-bold text-brand flex items-center gap-2">
            {isDueno ? 'Ficha del Dueño' : 'Ficha de Mascota'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sage hover:text-charcoal p-1 rounded-lg hover:bg-border-tan/50 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isMascota && mascota && (
            <>
              <div className="flex items-center gap-4">
                {mascota.photoUrl ? (
                  <img
                    src={mascota.photoUrl}
                    alt={mascota.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-border-tan"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-mint-soft text-brand font-bold text-2xl flex items-center justify-center border border-brand/15">
                    {mascota.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-charcoal">{mascota.name}</h4>
                  <p className="text-xs text-sage font-medium">
                    {mascota.species} • {mascota.breed}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      mascota.status === 'Activo'
                        ? 'bg-[#E8F2EF] text-brand border border-brand/15'
                        : 'bg-[#F1EFEA] text-sage border border-border-tan'
                    }`}
                  >
                    {mascota.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Edad</span>
                  <span className="font-bold text-charcoal">{mascota.age}</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Sexo / Peso</span>
                  <span className="font-bold text-charcoal">{mascota.sex} ({mascota.weight})</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Dueño</span>
                  <span className="font-bold text-[#234E46]">{mascota.ownerName}</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Teléfono</span>
                  <span className="font-bold text-charcoal">{mascota.ownerPhone}</span>
                </div>
              </div>

              {mascota.notes && (
                <div className="p-3.5 rounded-xl bg-mint-soft/50 border border-brand/10 text-xs">
                  <span className="font-bold text-brand block mb-1">Observaciones:</span>
                  <p className="text-charcoal/80 leading-relaxed">{mascota.notes}</p>
                </div>
              )}
            </>
          )}

          {isDueno && dueno && (
            <>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-terracotta-soft text-terracotta font-bold text-2xl flex items-center justify-center border border-terracotta/20">
                  {dueno.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-charcoal">{dueno.name}</h4>
                  <p className="text-xs text-sage font-medium">{dueno.documentId}</p>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      dueno.status === 'Activo'
                        ? 'bg-[#E8F2EF] text-brand border border-brand/15'
                        : 'bg-[#F1EFEA] text-sage border border-border-tan'
                    }`}
                  >
                    {dueno.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Teléfono</span>
                  <span className="font-bold text-charcoal">{dueno.phone}</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Correo</span>
                  <span className="font-bold text-charcoal truncate block">{dueno.email}</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60 col-span-2">
                  <span className="text-[10px] text-sage font-bold uppercase block">Ubicación</span>
                  <span className="font-bold text-charcoal">{dueno.address}, {dueno.city}</span>
                </div>
              </div>

              {dueno.mascotasSummary && dueno.mascotasSummary.length > 0 && (
                <div className="p-3.5 rounded-xl bg-bone border border-border-tan text-xs">
                  <span className="font-bold text-brand block mb-2">Mascotas Registradas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {dueno.mascotasSummary.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-border-tan font-semibold text-charcoal"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {isVetMascota && vetMascota && (
            <>
              <div className="flex items-center gap-4">
                {vetMascota.photoUrl ? (
                  <img
                    src={vetMascota.photoUrl}
                    alt={vetMascota.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-border-tan"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-mint-soft text-brand font-bold text-2xl flex items-center justify-center border border-brand/15">
                    {vetMascota.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-charcoal">{vetMascota.name}</h4>
                  <p className="text-xs text-sage font-medium">
                    {vetMascota.species} • {vetMascota.breed}
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F2EF] text-brand border border-brand/15">
                    {vetMascota.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Edad / Sexo</span>
                  <span className="font-bold text-charcoal">{vetMascota.ageLabel} / {vetMascota.sexLabel}</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Peso Actual</span>
                  <span className="font-bold text-charcoal">{vetMascota.weightLabel}</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Dueño</span>
                  <span className="font-bold text-[#234E46]">{vetMascota.ownerName}</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Teléfono</span>
                  <span className="font-bold text-charcoal">{vetMascota.ownerPhone}</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60 col-span-2">
                  <span className="text-[10px] text-sage font-bold uppercase block">Microchip</span>
                  <span className="font-bold text-charcoal">{vetMascota.microchip || 'No registrado'}</span>
                </div>
              </div>

              {vetMascota.allergyAlert ? (
                <div className="p-3.5 rounded-xl bg-terracotta-soft border border-terracotta/25 text-xs">
                  <span className="font-bold text-terracotta block mb-1">Alergias / Alertas:</span>
                  <p className="text-charcoal/90 leading-relaxed">{vetMascota.allergyAlert}</p>
                </div>
              ) : (
                <p className="text-xs text-sage font-medium">Sin alertas registradas.</p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border-tan/70 bg-bone">
          {isDueno && onEditDueno && (
            <button
              type="button"
              onClick={onEditDueno}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-border-tan bg-white text-charcoal hover:bg-cream transition cursor-pointer"
            >
              <EditIcon className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          )}
          {isVetMascota && onViewHistoria && (
            <button
              type="button"
              onClick={onViewHistoria}
              disabled={isHistoriaLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-border-tan bg-white text-charcoal hover:bg-cream transition cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              <MedicalHistoryIcon className="w-4 h-4 text-brand" />
              <span>{isHistoriaLoading ? 'Cargando historia…' : 'Ver Historia Clínica Completa'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-hover transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
