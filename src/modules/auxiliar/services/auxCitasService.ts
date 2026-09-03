import { apiClient } from '@/services'
import type {
  ApiAppointmentResponse,
  ApiCreateAppointmentRequest,
  ApiUpdateAppointmentRequest,
} from '../types'

export interface CreateAppointmentResponse {
  id: string
}

// 1. Obtener todas las citas
export async function fetchAppointments(): Promise<ApiAppointmentResponse[]> {
  return apiClient.get<ApiAppointmentResponse[]>('/api/Appointments')
}

// 2. Obtener cita por ID
export async function fetchAppointmentById(id: string): Promise<ApiAppointmentResponse> {
  return apiClient.get<ApiAppointmentResponse>(`/api/Appointments/${id}`)
}

// 3. Crear nueva cita
export async function createAppointment(data: ApiCreateAppointmentRequest): Promise<CreateAppointmentResponse> {
  return apiClient.post<CreateAppointmentResponse>('/api/Appointments', data)
}

// 4. Actualizar cita
export async function updateAppointment(id: string, data: ApiUpdateAppointmentRequest): Promise<void> {
  return apiClient.put<void>(`/api/Appointments/${id}`, data)
}

// 5. Eliminar cita
export async function deleteAppointment(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Appointments/${id}`)
}
