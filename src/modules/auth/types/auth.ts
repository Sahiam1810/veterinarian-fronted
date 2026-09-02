export type UserRole = 'superadmin' | 'admin' | 'veterinario' | 'recepcionista' | 'auxiliar' | 'cliente'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  roleName: string
  roleId?: string
  // Users.Id (person) — mismo id que usa SuperAdmin al guardar excepciones
  personId?: string
  userAccountId?: string
  // true solo para SuperAdmin de plataforma (claim JWT), no para Administrador de clínica
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
  personId: string
  userAccountId: string
  fullName: string
  initials: string
  userName: string
  email: string
  role: string
  accountStatus: string
}
