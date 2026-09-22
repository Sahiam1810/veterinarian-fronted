export type UserRole = 'superadmin' | 'admin' | 'veterinario' | 'recepcionista' | 'auxiliar' | 'custom'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  roleName: string
  roleId?: string
  // Compatibilidad de UI: true solo para el role_id canónico SuperAdmin persistido.
  isPlatformSuperAdmin?: boolean
  avatarUrl?: string
  accessToken?: string
  refreshToken?: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

// Cuentas demo locales (solo referencia UI; el login real va al backend).
export interface MockAccount {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  roleName: string
  description: string
  badgeColor?: string
}

export interface AuthenticationResponse {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

export interface CurrentProfileResponse {
  id: string
  fullName: string
  initials: string
  email: string
  role: string
  photoUrl?: string | null
}

