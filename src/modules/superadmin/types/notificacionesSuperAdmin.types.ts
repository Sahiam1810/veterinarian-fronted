// Tipos de Notificaciones para el módulo de SuperAdministración

export interface NotificacionSuperAdmin {
  id: string
  message: string
  dateLabel: string
  type: string
  isRead: boolean
  appointmentId: string
}
