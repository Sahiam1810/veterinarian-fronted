import type { ClienteHistorialPayload } from '../types'
import {
  CLIENT_PETS,
  getDbRecordsByClientPet,
  getDbVaccinationsByClientPet,
  PETS,
} from './clienteDbMock'
import {
  mapDbMedicalRecordToConsultation,
  mapDbVaccinationToUi,
} from '../utils/dbMappers'

export async function fetchClienteHistorial(): Promise<ClienteHistorialPayload> {
  const pets = CLIENT_PETS.map((link) => {
    const pet = PETS.find((item) => item.pet_id === link.pet_id)
    if (!pet) return null

    return {
      pet: {
        id: String(pet.pet_id),
        name: pet.name,
        speciesBreed: `${pet.species?.name ?? 'Mascota'} • ${pet.race?.name ?? 'Sin raza'}`,
        photoUrl: null,
      },
      consultations: getDbRecordsByClientPet(link.client_pet_id).map((record) => {
        const mapped = mapDbMedicalRecordToConsultation(record)
        return {
          id: mapped.id,
          dateLabel: mapped.dateLabel,
          serviceName: mapped.serviceName,
          professionalName: mapped.professionalName,
          symptoms: mapped.symptoms,
          diagnosis: mapped.diagnosis,
          treatment: mapped.treatment,
        }
      }),
      vaccines: getDbVaccinationsByClientPet(link.client_pet_id).map(mapDbVaccinationToUi),
    }
  }).filter((record): record is NonNullable<typeof record> => record !== null)

  return Promise.resolve({ pets })
}
