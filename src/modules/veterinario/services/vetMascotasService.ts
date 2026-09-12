import { vetApiFetch } from '../api/vetHttp'
import type {
  ApiAppointment,
  ApiClient,
  ApiClientPet,
  ApiNamedCatalog,
  ApiPet,
} from '../api/apiTypes'
import type { MascotasDirectoryPayload } from '../types'
import { buildVetMascotasDirectoryAll } from '../utils/buildVetMascotasDirectory'

export interface VetMascotasBundle {
  directory: MascotasDirectoryPayload
  clientPets: ApiClientPet[]
  rawPets: ApiPet[]
  species: ApiNamedCatalog[]
  races: ApiNamedCatalog[]
  clients: ApiClient[]
}

// Carga el directorio de mascotas desde endpoints Staff existentes.
export async function fetchVetMascotasDirectory(): Promise<MascotasDirectoryPayload> {
  const bundle = await fetchVetMascotasBundle()
  return bundle.directory
}

export async function fetchVetMascotasBundle(): Promise<VetMascotasBundle> {
  const [pets, clients, clientPets, species, races, appointments] = await Promise.all([
    vetApiFetch<ApiPet[]>('/api/pets'),
    vetApiFetch<ApiClient[]>('/api/clients'),
    vetApiFetch<ApiClientPet[]>('/api/clientspets'),
    vetApiFetch<ApiNamedCatalog[]>('/api/species'),
    vetApiFetch<ApiNamedCatalog[]>('/api/races'),
    vetApiFetch<ApiAppointment[]>('/api/appointments'),
  ])

  return {
    directory: buildVetMascotasDirectoryAll({
      pets,
      clients,
      clientPets,
      species,
      races,
      appointments,
    }),
    clientPets,
    rawPets: pets,
    species,
    races,
    clients,
  }
}

export interface CreateVetPetPayload {
  name: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  speciesId: string
  raceId: string
  photoUrl?: string | null
  clientId?: string
}

export async function createVetPet(
  payload: CreateVetPetPayload
): Promise<{ id: string }> {
  const { clientId, ...petData } = payload
  const newPet = await vetApiFetch<{ id: string }>('/api/pets', {
    method: 'POST',
    body: JSON.stringify(petData),
  })

  if (clientId && newPet?.id) {
    try {
      await vetApiFetch('/api/clientspets', {
        method: 'POST',
        body: JSON.stringify({
          clientId,
          petId: newPet.id,
          isPrimaryOwner: true,
        }),
      })
    } catch (err) {
      console.warn('No se pudo asociar la mascota al cliente:', err)
    }
  }

  return newPet
}

export interface UpdateVetPetPayload {
  name: string
  age: number
  gender: string
  weight: number
  observations?: string | null
  speciesId: string
  raceId: string
  photoUrl?: string | null
}

export async function updateVetPet(
  id: string,
  payload: UpdateVetPetPayload
): Promise<void> {
  await vetApiFetch(`/api/pets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteVetPet(id: string): Promise<void> {
  await vetApiFetch(`/api/pets/${id}`, {
    method: 'DELETE',
  })
}

// La FK CLIENTS_PETS.PET_ID -> PETS.ID es Restrict: borrar una mascota con
// dueño vinculado sin quitar antes este vínculo devuelve 409 (igual que en
// SuperAdmin, ver useMascotasSuperAdmin.deleteMascota).
export async function deleteVetClientPet(clientPetId: string): Promise<void> {
  await vetApiFetch(`/api/clientspets/${clientPetId}`, {
    method: 'DELETE',
  })
}

