import { apiClient } from '@/services'

export interface ApiAppointmentResponse {
  id: string
  clientPetId: string
  veterinarianId: string
  serviceId: string
  serviceName?: string | null
  statusId: string
  statusName?: string | null
  availabilityId: string
  scheduledStart: string
  scheduledEnd: string
  notes?: string | null
  createdAt: string
}

export interface ApiCreateAppointmentRequest {
  clientPetId: string
  veterinarianId: string
  serviceId: string
  statusId: string
  availabilityId: string
  scheduledStart: string
  scheduledEnd: string
  notes?: string | null
}

export interface ApiUpdateAppointmentRequest {
  clientPetId: string
  veterinarianId: string
  serviceId: string
  statusId: string
  availabilityId: string
  scheduledStart: string
  scheduledEnd: string
  notes?: string | null
}

export interface ApiCreateAppointmentResponse {
  id: string
}

export async function fetchAppointments(): Promise<ApiAppointmentResponse[]> {
  return apiClient.get<ApiAppointmentResponse[]>('/api/Appointments')
}

export async function fetchAppointmentById(id: string): Promise<ApiAppointmentResponse> {
  return apiClient.get<ApiAppointmentResponse>(`/api/Appointments/${id}`)
}

export async function createAppointment(data: ApiCreateAppointmentRequest): Promise<ApiCreateAppointmentResponse> {
  return apiClient.post<ApiCreateAppointmentResponse>('/api/Appointments', data)
}

export async function updateAppointment(id: string, data: ApiUpdateAppointmentRequest): Promise<void> {
  return apiClient.put<void>(`/api/Appointments/${id}`, data)
}

export interface ApiUpdateAppointmentStatusRequest {
  statusId: string
  comment?: string | null
}

// Transición canónica de estado (AGENDADA → ATENDIDA | CANCELADA | NO_ASISTIO)
export async function updateAppointmentStatus(
  appointmentId: string,
  data: ApiUpdateAppointmentStatusRequest,
): Promise<void> {
  return apiClient.patch<void>(`/api/Appointments/${appointmentId}/status`, data)
}

export async function deleteAppointment(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Appointments/${id}`)
}
