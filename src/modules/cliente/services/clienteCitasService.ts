import type { ClienteCitasPayload } from '../types'
import { MOCK_APPOINTMENTS } from './clienteDbMock'
import { mapDbAppointmentToCita } from '../utils/dbMappers'

export async function fetchClienteCitas(): Promise<ClienteCitasPayload> {
  const items = MOCK_APPOINTMENTS.map(mapDbAppointmentToCita)
  return Promise.resolve({ items, totalCount: items.length })
}
