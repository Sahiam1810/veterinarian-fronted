export type UserRole = 'admin' | 'veterinario' | 'recepcionista' | 'auxiliar'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  roleName: string
  avatarUrl?: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

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

