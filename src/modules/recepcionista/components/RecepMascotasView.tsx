import { MascotaFichaModal, type MascotaFichaModalItem } from '@/modules/superadmin'
import type { RecepMascotaDetail, RecepMascotaListItem } from '../types'
import { ViewPopup } from './ViewPopup'
import { RecepMascotasToolbar } from './RecepMascotasToolbar'
import { RecepMascotasTable } from './RecepMascotasTable'

interface RecepMascotasViewProps {
  items: RecepMascotaListItem[]
  selectedDetail: RecepMascotaDetail | null
  search: string
  pageStart: number
  pageEnd: number
  totalCount: number
  onSearchChange: (value: string) => void
  onOpenFilters?: () => void
  onNewPet?: () => void
  onSelect: (petId: string) => void
  onCloseDetail: () => void
  onViewClinicalHistory?: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
}

// S54: la ficha de la mascota usa el modal compartido con SuperAdmin/Veterinario
// (MascotaFichaModal) en vez de un panel lateral propio del módulo.
function toFichaItem(detail: RecepMascotaDetail): MascotaFichaModalItem {
  return {
    type: 'vetMascota',
    data: {
      name: detail.name,
      photoUrl: detail.photoUrl,
      species: detail.species,
      breed: detail.breed,
      ageLabel: detail.ageLabel,
      sexLabel: detail.sexLabel,
      weightLabel: detail.weightLabel,
      microchip: detail.microchip,
      ownerName: detail.ownerName,
      ownerPhone: detail.ownerPhone,
      allergyAlert: detail.allergyAlert,
      status: detail.estado,
    },
  }
}

// Vista Mascotas recepción: toolbar + tabla a ancho completo; ficha en modal
export function RecepMascotasView({
  items,
  selectedDetail,
  search,
  pageStart,
  pageEnd,
  totalCount,
  onSearchChange,
  onOpenFilters,
  onNewPet,
  onSelect,
  onCloseDetail,
  onViewClinicalHistory,
  onPrevPage,
  onNextPage,
}: RecepMascotasViewProps) {
  return (
    <>
      <ViewPopup
        animationKey="mascotas"
        className="flex flex-col gap-3 sm:gap-4 h-full min-h-0 min-w-0 overflow-hidden"
      >
        <div className="shrink-0 min-w-0">
          <RecepMascotasToolbar
            search={search}
            onSearchChange={onSearchChange}
            onOpenFilters={onOpenFilters}
            onNewPet={onNewPet}
          />
        </div>

        <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          <RecepMascotasTable
            items={items}
            selectedId={selectedDetail?.id ?? null}
            pageStart={pageStart}
            pageEnd={pageEnd}
            totalCount={totalCount}
            onSelect={onSelect}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
          />
        </div>
      </ViewPopup>

      <MascotaFichaModal
        item={selectedDetail ? toFichaItem(selectedDetail) : null}
        onClose={onCloseDetail}
        onViewHistoria={onViewClinicalHistory}
      />
    </>
  )
}
