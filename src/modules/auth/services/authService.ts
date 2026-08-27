import type { AuthUser, LoginCredentials, MockAccount } from '../types'

/** Usuarios predefinidos de prueba para el sistema provisional */
export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Mario Ramírez',
    email: 'admin@huellitas.com',
    password: 'admin',
    role: 'admin',
    roleName: 'Administrador',
    description: 'Gestión total de usuarios, roles, catálogo y dashboard administrativo.',
    badgeColor: 'brand',
  },
  {
    id: 'usr-vet-1',
    name: 'Dr. Roberto Silva',
    email: 'veterinario@huellitas.com',
    password: 'vet',
    role: 'veterinario',
    roleName: 'Veterinario',
    description: 'Atención de pacientes, agenda del día, historial clínico y mascotas.',
    badgeColor: 'terracotta',
  },
  {
    id: 'usr-recep-1',
    name: 'Carlos Méndez',
    email: 'recepcion@huellitas.com',
    password: 'recepcion',
    role: 'recepcionista',
    roleName: 'Recepcionista',
    description: 'Gestión de citas, dueños, mascotas y agenda del día.',
    badgeColor: 'sage',
  },
]

/** Alias amigables de correo para facilitar las pruebas rápidas */
const EMAIL_ALIASES: Record<string, string> = {
  'admin@vetclinic.com': 'admin@huellitas.com',
  'mario.ramirez@vetclinic.com': 'admin@huellitas.com',
  'admin': 'admin@huellitas.com',
  'admin@admin.com': 'admin@huellitas.com',
  'vet@huellitas.com': 'veterinario@huellitas.com',
  'vet@vetclinic.com': 'veterinario@huellitas.com',
  'ana.silva@vetclinic.com': 'veterinario@huellitas.com',
  'roberto.silva@vetclinic.com': 'veterinario@huellitas.com',
  'vet': 'veterinario@huellitas.com',
  'veterinario': 'veterinario@huellitas.com',
  'recepcion': 'recepcion@huellitas.com',
  'recepcionista': 'recepcion@huellitas.com',
  'recepcion@vetclinic.com': 'recepcion@huellitas.com',
  'carlos.mendez@vetclinic.com': 'recepcion@huellitas.com',
  'carlos@huellitas.com': 'recepcion@huellitas.com',
}

const AUTH_STORAGE_KEY = 'huellitas_auth_user'

/** Simulación de login con validación de credenciales y mock accounts */
export async function loginRequest(credentials: LoginCredentials): Promise<AuthUser> {
  // Pequeña latencia de red para sensación fluida y real
  await new Promise((resolve) => setTimeout(resolve, 250))

  const cleanEmail = (credentials.email || '').trim().toLowerCase()
  const resolvedEmail = EMAIL_ALIASES[cleanEmail] || cleanEmail
  const cleanPassword = (credentials.password || '').trim()

  const account = MOCK_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === resolvedEmail
  )

  if (!account) {
    throw new Error(
      'Usuario no encontrado. Prueba admin@huellitas.com, veterinario@huellitas.com o recepcion@huellitas.com',
    )
  }

  // Contraseñas válidas aceptadas para facilidad durante desarrollo
  const acceptedPasswords = [
    account.password.toLowerCase(),
    '123456',
    'admin123',
    'vet123',
    'admin',
    'vet',
    'recepcion',
    'recepcion123',
    'huellitas',
    'password',
  ]

  if (
    !acceptedPasswords.includes(cleanPassword.toLowerCase()) &&
    cleanPassword !== account.password
  ) {
    throw new Error('Contraseña incorrecta. (Prueba con "admin", "vet" o "123456")')
  }

  const authUser: AuthUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    roleName: account.roleName,
  }

  setStoredUser(authUser, credentials.remember ?? true)
  return authUser
}

/** Obtiene el usuario autenticado desde almacenamiento local/sesión */
export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

/** Guarda el usuario en el almacenamiento */
export function setStoredUser(user: AuthUser, remember: boolean = true): void {
  try {
    const serialized = JSON.stringify(user)
    if (remember) {
      localStorage.setItem(AUTH_STORAGE_KEY, serialized)
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, serialized)
    }
  } catch (err) {
    console.error('Error al persistir sesión', err)
  }
}

/** Elimina la sesión activa */
export function clearStoredUser(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
  } catch (err) {
    console.error('Error al limpiar sesión', err)
  }
}

