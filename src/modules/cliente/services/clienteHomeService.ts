import type { ClienteHomeDashboard } from '../types'
import { CLIENT_PETS, getDbNextUpcomingAppointment } from './clienteDbMock'
import { mapDbNextAppointmentToHome } from '../utils/dbMappers'

export async function fetchClienteHomeDashboard(): Promise<ClienteHomeDashboard> {
  const next = mapDbNextAppointmentToHome(getDbNextUpcomingAppointment())

  return Promise.resolve({
    profile: {
      displayName: 'Mariana Ruiz',
    },
    summarySubtitle:
      'Aquí tienes un resumen del estado de tus mascotas y próximas citas.',
    stats: {
      misMascotas: CLIENT_PETS.length,
      citasPendientes: next ? 1 : 0,
    },
    nextAppointment: next,
  })
}

export async function fetchClienteNavPermissions() {
  return Promise.resolve(null)
}
