// Tipos del directorio de mascotas del veterinario

export type MascotaAtencionStatus = 'Atendido' | 'En espera' | 'Agendado'

export interface MascotaListItem {
  id: string
  name: string
  photoUrl?: string | null
  species: string
  breed: string
  ageLabel: string
  sexLabel: string
  ownerName: string
  lastVisitLabel: string
}

export interface MascotaDetail extends MascotaListItem {
  patientCode: string
  status: MascotaAtencionStatus
  weightLabel: string
  microchip: string
  ownerPhone: string
  allergyAlert?: string | null
}

export interface MascotasDirectoryPayload {
  items: MascotaListItem[]
  detailsById: Record<string, MascotaDetail>
  totalCount: number
  pageStart: number
  pageEnd: number
  speciesOptions: string[]
}
