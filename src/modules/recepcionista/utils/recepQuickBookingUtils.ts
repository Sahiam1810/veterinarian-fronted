// Utilidades puras para el flujo de Agendamiento Rápido (Recepcionista)

export interface RaceOption {
  id: string
  name: string
  speciesId?: string
}

/**
 * Normaliza un número de teléfono removiendo espacios, guiones y caracteres no numéricos
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.trim().replace(/[^\d+]/g, '')
}

/**
 * Genera el email placeholder único para un cliente nuevo en agendamiento rápido.
 * Formato: pendiente-<telefono>@huellitas.local
 */
export function buildPendingClientEmail(phone: string): string {
  const clean = sanitizePhoneNumber(phone)
  return `pendiente-${clean}@huellitas.local`
}

/**
 * Genera el número de documento placeholder único para un cliente nuevo en agendamiento rápido.
 * Formato: PEND-<telefono> (máximo 20 caracteres para cumplir con restricciones de BD)
 */
export function buildPendingClientDocument(phone: string): string {
  const clean = sanitizePhoneNumber(phone)
  const doc = `PEND-${clean}`
  return doc.slice(0, 20)
}

/**
 * Detecta si el cliente tiene datos de contacto pendientes por completar
 * a partir del patrón de su correo electrónico (empieza con "pendiente-").
 */
export function isOwnerContactPending(email?: string | null): boolean {
  if (!email) return false
  return email.trim().toLowerCase().startsWith('pendiente-')
}

/**
 * Detecta si la mascota está pendiente de examen físico
 * a partir de la combinación de edad === 0 y peso === 0.01 kg.
 */
export function isPetExamPending(
  age?: number | string | null,
  weight?: number | string | null,
): boolean {
  if (age === undefined || age === null || weight === undefined || weight === null) {
    return false
  }

  const numericAge = typeof age === 'number' ? age : parseFloat(String(age).replace(/[^\d.]/g, ''))
  const numericWeight = typeof weight === 'number' ? weight : parseFloat(String(weight).replace(/[^\d.]/g, ''))

  return numericAge === 0 && Math.abs(numericWeight - 0.01) < 0.001
}

/**
 * Busca en el catálogo de razas de una especie la raza con nombre "Mestizo"
 * (búsqueda insensible a mayúsculas/minúsculas y acentos).
 * Si no se encuentra "Mestizo", retorna el ID de la primera raza disponible para esa especie.
 */
export function findMestizoRaceId(
  races: RaceOption[],
  speciesId: string,
): string {
  if (!races || races.length === 0) return ''

  const speciesRaces = speciesId
    ? races.filter((r) => r.speciesId && r.speciesId.toLowerCase() === speciesId.toLowerCase())
    : races

  const pool = speciesRaces.length > 0 ? speciesRaces : races

  const mestizo = pool.find((r) =>
    r.name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('mestizo')
  )

  return mestizo?.id || pool[0]?.id || ''
}
