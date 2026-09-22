import { apiClient } from '../../../services/apiClient.ts'
import { requireCreateUserPassword } from './requireCreateUserPassword.ts'

export interface ApiUserResponse {
  id: string
  fullName: string
  email: string
  roleId: string
  isActive: boolean
  createdAt: string
}

export interface ApiCreateUserRequest {
  fullName: string
  email: string
  password?: string
  roleId: string
  specialtyId?: string
  licenseNumber?: string
}

export interface ApiCreateUserResponse {
  id: string
}

export interface ApiUpdateUserRequest {
  fullName: string
  email: string
  roleId: string
}

export interface CreateFullUserParams {
  fullName: string
  email: string
  // Obligatorio en runtime; vacío/undefined lo rechaza requireCreateUserPassword.
  password?: string
  roleId: string
  // Veterinario: se mandan en el mismo POST /api/Users para que el backend cree
  // el perfil con estos datos reales, en vez de caer al placeholder LIC-XXXXXXXX.
  specialtyId?: string
  licenseNumber?: string
}

export interface CreateFullUserResult {
  userId: string
}

// 1. Obtener lista de usuarios
export async function fetchUsers(): Promise<ApiUserResponse[]> {
  return apiClient.get<ApiUserResponse[]>('/api/Users')
}

// 2. Obtener usuario por ID
export async function fetchUserById(id: string): Promise<ApiUserResponse> {
  return apiClient.get<ApiUserResponse>(`/api/Users/${id}`)
}

// 3. Crear usuario en /api/Users. U5 fusionó cuenta y credenciales en USERS,
// así que este único POST ya deja al usuario listo para iniciar sesión.
export async function createUser(data: ApiCreateUserRequest): Promise<ApiCreateUserResponse> {
  return apiClient.post<ApiCreateUserResponse>('/api/Users', data)
}

/**
 * Alta de usuario en un solo paso: POST /api/Users (datos básicos, rol y
 * contraseña). Antes de U5/FU1 esto requería 3 llamadas (Users + UserAccounts
 * + UserCredentials); esas dos últimas tablas ya no existen.
 */
export async function createFullUser(params: CreateFullUserParams): Promise<CreateFullUserResult> {
  // Defensa en profundidad: sin password no se llama a la API ni se usa literal publicado.
  const password = requireCreateUserPassword(params.password)

  const userRes = await createUser({
    fullName: params.fullName,
    email: params.email,
    password,
    roleId: params.roleId,
    specialtyId: params.specialtyId,
    licenseNumber: params.licenseNumber,
  })

  if (!userRes || !userRes.id) {
    throw new Error('No se pudo obtener el identificador de usuario creado en /api/Users')
  }

  return { userId: userRes.id }
}

// Actualizar usuario
export async function updateUser(id: string, data: ApiUpdateUserRequest): Promise<void> {
  return apiClient.put<void>(`/api/Users/${id}`, data)
}

// Activar usuario
export async function activateUser(id: string): Promise<void> {
  return apiClient.patch<void>(`/api/Users/${id}/activate`)
}

// Desactivar usuario
export async function deactivateUser(id: string): Promise<void> {
  return apiClient.patch<void>(`/api/Users/${id}/deactivate`)
}

// Elimina un usuario inactivo (API: DELETE /api/Users/{id}).
export async function deleteUser(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Users/${id}`)
}
