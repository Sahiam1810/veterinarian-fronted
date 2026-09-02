import type { GrantedPermissions } from '@/global/navigation'
import { CLIENTE_DEFAULT_PERMISSIONS } from '@/global/navigation'
import {
  CLIENTE_ALWAYS_VISIBLE_NAV,
  CLIENTE_MODULE_TO_NAV,
  fetchMyModulePermissions,
  filterNavKeysByModuleView,
} from '@/modules/auth'
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

// Permisos de menú del cliente desde GET /api/auth/permissions
export async function fetchClienteNavPermissions(): Promise<GrantedPermissions> {
  try {
    const permissions = await fetchMyModulePermissions()
    return filterNavKeysByModuleView(
      CLIENTE_DEFAULT_PERMISSIONS,
      permissions,
      CLIENTE_MODULE_TO_NAV,
      CLIENTE_ALWAYS_VISIBLE_NAV,
    )
  } catch (err) {
    console.error('No se pudieron cargar permisos de navegación del cliente', err)
    return CLIENTE_ALWAYS_VISIBLE_NAV.filter((key) =>
      CLIENTE_DEFAULT_PERMISSIONS.includes(key),
    )
  }
}
