const DAY_NAMES_ES: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

export function buildAvailableDaysLabel(
  availabilities: { dayOfWeek: number | string; isActive: boolean }[],
): string {
  const activeDays = [...new Set(
    availabilities
      .filter((availability) => availability.isActive)
      .map((availability) => Number(availability.dayOfWeek)),
  )].sort((a, b) => a - b)

  if (activeDays.length === 0) return ''
  return activeDays.map((day) => DAY_NAMES_ES[day] ?? String(day)).join(', ')
}
