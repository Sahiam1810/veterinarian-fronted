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
  {
    id: 'usr-aux-1',
    name: 'Laura Gómez',
    email: 'auxiliar@huellitas.com',
    password: 'auxiliar',
    role: 'auxiliar',
    roleName: 'Auxiliar',
    description: 'Soporte clínico, asistencia en consultas y cuidado de pacientes.',
    badgeColor: 'terracotta',
  },
  {
    id: 'usr-cliente-1',
    name: 'Mariana Ruiz',
    email: 'cliente@huellitas.com',
    password: 'cliente',
    role: 'cliente',
    roleName: 'Cliente',
    description: 'Portal del dueño: mascotas, citas, historial y perfil personal.',
    badgeColor: 'ochre',
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
  'auxiliar': 'auxiliar@huellitas.com',
  'aux': 'auxiliar@huellitas.com',
  'auxiliar@huellitas.com': 'auxiliar@huellitas.com',
  'auxiliar@vetclinic.com': 'auxiliar@huellitas.com',
  'laura.gomez@vetclinic.com': 'auxiliar@huellitas.com',
  'laura@huellitas.com': 'auxiliar@huellitas.com',
  'laura': 'auxiliar@huellitas.com',
  'cliente': 'cliente@huellitas.com',
  'cliente@vetclinic.com': 'cliente@huellitas.com',
  'ana.gomez@vetclinic.com': 'cliente@huellitas.com',
  'ana@huellitas.com': 'cliente@huellitas.com',
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
      'Usuario no encontrado. Prueba admin@huellitas.com, veterinario@huellitas.com, recepcion@huellitas.com, auxiliar@huellitas.com o cliente@huellitas.com',
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
    'auxiliar',
    'auxiliar123',
    'aux123',
    'aux',
    'cliente',
    'cliente123',
    'huellitas',
    'password',
  ]

  if (
    !acceptedPasswords.includes(cleanPassword.toLowerCase()) &&
    cleanPassword !== account.password
  ) {
    throw new Error('Contraseña incorrecta. (Prueba con "admin", "vet", "recepcion", "auxiliar", "cliente" o "123456")')
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

