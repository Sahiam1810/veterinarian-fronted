// Mapeos puros del formulario Nueva Mascota (Recepcionista) — testeables sin apiClient.

import type { ApiClientResponse } from '@/modules/superadmin/services/superAdminClientsService'

// UI muestra Hembra/Macho; el backend (CreatePetDto) exige un carácter: F/M.
// Mismo criterio que useAuxMascotas: startsWith('h') → F, resto → M.
export function mapRecepUiGenderToApi(genderLabel: string): 'M' | 'F' {
  const normalized = genderLabel.trim().toLowerCase()
  return normalized.startsWith('h') ? 'F' : 'M'
}

// Inverso de mapRecepUiGenderToApi: precarga del formulario al editar (API M/F -> UI).
export function mapRecepApiGenderToUi(apiGender: string): 'Hembra' | 'Macho' {
  return apiGender?.trim().toUpperCase().startsWith('F') ? 'Hembra' : 'Macho'
}

export interface RecepMascotaFormDueno {
  id: string
  fullName: string
  documentId: string
}

// S20: nombre desde client.fullName (sin cruzar /api/Users).
export function buildRecepMascotaFormDuenos(
  clients: ApiClientResponse[],
): RecepMascotaFormDueno[] {
  return clients.map((c) => ({
    id: c.id,
    fullName: c.fullName?.trim() || 'Cliente Sin Nombre',
    documentId: c.identificationNumber || '',
  }))
}
