/**
 * Traduce códigos de error y respuestas del API (.NET ProblemDetails) a mensajes de usuario en español.
 */
export function translateApiError(
  code?: string | null,
  status?: number,
  rawMessage?: string | null,
): string {
  const cleanCode = (code || '').trim()
  const cleanMessage = (rawMessage || '').trim()

  // 1. Manejo exacto por código de dominio del backend (.NET Result / ProblemDetails)
  if (
    cleanCode === 'Authentication.PlatformAccessDenied' ||
    cleanCode === 'PlatformAccessDenied' ||
    cleanCode === 'Platform.AccessDenied' ||
    cleanCode === 'AccessDenied'
  ) {
    return 'Este correo no tiene permitido acceder.'
  }

  if (
    cleanCode === 'Authentication.InvalidCredentials' ||
    cleanCode === 'InvalidCredentials' ||
    cleanCode === 'Invalid_Credentials' ||
    cleanCode === 'Authentication.Failed'
  ) {
    return 'Correo o contraseña incorrectos.'
  }

  if (
    cleanCode === 'Client.IdentificationAlreadyExists' ||
    cleanCode === 'IdentificationAlreadyExists' ||
    cleanCode === 'IdentificationConflict' ||
    cleanCode === 'DuplicateIdentification'
  ) {
    return 'Ya existe un cliente con este número de identificación o cédula.'
  }

  if (
    cleanCode === 'User.EmailAlreadyInUse' ||
    cleanCode === 'EmailAlreadyInUse' ||
    cleanCode === 'EmailConflict' ||
    cleanCode === 'DuplicateEmail'
  ) {
    return 'Ya existe un usuario con este correo electrónico.'
  }

  if (
    cleanCode === 'User.PhoneAlreadyInUse' ||
    cleanCode === 'PhoneAlreadyInUse' ||
    cleanCode === 'PhoneConflict' ||
    cleanCode === 'DuplicatePhone'
  ) {
    return 'Ya existe un usuario con este número de teléfono.'
  }

  if (
    cleanCode === 'Authentication.UserInactive' ||
    cleanCode === 'User.Inactive' ||
    cleanCode === 'UserInactive'
  ) {
    return 'Tu cuenta está inactiva. Contacta al administrador.'
  }

  if (
    cleanCode === 'Authentication.UserLocked' ||
    cleanCode === 'User.Locked' ||
    cleanCode === 'UserLocked'
  ) {
    return 'Tu cuenta está bloqueada. Contacta al administrador.'
  }

  if (
    cleanCode === 'Authentication.TokenExpired' ||
    cleanCode === 'TokenExpired'
  ) {
    return 'La sesión expiró. Inicia sesión de nuevo.'
  }

  // 2. Si hay mensaje de texto (rawMessage)
  if (cleanMessage) {
    const normalized = cleanMessage.toLowerCase()

    if (
      normalized.includes('platformaccessdenied') ||
      normalized.includes('platform access denied') ||
      normalized.includes('no tiene permitido acceder')
    ) {
      return 'Este correo no tiene permitido acceder.'
    }

    if (
      normalized.includes('invalid credentials') ||
      normalized.includes('authentication failed')
    ) {
      return 'Correo o contraseña incorrectos.'
    }

    if (
      (normalized.includes('identification') || normalized.includes('cedula') || normalized.includes('cédula')) &&
      (normalized.includes('already exists') || normalized.includes('duplicate') || normalized.includes('ya existe'))
    ) {
      return 'Ya existe un cliente con este número de identificación o cédula.'
    }

    if (
      normalized.includes('email') &&
      (normalized.includes('already in use') || normalized.includes('already exists') || normalized.includes('duplicate') || normalized.includes('ya existe'))
    ) {
      return 'Ya existe un usuario con este correo electrónico.'
    }

    if (
      normalized.includes('phone') &&
      (normalized.includes('already in use') || normalized.includes('already exists') || normalized.includes('duplicate') || normalized.includes('ya existe'))
    ) {
      return 'Ya existe un usuario con este número de teléfono.'
    }

    if (normalized.includes('user is inactive') || normalized.includes('cuenta inactiva')) {
      return 'Tu cuenta está inactiva. Contacta al administrador.'
    }

    if (normalized.includes('user is locked') || normalized.includes('cuenta bloqueada')) {
      return 'Tu cuenta está bloqueada. Contacta al administrador.'
    }

    if (
      normalized.includes('unauthorized') ||
      normalized.includes('no autorizado')
    ) {
      return 'No autorizado o sesión expirada.'
    }

    // Si ya es un texto en español con sentido completo
    if (
      /[áéíóúñ¿¡]/i.test(cleanMessage) ||
      /\b(correo|contraseña|sesión|formulario|usuario|cliente|cédula|teléfono)\b/i.test(cleanMessage)
    ) {
      return cleanMessage
    }
  }

  // 3. Fallbacks por código de estado HTTP
  if (status === 401) return 'Correo o contraseña incorrectos.'
  if (status === 403) return 'Este correo no tiene permitido acceder.'
  if (status === 400) return 'Revisa los datos del formulario.'
  if (status === 404) return 'Recurso no encontrado.'
  if (status !== undefined && status >= 500) return 'Error interno del servidor. Intenta de nuevo más tarde.'

  return cleanMessage || 'No se pudo completar la operación.'
}

export function toSpanishAuthError(
  raw: string | null | undefined,
  status?: number,
  code?: string | null,
): string {
  return translateApiError(code, status, raw)
}

