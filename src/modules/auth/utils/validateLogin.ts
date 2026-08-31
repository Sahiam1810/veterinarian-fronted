// Validación mínima del formulario de login (solo UI).
export type LoginFieldErrors = {
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLoginFields(email: string, password: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {}
  const cleanEmail = email.trim()
  const cleanPassword = password

  if (!cleanEmail) {
    errors.email = 'Ingresa tu correo electrónico.'
  } else if (!EMAIL_PATTERN.test(cleanEmail)) {
    errors.email = 'El correo no tiene un formato válido.'
  }

  if (!cleanPassword) {
    errors.password = 'Ingresa tu contraseña.'
  } else if (cleanPassword.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres.'
  }

  return errors
}

export function hasLoginFieldErrors(errors: LoginFieldErrors): boolean {
  return Boolean(errors.email || errors.password)
}
