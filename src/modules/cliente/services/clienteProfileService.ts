import type { ClienteProfilePayload } from '../types'
import { MOCK_CLIENT_PROFILE } from './clienteDbMock'
import { mapDbProfileToUi } from '../utils/dbMappers'

export async function fetchClienteProfile(): Promise<ClienteProfilePayload> {
  return Promise.resolve(mapDbProfileToUi(MOCK_CLIENT_PROFILE))
}
