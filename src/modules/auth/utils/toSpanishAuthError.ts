// Traduce mensajes de auth del API (inglés) a español solo en UI.
const AUTH_ERROR_MAP: Record<string, string> = {
  'authentication failed.': 'Correo o contraseña incorrectos.',
  'authentication failed': 'Correo o contraseña incorrectos.',
  'invalid credentials.': 'Correo o contraseña incorrectos.',
  'invalid credentials': 'Correo o contraseña incorrectos.',
  'unauthorized': 'No autorizado. Inicia sesión de nuevo.',
  'unauthorized.': 'No autorizado. Inicia sesión de nuevo.',
  'one or more validation errors occurred.': 'Revisa los datos del formulario.',
  'email is required.': 'Ingresa tu correo electrónico.',
  "'email' must not be empty.": 'Ingresa tu correo electrónico.',
  'email must not be empty.': 'Ingresa tu correo electrónico.',
  "'email' is not a valid email address.": 'El correo no tiene un formato válido.',
  'password is required.': 'Ingresa tu contraseña.',
  "'password' must not be empty.": 'Ingresa tu contraseña.',
  'password must not be empty.': 'Ingresa tu contraseña.',
  'user is inactive.': 'Tu cuenta está inactiva. Contacta al administrador.',
  'user is locked.': 'Tu cuenta está bloqueada. Contacta al administrador.',
  'token expired.': 'La sesión expiró. Inicia sesión de nuevo.',
  'refresh token is invalid.': 'La sesión ya no es válida. Inicia sesión de nuevo.',
}

export function toSpanishAuthError(raw: string | null | undefined, status?: number): string {
  const message = (raw || '').trim()
  if (!message) {
    if (status === 401) return 'Correo o contraseña incorrectos.'
    if (status === 400) return 'Revisa los datos del formulario.'
    return 'No se pudo iniciar sesión.'
  }

  const mapped = AUTH_ERROR_MAP[message.toLowerCase()]
  if (mapped) return mapped

  // Si el backend ya mandó español, lo respetamos.
  if (/[áéíóúñ¿¡]/i.test(message) || /\b(correo|contraseña|sesión|formulario)\b/i.test(message)) {
    return message
  }

  // Fallback por status cuando el texto sigue en inglés desconocido.
  if (status === 401) return 'Correo o contraseña incorrectos.'
  if (status === 400) return 'Revisa los datos del formulario.'
  if (status === 403) return 'No tienes permiso para iniciar sesión.'
  if (status !== undefined && status >= 500) return 'El servidor no respondió correctamente. Intenta más tarde.'

  return 'No se pudo iniciar sesión. Intenta de nuevo.'
}
