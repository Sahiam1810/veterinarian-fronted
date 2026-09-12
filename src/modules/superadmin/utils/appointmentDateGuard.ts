// S36: ni agendar ni reprogramar una cita hacia una fecha/hora que ya pasó.
// Un solo criterio compartido por SuperAdmin (Agenda, Profesionales) y Recepcionista.
export const PAST_APPOINTMENT_MESSAGE =
  'No se puede agendar ni reprogramar una cita en una fecha u hora que ya pasó.'

export function isAppointmentDateInThePast(dateKey: string, time: string, now: Date = new Date()): boolean {
  const selected = new Date(`${dateKey}T${time}:00`)
  return selected.getTime() < now.getTime()
}
