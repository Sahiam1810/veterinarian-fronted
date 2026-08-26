import type { VetHomeDashboard } from '../types'

// Datos de ejemplo mientras no exista el endpoint del backend
const MOCK_VET_HOME: VetHomeDashboard = {
  profile: {
    displayName: 'Dr. Roberto Silva',
    titlePrefix: 'Hola,',
  },
  formattedDate: 'Jueves, 26 de Octubre 2023',
  stats: {
    citasHoy: 8,
    pendientes: 3,
    atendidas: 5,
  },
  appointments: [
    {
      id: 'vet-apt-1',
      time: '09:00',
      petName: 'Luna',
      petPhotoUrl: null,
      speciesBreed: 'Canino - Poodle',
      ownerName: 'Juan Pérez',
      service: 'Vacunación Anual',
      status: 'ATENDIDO',
    },
    {
      id: 'vet-apt-2',
      time: '10:00',
      petName: 'Max',
      petPhotoUrl: null,
      speciesBreed: 'Canino - Golden Ret.',
      ownerName: 'María Gómez',
      service: 'Consulta General',
      status: 'EN ESPERA',
      isHighlighted: true,
    },
    {
      id: 'vet-apt-3',
      time: '11:30',
      petName: 'Milo',
      petPhotoUrl: null,
      speciesBreed: 'Felino - Siamés',
      ownerName: 'Carlos Ruiz',
      service: 'Control Post-Op',
      status: 'AGENDADO',
    },
    {
      id: 'vet-apt-4',
      time: '12:15',
      petName: 'Thor',
      petPhotoUrl: null,
      speciesBreed: 'Canino - Bulldog',
      ownerName: 'Ana Silva',
      service: 'Dermatología',
      status: 'AGENDADO',
    },
  ],
  totalAppointmentsToday: 11,
}

// Obtiene el dashboard de inicio; sustituir el mock por fetch al API .NET
export async function fetchVetHomeDashboard(): Promise<VetHomeDashboard> {
  // Ejemplo futuro:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vet/home`)
  // if (!res.ok) throw new Error('No se pudo cargar el inicio')
  // return res.json()
  return Promise.resolve(MOCK_VET_HOME)
}
