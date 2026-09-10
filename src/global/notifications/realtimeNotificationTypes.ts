// Payload de ReceiveNotification (mismo contrato que NotificationResponse del API).
export interface RealtimeNotificationPayload {
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
