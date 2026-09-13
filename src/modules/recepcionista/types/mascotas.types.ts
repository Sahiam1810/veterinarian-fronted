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

export interface RecepMascotaFormData {
  name: string
  speciesId: string
  raceId: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  clientId: string
  photoUrl?: string | null
}

// Datos crudos (IDs/números) para precargar el formulario en modo edición;
// RecepMascotaDetail solo trae textos ya formateados para mostrar en la ficha.
export interface RecepMascotaRawFields {
  id: string
  name: string
  speciesId: string
  raceId: string
  age: number
  gender: string
  weight: number
  observations?: string | null
}

export interface RecepMascotasDirectoryPayload {
  items: RecepMascotaListItem[]
  detailsById: Record<string, RecepMascotaDetail>
  rawById: Record<string, RecepMascotaRawFields>
  totalCount: number
  pageStart: number
  pageEnd: number
}

