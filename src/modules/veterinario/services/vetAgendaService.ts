import type { AgendaWeekPayload } from '../types'

// Datos de ejemplo de la vista semana (mientras no exista el endpoint)
const MOCK_AGENDA_WEEK: AgendaWeekPayload = {
  monthLabel: 'Octubre 2023',
  viewMode: 'semana',
  currentTime: '11:40',
  currentDateKey: '2023-10-18',
  hourStart: 8,
  hourEnd: 17,
  days: [
    { dateKey: '2023-10-16', weekdayLabel: 'LUN', dayNumber: 16 },
    { dateKey: '2023-10-17', weekdayLabel: 'MAR', dayNumber: 17 },
    { dateKey: '2023-10-18', weekdayLabel: 'MIÉ', dayNumber: 18, isToday: true },
    { dateKey: '2023-10-19', weekdayLabel: 'JUE', dayNumber: 19 },
    { dateKey: '2023-10-20', weekdayLabel: 'VIE', dayNumber: 20 },
    { dateKey: '2023-10-21', weekdayLabel: 'SÁB', dayNumber: 21 },
    { dateKey: '2023-10-22', weekdayLabel: 'DOM', dayNumber: 22 },
  ],
  events: [
    {
      id: 'evt-1',
      dateKey: '2023-10-16',
      startTime: '15:00',
      endTime: '16:30',
      status: 'ATENDIDA',
      petName: 'Toby',
      species: 'Canino',
      service: 'Cirugía Menor - Extracción de...',
    },
    {
      id: 'evt-2',
      dateKey: '2023-10-17',
      startTime: '10:00',
      endTime: '11:00',
      status: 'AGENDADA',
      petName: 'Max',
      species: 'Canino',
      service: 'Vacunación A...',
    },
    {
      id: 'evt-3',
      dateKey: '2023-10-18',
      startTime: '11:15',
      endTime: '12:00',
      status: 'EN_ESPERA',
      petName: 'Luna',
      species: 'Felino',
      service: 'Control Dental',
    },
    {
      id: 'evt-4',
      dateKey: '2023-10-19',
      startTime: '13:00',
      endTime: '14:00',
      status: 'BLOQUEO',
      blockLabel: 'Bloqueo - Almuerzo',
    },
  ],
}

// Obtiene la agenda semanal; sustituir por fetch al API .NET
export async function fetchVetAgendaWeek(): Promise<AgendaWeekPayload> {
  // Ejemplo futuro:
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vet/agenda/week`)
  // if (!res.ok) throw new Error('No se pudo cargar la agenda')
  // return res.json()
  return Promise.resolve(MOCK_AGENDA_WEEK)
}
