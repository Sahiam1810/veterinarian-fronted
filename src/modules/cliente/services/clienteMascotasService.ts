import type { ClienteMascotasPayload } from '../types'
import {
  CLIENT_PETS,
  getDbAppointmentsByClientPet,
  getDbRecordsByClientPet,
  getDbVaccinationsByClientPet,
  PETS,
} from './clienteDbMock'
import { DB_APPOINTMENT_STATUS, mapDbPetToUi } from '../utils/dbMappers'

export async function fetchClienteMascotas(): Promise<ClienteMascotasPayload> {
  const pets = CLIENT_PETS.map((link) => {
    const pet = PETS.find((item) => item.pet_id === link.pet_id)
    if (!pet) return null

    const appointments = getDbAppointmentsByClientPet(link.client_pet_id)
    const upcoming =
      appointments.find(
        (apt) =>
          apt.status_id === DB_APPOINTMENT_STATUS.AGENDADO ||
          apt.status_id === DB_APPOINTMENT_STATUS.CONFIRMADO,
      ) ??
      appointments.find((apt) => apt.status_id === DB_APPOINTMENT_STATUS.ATENDIDO) ??
      null

    return mapDbPetToUi(
      pet,
      getDbRecordsByClientPet(link.client_pet_id),
      getDbVaccinationsByClientPet(link.client_pet_id),
      upcoming,
    )
  }).filter((pet): pet is NonNullable<typeof pet> => pet !== null)

  return Promise.resolve({
    pets,
    totalCount: pets.length,
  })
}

export async function fetchClienteMascotaDetail(petId: string) {
  const payload = await fetchClienteMascotas()
  return payload.pets.find((pet) => pet.id === petId) ?? null
}
