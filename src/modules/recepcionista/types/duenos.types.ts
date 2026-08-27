// Tipos del directorio de dueños (recepción)

export type RecepDuenoEstado = 'Activo' | 'Inactivo'

export type RecepDuenoStatusFilter = 'todos' | 'activos' | 'inactivos'

export interface RecepDuenoPetSummary {
  id: string
  name: string
  species: string
  breed: string
}

export interface RecepDuenoListItem {
  id: string
  code: string
  fullName: string
  documentId: string
  phone: string
  email: string
  petsCount: number
  estado: RecepDuenoEstado
}

export interface RecepDuenoDetail extends RecepDuenoListItem {
  address?: string
  city?: string
  registrationDateLabel?: string
  pets: RecepDuenoPetSummary[]
}

export interface RecepDuenosDirectoryPayload {
  items: RecepDuenoListItem[]
  detailsById: Record<string, RecepDuenoDetail>
  totalCount: number
  pageStart: number
  pageEnd: number
}
