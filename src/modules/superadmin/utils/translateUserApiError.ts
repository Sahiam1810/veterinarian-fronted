import { ApiError } from '@/services'

// Traduce mensajes genéricos del API que aún llegan en inglés
const EXACT_TRANSLATIONS: Record<string, string> = {
  'Validation failed': 'Revisa los campos del formulario.',
  'Data integrity violation': 'No se pudo completar la operación por un conflicto de datos.',
  'Unexpected error': 'Ocurrió un error inesperado. Intenta de nuevo.',
  'Resource not found.': 'Recurso no encontrado.',
  'No autorizado o sesión expirada.': 'No autorizado o sesión expirada.',
  'No tienes permisos para realizar esta acción.': 'No tienes permisos para realizar esta acción.',
  'Recurso no encontrado.': 'Recurso no encontrado.',
  'Error interno del servidor. Intenta de nuevo más tarde.':
    'Error interno del servidor. Intenta de nuevo más tarde.',
}

const PARTIAL_TRANSLATIONS: Array<[RegExp, string]> = [
  [/already exists/i, 'Ya existe un registro con esos datos.'],
  [/duplicate/i, 'Ya existe un registro con esos datos.'],
  [/email.*in use/i, 'Ya existe un usuario con ese correo electrónico.'],
  [/not found/i, 'El recurso solicitado no fue encontrado.'],
  [/unauthorized/i, 'No autorizado o sesión expirada.'],
  [/forbidden/i, 'No tienes permisos para realizar esta acción.'],
  [/password.*at least/i, 'La contraseña debe tener al menos 8 caracteres.'],
  [/could not connect|failed to fetch|network/i, 'No se pudo conectar con el servidor.'],
]

function looksSpanish(message: string): boolean {
  return /[áéíóúñ¿¡]/i.test(message) ||
    /\b(el|la|los|las|debe|correo|contraseña|usuario|rol|obligatorio|válido|existe)\b/i.test(message)
}

export function translateUserApiError(message: string): string {
  const trimmed = message.trim()
  if (!trimmed) return 'No se pudo completar la operación. Intenta de nuevo.'

  if (EXACT_TRANSLATIONS[trimmed]) {
    return EXACT_TRANSLATIONS[trimmed]
  }

  if (looksSpanish(trimmed)) {
    return trimmed
  }

  for (const [pattern, translation] of PARTIAL_TRANSLATIONS) {
    if (pattern.test(trimmed)) {
      return translation
    }
  }

  return trimmed
}

export function extractUserApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.violations.length > 0) {
      return err.violations.map(translateUserApiError).join(' ')
    }
    return translateUserApiError(err.message)
  }

  if (err instanceof Error) {
    return translateUserApiError(err.message)
  }

  return 'No se pudo completar la operación. Intenta de nuevo.'
}
