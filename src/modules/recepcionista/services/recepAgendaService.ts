import type {
  RecepAgendaCatalogPayload,
  RecepAgendaDayAppointment,
} from '../types'

// Catálogo mock para agendar citas (mientras no exista el endpoint)
const MOCK_CATALOG: RecepAgendaCatalogPayload = {
  owners: [
    { id: 'own-juan', name: 'Juan Pérez', documentLabel: 'DNI 12345678' },
    { id: 'own-ana', name: 'Ana Torres', documentLabel: 'CC 10203040' },
    { id: 'own-sofia', name: 'Sofía Vargas', documentLabel: 'CC 55667788' },
  ],
  pets: [
    {
      id: 'pet-luna',
      ownerId: 'own-juan',
      name: 'Luna',
      breed: 'Golden Retriever',
    },
    {
      id: 'pet-michi',
      ownerId: 'own-juan',
      name: 'Michi',
      breed: 'Siamés',
    },
    {
      id: 'pet-max',
      ownerId: 'own-ana',
      name: 'Max',
      breed: 'Labrador',
    },
    {
      id: 'pet-rocky',
      ownerId: 'own-sofia',
      name: 'Rocky',
      breed: 'Bulldog Francés',
    },
  ],
  services: [
    { id: 'srv-general', label: 'Consulta General' },
    { id: 'srv-vacuna', label: 'Vacunación' },
    { id: 'srv-control', label: 'Control Post-operatorio' },
    { id: 'srv-urgencia', label: 'Urgencia' },
  ],
  professionals: [
    {
      id: 'pro-roberto',
      name: 'Dr. Roberto García',
      roleLabel: 'Veterinario',
    },
    {
      id: 'pro-maria',
      name: 'Dra. María López',
      roleLabel: 'Veterinaria',
    },
    {
      id: 'pro-carlos',
      name: 'Dr. Carlos Méndez',
      roleLabel: 'Veterinario',
    },
  ],
  timeSlots: [
    { id: '09:00', label: '09:00', displayLabel: '09:00 AM', available: true },
    { id: '09:30', label: '09:30', displayLabel: '09:30 AM', available: true },
    { id: '10:00', label: '10:00', displayLabel: '10:00 AM', available: false },
    { id: '10:30', label: '10:30', displayLabel: '10:30 AM', available: true },
    { id: '11:00', label: '11:00', displayLabel: '11:00 AM', available: true },
    { id: '11:30', label: '11:30', displayLabel: '11:30 AM', available: true },
  ],
}

// Obtiene catálogo para agendar; sustituir por fetch al API .NET
export async function fetchRecepAgendaCatalog(): Promise<RecepAgendaCatalogPayload> {
  // Ejemplo futuro:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recep/agenda/catalog`)
  // if (!res.ok) throw new Error('No se pudo cargar el catálogo')
  // return res.json()
  return Promise.resolve(MOCK_CATALOG)
}

// Citas mock por fecha (clave YYYY-MM-DD); otras fechas usan el set por defecto
const MOCK_DAY_APPOINTMENTS: Record<string, RecepAgendaDayAppointment[]> = {
  default: [
    {
      id: 'apt-1',
      time: '09:00',
      endTime: '09:30',
      petName: 'Max',
      breed: 'Labrador',
      ownerName: 'Ana Torres',
      ownerPhone: '+57 310 555 0199',
      professionalName: 'Dr. Roberto García',
      service: 'Consulta General',
      notes: 'Control de peso anual.',
      status: 'ATENDIDO',
    },
    {
      id: 'apt-2',
      time: '09:30',
      endTime: '10:00',
      petName: 'Luna',
      breed: 'Golden Retriever',
      ownerName: 'Juan Pérez',
      ownerPhone: '+57 300 111 2233',
      professionalName: 'Dra. María López',
      service: 'Vacunación',
      notes: 'Refuerzo antirrábico.',
      status: 'EN CONSULTORIO',
    },
    {
      id: 'apt-3',
      time: '10:00',
      endTime: '10:30',
      petName: 'Rocky',
      breed: 'Bulldog Francés',
      ownerName: 'Sofía Vargas',
      ownerPhone: '+57 320 888 4411',
      professionalName: 'Dr. Roberto García',
      service: 'Control Post-operatorio',
      notes: 'Revisión de suturas.',
      status: 'AGENDADO',
    },
    {
      id: 'apt-4',
      time: '11:00',
      endTime: '11:30',
      petName: 'Michi',
      breed: 'Siamés',
      ownerName: 'Juan Pérez',
      ownerPhone: '+57 300 111 2233',
      professionalName: 'Dra. María López',
      service: 'Consulta General',
      status: 'AGENDADO',
    },
    {
      id: 'apt-5',
      time: '11:30',
      endTime: '12:00',
      petName: 'Toby',
      breed: 'Beagle',
      ownerName: 'Ana Torres',
      ownerPhone: '+57 310 555 0199',
      professionalName: 'Dr. Carlos Méndez',
      service: 'Urgencia',
      notes: 'Cancelada por el dueño.',
      status: 'CANCELADO',
    },
    {
      id: 'apt-6',
      time: '14:00',
      endTime: '14:30',
      petName: 'Nala',
      breed: 'Persa',
      ownerName: 'Sofía Vargas',
      ownerPhone: '+57 320 888 4411',
      professionalName: 'Dra. María López',
      service: 'Vacunación',
      status: 'AGENDADO',
    },
    {
      id: 'apt-7',
      time: '15:30',
      endTime: '16:00',
      petName: 'Bruno',
      breed: 'Pastor Alemán',
      ownerName: 'Ana Torres',
      ownerPhone: '+57 310 555 0199',
      professionalName: 'Dr. Roberto García',
      service: 'Consulta General',
      notes: 'Revisión dermatológica.',
      status: 'AGENDADO',
    },
  ],
}

// Obtiene citas del día para el calendario flotante
export async function fetchRecepDayAppointments(
  dateValue: string,
): Promise<RecepAgendaDayAppointment[]> {
  // Ejemplo futuro:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recep/agenda?date=${dateValue}`)
  // if (!res.ok) throw new Error('No se pudieron cargar las citas')
  // return res.json()
  const list = MOCK_DAY_APPOINTMENTS[dateValue] ?? MOCK_DAY_APPOINTMENTS.default
  return Promise.resolve(list)
}
