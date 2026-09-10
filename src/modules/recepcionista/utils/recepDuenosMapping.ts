// Lógica pura de armado del directorio de dueños (testeable sin apiClient).
// S17: el nombre/correo/estado se leen directo del DTO de /api/Clients —
// ya no se cruza contra /api/Users (Recepcionista no tiene permiso sobre ese módulo).

import type {
  RecepDuenoDetail,
  RecepDuenoEstado,
  RecepDuenoListItem,
  RecepDuenoPetSummary,
  RecepDuenosDirectoryPayload,
} from '../types'
import type { ApiClientResponse } from '@/modules/superadmin/services/superAdminClientsService'
import type { ApiClientPetResponse } from '@/modules/superadmin/services/superAdminClientsPetsService'
import type { ApiPetResponse } from '@/modules/superadmin/services/superAdminPetsService'
import type { ApiSpeciesResponse, ApiRaceResponse } from '@/modules/superadmin/services/superAdminCatalogService'

export function formatDateLabel(dateStr?: string | null): string {
  if (!dateStr) return 'Fecha no registrada'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch {
    return dateStr
  }
}

// Activo por defecto: mismo criterio que antes tenía el cruce contra
// /api/Users cuando no se encontraba el usuario vinculado.
export function resolveDuenoEstado(client: Pick<ApiClientResponse, 'isActive'>): RecepDuenoEstado {
  return client.isActive === false ? 'Inactivo' : 'Activo'
}

export function buildRecepDuenosDirectory(
  clients: ApiClientResponse[],
  clientPets: ApiClientPetResponse[],
  pets: ApiPetResponse[],
  species: ApiSpeciesResponse[],
  races: ApiRaceResponse[],
): RecepDuenosDirectoryPayload {
  const petsMap = new Map(pets.map((p) => [p.id.toLowerCase(), p]))
  const speciesMap = new Map(species.map((s) => [s.id.toLowerCase(), s.name]))
  const racesMap = new Map(races.map((r) => [r.id.toLowerCase(), r.name]))

  // Agrupar mascotas por cliente
  const petsByClientId = new Map<string, RecepDuenoPetSummary[]>()
  clientPets.forEach((cp) => {
    const clientId = cp.clientId?.toLowerCase()
    if (!clientId) return

    const pet = petsMap.get(cp.petId?.toLowerCase())
    if (!pet) return

    const speciesName = speciesMap.get(pet.speciesId?.toLowerCase()) || 'Mascota'
    const raceName = racesMap.get(pet.raceId?.toLowerCase()) || 'Mestizo'

    const petSummary: RecepDuenoPetSummary = {
      id: pet.id,
      name: pet.name,
      species: speciesName,
      breed: raceName,
    }

    const currentList = petsByClientId.get(clientId) || []
    currentList.push(petSummary)
    petsByClientId.set(clientId, currentList)
  })

  const items: RecepDuenoListItem[] = []
  const detailsById: Record<string, RecepDuenoDetail> = {}

  clients.forEach((client, index) => {
    const clientPetSummaries = petsByClientId.get(client.id.toLowerCase()) || []

    // Nombre, correo y estado vienen directamente del DTO — sin cruce con /api/Users.
    const fullName = client.fullName || 'Cliente Sin Nombre'
    const documentId = client.identificationNumber || ''
    const email = client.email || ''
    const phone = client.phoneNumber || ''
    const estado = resolveDuenoEstado(client)
    const code = String(index + 1).padStart(3, '0')

    const listItem: RecepDuenoListItem = {
      id: client.id,
      code,
      fullName,
      documentId,
      phone,
      email,
      petsCount: clientPetSummaries.length,
      estado,
    }

    items.push(listItem)

    detailsById[client.id] = {
      ...listItem,
      userId: client.userId,
      address: client.address || 'Dirección no registrada',
      city: 'Clínica Huellitas',
      registrationDateLabel: formatDateLabel(client.registrationDate || client.createdAt),
      pets: clientPetSummaries,
    }
  })

  return {
    items,
    detailsById,
    totalCount: items.length,
    pageStart: items.length > 0 ? 1 : 0,
    pageEnd: Math.min(items.length, 10),
  }
}
