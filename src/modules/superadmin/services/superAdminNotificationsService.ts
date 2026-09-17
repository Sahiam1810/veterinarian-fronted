import { apiClient } from '@/services'

export interface ApiNotificationResponse {
  id: string
  userId: string
  userFullName?: string | null
  appointmentId: string
  message?: string | null
  sentAt: string
  status?: string | null
  type?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface ApiCreateNotificationRequest {
  userId: string
  appointmentId: string
  message?: string | null
  sentAt: string
  status?: string | null
  type?: string | null
}

export interface ApiUpdateNotificationRequest {
  userId: string
  appointmentId: string
  message?: string | null
  sentAt: string
  status?: string | null
  type?: string | null
}

export interface ApiCreateNotificationResponse {
  id: string
}

export async function fetchNotifications(): Promise<ApiNotificationResponse[]> {
  return apiClient.get<ApiNotificationResponse[]>('/api/Notifications')
}

export async function fetchNotificationsByUser(userId: string): Promise<ApiNotificationResponse[]> {
  return apiClient.get<ApiNotificationResponse[]>(`/api/Notifications/user/${userId}`)
}

export async function fetchNotificationById(id: string): Promise<ApiNotificationResponse> {
  return apiClient.get<ApiNotificationResponse>(`/api/Notifications/${id}`)
}

export async function createNotification(
  data: ApiCreateNotificationRequest,
): Promise<ApiCreateNotificationResponse> {
  return apiClient.post<ApiCreateNotificationResponse>('/api/Notifications', data)
}

export async function updateNotification(id: string, data: ApiUpdateNotificationRequest): Promise<void> {
  return apiClient.put<void>(`/api/Notifications/${id}`, data)
}

// Marca como leída sin exigir Notificaciones.Edit (endpoint de dueño)
export async function markNotificationAsRead(id: string): Promise<void> {
  return apiClient.patch<void>(`/api/Notifications/${id}/read`)
}

export async function deleteNotification(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/Notifications/${id}`)
}
