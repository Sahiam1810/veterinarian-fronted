import type {
  AuthUser,
  AuthenticationResponse,
  CurrentProfileResponse,
  LoginCredentials,
  MockAccount,
  UserRole,
} from '../types'
import { toSpanishAuthError } from '../utils/toSpanishAuthError'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')
  || 'http://localhost:5233'

const AUTH_STORAGE_KEY = 'huellitas_auth_user'
const AUTH_TOKENS_KEY = 'huellitas_auth_tokens'

// Cuentas de referencia para la UI de pruebas (mismas del seed Oracle).
export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: 'usr-superadmin-1',
    name: 'Dr. Mario Ramirez',
    email: 'superadmin@huellitas.com',
    password: 'Huellitas2026!',
    role: 'superadmin',
    roleName: 'SuperAdministrador',
    description: 'Gestión total de usuarios, roles, catálogo y dashboard superadministrativo.',
    badgeColor: 'brand',
  },
  {
    id: 'usr-vet-1',
    name: 'Dr. Roberto Silva',
    email: 'veterinario@huellitas.com',
    password: 'Huellitas2026!',
    role: 'veterinario',
    roleName: 'Veterinario',
    description: 'Atención de pacientes, agenda del día, historial clínico y mascotas.',
    badgeColor: 'terracotta',
  },
  {
    id: 'usr-recep-1',
    name: 'Carlos Mendez',
    email: 'recepcion@huellitas.com',
    password: 'Huellitas2026!',
    role: 'recepcionista',
    roleName: 'Recepcionista',
    description: 'Gestión de citas, dueños, mascotas y agenda del día.',
    badgeColor: 'sage',
  },
  {
    id: 'usr-aux-1',
    name: 'Laura Gomez',
    email: 'auxiliar@huellitas.com',
    password: 'Huellitas2026!',
    role: 'auxiliar',
    roleName: 'Auxiliar',
    description: 'Soporte clínico, asistencia en consultas y cuidado de pacientes.',
    badgeColor: 'terracotta',
  },
  {
    id: 'usr-cliente-1',
    name: 'Mariana Ruiz',
    email: 'cliente@huellitas.com',
    password: 'Huellitas2026!',
    role: 'cliente',
    roleName: 'Cliente',
    description: 'Portal del dueño: mascotas, citas, historial y perfil personal.',
    badgeColor: 'ochre',
  },
]

// Mapea el nombre de rol Oracle/API al rol de navegación del frontend.
function mapBackendRole(roleName: string): UserRole {
  const normalized = roleName.trim().toLowerCase()
  if (normalized.includes('superadmin') || normalized.includes('super admin') || normalized.includes('admin')) return 'superadmin'
  if (normalized.includes('veterinar')) return 'veterinario'
  if (normalized.includes('recep')) return 'recepcionista'
  if (normalized.includes('aux')) return 'auxiliar'
  if (normalized.includes('client')) return 'cliente'
  return 'cliente'
}

async function readErrorMessage(response: Response): Promise<string> {
  let raw = ''

  try {
    const payload = await response.json() as {
      message?: string
      title?: string
      detail?: string
      errors?: Record<string, string[] | string>
    }

    if (payload.message) raw = payload.message
    else if (payload.detail) raw = payload.detail
    else if (payload.errors && typeof payload.errors === 'object') {
      // FluentValidation / ProblemDetails: primer mensaje de campo.
      for (const value of Object.values(payload.errors)) {
        if (Array.isArray(value) && value[0]) {
          raw = String(value[0])
          break
        }
        if (typeof value === 'string' && value) {
          raw = value
          break
        }
      }
    } else if (payload.title) {
      raw = payload.title
    }
  } catch {
    // Sin cuerpo JSON usable.
  }

  return toSpanishAuthError(raw, response.status)
}

// Login real contra POST /api/auth/login + comprobación GET /api/auth/me.
export async function loginRequest(credentials: LoginCredentials): Promise<AuthUser> {
  if (!API_BASE_URL) {
    throw new Error('Falta VITE_API_URL en el entorno del frontend.')
  }

  const cleanEmail = (credentials.email || '').trim().toLowerCase()
  const cleanPassword = (credentials.password || '').trim()

  if (!cleanEmail || !cleanPassword) {
    throw new Error('Correo y contraseña son obligatorios.')
  }

  let loginResponse: Response
  try {
    loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
    })
  } catch {
    throw new Error(
      `No se pudo conectar con el backend en ${API_BASE_URL}. ¿Está corriendo la API?`,
    )
  }

  if (!loginResponse.ok) {
    throw new Error(await readErrorMessage(loginResponse))
  }

  const tokens = await loginResponse.json() as AuthenticationResponse

  const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  })

  if (!meResponse.ok) {
    throw new Error('El token se emitió, pero no se pudo comprobar la sesión.')
  }

  const profile = await meResponse.json() as CurrentProfileResponse
  const role = mapBackendRole(profile.role)

  const authUser: AuthUser = {
    id: profile.userAccountId || profile.personId,
    name: profile.fullName,
    email: profile.email,
    role,
    roleName: profile.role,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }

  setStoredUser(authUser, credentials.remember ?? true)
  setStoredTokens(tokens, credentials.remember ?? true)
  return authUser
}

export function getAccessToken(): string | null {
  const user = getStoredUser()
  if (user?.accessToken) return user.accessToken

  try {
    const raw = localStorage.getItem(AUTH_TOKENS_KEY) || sessionStorage.getItem(AUTH_TOKENS_KEY)
    if (!raw) return null
    const tokens = JSON.parse(raw) as AuthenticationResponse
    return tokens.accessToken || null
  } catch {
    return null
  }
}

function setStoredTokens(tokens: AuthenticationResponse, remember: boolean): void {
  try {
    const serialized = JSON.stringify(tokens)
    if (remember) {
      localStorage.setItem(AUTH_TOKENS_KEY, serialized)
      sessionStorage.removeItem(AUTH_TOKENS_KEY)
    } else {
      sessionStorage.setItem(AUTH_TOKENS_KEY, serialized)
      localStorage.removeItem(AUTH_TOKENS_KEY)
    }
  } catch (err) {
    console.error('Error al persistir tokens', err)
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setStoredUser(user: AuthUser, remember: boolean = true): void {
  try {
    const serialized = JSON.stringify(user)
    if (remember) {
      localStorage.setItem(AUTH_STORAGE_KEY, serialized)
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, serialized)
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  } catch (err) {
    console.error('Error al persistir sesión', err)
  }
}

export function clearStoredUser(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(AUTH_TOKENS_KEY)
    sessionStorage.removeItem(AUTH_TOKENS_KEY)
  } catch (err) {
    console.error('Error al limpiar sesión', err)
  }
}
