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

export interface ApiUserAccountResponse {
  id: string
  userId: string
  username: string
  mail: string
  status: string
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

export interface ApiCreateUserAccountRequest {
  userId: string
  username: string
  mail: string
  status?: string
}

export interface ApiCreateUserAccountResponse {
  id: string
}

export interface ApiCreateUserCredentialsRequest {
  accountId: string
  password?: string
}

export interface ApiCreateUserCredentialsResponse {
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
  username?: string
  // Veterinario: se mandan en el mismo POST /api/Users para que el backend cree
  // el perfil con estos datos reales, en vez de caer al placeholder LIC-XXXXXXXX.
  specialtyId?: string
  licenseNumber?: string
}

export interface CreateFullUserResult {
  userId: string
  accountId: string
}

// 1. Obtener lista de usuarios
export async function fetchUsers(): Promise<ApiUserResponse[]> {
  return apiClient.get<ApiUserResponse[]>('/api/Users')
}

// 2. Obtener usuario por ID
export async function fetchUserById(id: string): Promise<ApiUserResponse> {
  return apiClient.get<ApiUserResponse>(`/api/Users/${id}`)
}

// 3. Paso 1: Crear usuario en /api/Users
export async function createUser(data: ApiCreateUserRequest): Promise<ApiCreateUserResponse> {
  return apiClient.post<ApiCreateUserResponse>('/api/Users', data)
}

// 4. Paso 2: Crear y vincular cuenta de usuario en /api/UserAccounts
export async function createUserAccount(data: ApiCreateUserAccountRequest): Promise<ApiCreateUserAccountResponse> {
  return apiClient.post<ApiCreateUserAccountResponse>('/api/UserAccounts', data)
}

// 5. Paso 3: Crear credenciales para la cuenta en /api/UserCredentials
export async function createUserCredentials(data: ApiCreateUserCredentialsRequest): Promise<ApiCreateUserCredentialsResponse> {
  return apiClient.post<ApiCreateUserCredentialsResponse>('/api/UserCredentials', data)
}

/**
 * Pipeline completo de 3 pasos para crear un usuario totalmente operativo y habilitado para iniciar sesión:
 * Paso 1: POST /api/Users (datos básicos y rol)
 * Paso 2: POST /api/UserAccounts (vincula la cuenta con userId)
 * Paso 3: POST /api/UserCredentials (define la contraseña de login con accountId)
 */
export async function createFullUser(params: CreateFullUserParams): Promise<CreateFullUserResult> {
  // Defensa en profundidad: sin password no se llama a la API ni se usa literal publicado.
  const password = requireCreateUserPassword(params.password)
  const username = params.username?.trim() || params.email.split('@')[0] || params.fullName.replace(/\s+/g, '').toLowerCase()

  // Paso 1: Crear usuario en /api/Users (incluye specialtyId/licenseNumber si es
  // Veterinario, para que el backend cree el perfil con los datos reales)
  const userRes = await createUser({
    fullName: params.fullName,
    email: params.email,
    password: password,
    roleId: params.roleId,
    specialtyId: params.specialtyId,
    licenseNumber: params.licenseNumber,
  })

  if (!userRes || !userRes.id) {
    throw new Error('No se pudo obtener el identificador de usuario creado en /api/Users')
  }

  const userId = userRes.id

  // Paso 2: Crear cuenta en /api/UserAccounts vinculada al userId
  const accountRes = await createUserAccount({
    userId,
    username,
    mail: params.email,
    status: 'Activo',
  })

  if (!accountRes || !accountRes.id) {
    throw new Error('No se pudo generar la cuenta de usuario en /api/UserAccounts')
  }

  const accountId = accountRes.id

  // Paso 3: Crear credenciales en /api/UserCredentials vinculadas al accountId
  await createUserCredentials({
    accountId,
    password,
  })

  return { userId, accountId }
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

// Listar cuentas de acceso (login) para cruzarlas con USERS.
export async function fetchUserAccounts(): Promise<ApiUserAccountResponse[]> {
  return apiClient.get<ApiUserAccountResponse[]>('/api/UserAccounts')
}

// Quita la cuenta de login; el backend bloquea SuperAdmin.
export async function deleteUserAccount(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/UserAccounts/${id}`)
}
