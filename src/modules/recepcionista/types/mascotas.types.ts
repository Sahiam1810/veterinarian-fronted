// Tipos del directorio de mascotas (recepción)

export type RecepMascotaEstado = 'Activo' | 'Inactivo'

export interface RecepMascotaListItem {
  id: string
  name: string
  photoUrl?: string | null
  species: string
  breed: string
  ageLabel: string
  sexLabel: string
  ownerName: string
  lastVisitLabel: string
  estado: RecepMascotaEstado
}

export interface RecepMascotaDetail extends RecepMascotaListItem {
  patientCode: string
  weightLabel: string
  microchip: string
  ownerPhone: string
  allergyAlert?: string | null
}

export interface RecepMascotasDirectoryPayload {
  items: RecepMascotaListItem[]
  detailsById: Record<string, RecepMascotaDetail>
  totalCount: number
  pageStart: number
  pageEnd: number
}
