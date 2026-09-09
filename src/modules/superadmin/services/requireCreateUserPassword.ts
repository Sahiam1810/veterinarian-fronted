// Valida contraseña de alta staff; sin fallback a literales publicados.
export function requireCreateUserPassword(password: string | undefined | null): string {
  const trimmed = password?.trim() ?? ''
  if (!trimmed) {
    throw new Error('La contraseña es obligatoria para crear un usuario.')
  }
  return trimmed
}
