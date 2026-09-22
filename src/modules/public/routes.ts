export const PUBLIC_POLICY_ROUTES = [
  '/politica-tratamiento-datos',
  '/politica-datos',
  '/politicas',
  '/privacidad',
] as const

/**
 * Normaliza una ruta eliminando espacios, pasando a minúsculas y removiendo plecas finales redundantes.
 */
export function normalizePathname(pathname: string): string {
  if (!pathname) return '/'
  const normalized = pathname.trim().toLowerCase()
  return normalized.length > 1 && normalized.endsWith('/')
    ? normalized.slice(0, -1)
    : normalized
}

/**
 * Evalúa si una ruta corresponde a la vista pública de Política de Tratamiento de Datos.
 */
export function isPublicPolicyRoute(pathname: string): boolean {
  const clean = normalizePathname(pathname)
  return PUBLIC_POLICY_ROUTES.some(
    (route) => clean === route || clean.startsWith(`${route}/`)
  )
}
