import type { RecepHomeDashboard } from '../types'
import {
  fetchMyModulePermissions,
  filterNavKeysByModuleView,
  RECEP_ALWAYS_VISIBLE_NAV,
  RECEP_MODULE_TO_NAV,
} from '@/modules/auth'
import { RECEP_DEFAULT_PERMISSIONS } from '@/global/navigation'

// Mock del home de recepción (sustituir por API .NET)
const MOCK_RECEP_HOME: RecepHomeDashboard = {
  profile: {
    displayName: 'Carlos Méndez',
    workstationLabel: 'Recepción Principal',
  },
  formattedDate: 'Martes, 24 de Octubre',
  stats: {
    citasDelDia: 24,
    pendientes: 12,
    mascotasAtendidas: 15,
    canceladas: 3,
  },
  appointments: [
    {
      id: 'recep-apt-1',
      time: '09:00',
      petName: 'Max',
      petPhotoUrl: null,
      speciesBreed: 'Perro / Golden R.',
      ownerName: 'Ana Gómez',
      professionalName: 'Dr. Silva',
      service: 'Consulta Gen.',
      status: 'EN CONSULTORIO',
    },
    {
      id: 'recep-apt-2',
      time: '09:30',
      petName: 'Luna',
      petPhotoUrl: null,
      speciesBreed: 'Gato / Siamés',
      ownerName: 'Carlos Ruiz',
      professionalName: 'Dra. Pérez',
      service: 'Vacunación',
      status: 'AGENDADO',
    },
    {
      id: 'recep-apt-3',
      time: '10:00',
      petName: 'Rocky',
      petPhotoUrl: null,
      speciesBreed: 'Perro / Labrador',
      ownerName: 'María López',
      professionalName: 'Dr. Silva',
      service: 'Control',
      status: 'ATENDIDO',
    },
    {
      id: 'recep-apt-4',
      time: '10:30',
      petName: 'Michi',
      petPhotoUrl: null,
      speciesBreed: 'Gato / Persa',
      ownerName: 'Pedro Díaz',
      professionalName: 'Dra. Pérez',
      service: 'Desparasitación',
      status: 'CANCELADO',
    },
    {
      id: 'recep-apt-5',
      time: '11:00',
      petName: 'Toby',
      petPhotoUrl: null,
      speciesBreed: 'Perro / Beagle',
      ownerName: 'Laura Méndez',
      professionalName: 'Dr. Silva',
      service: 'Consulta Gen.',
      status: 'AGENDADO',
    },
  ],
  totalAppointmentsToday: 24,
}

export async function fetchRecepHomeDashboard(): Promise<RecepHomeDashboard> {
  return Promise.resolve(MOCK_RECEP_HOME)
}

// Permisos de menú del recepcionista desde GET /api/auth/permissions
export async function fetchRecepNavPermissions() {
  try {
    const permissions = await fetchMyModulePermissions()
    return filterNavKeysByModuleView(
      RECEP_DEFAULT_PERMISSIONS,
      permissions,
      RECEP_MODULE_TO_NAV,
      RECEP_ALWAYS_VISIBLE_NAV,
    )
  } catch (err) {
    console.error('No se pudieron cargar permisos de navegación del recepcionista', err)
    return RECEP_ALWAYS_VISIBLE_NAV.filter((key) =>
      RECEP_DEFAULT_PERMISSIONS.includes(key),
    )
  }
}
