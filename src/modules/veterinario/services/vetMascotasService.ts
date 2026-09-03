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
  }
}
