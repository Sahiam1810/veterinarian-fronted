import { useState, useMemo, useEffect, useCallback } from 'react'
import type { ApiNotificationResponse } from '../services/superAdminNotificationsService'
import { fetchNotificationsByUser, updateNotification } from '../services'
import { mapNotificationToNotificacion, NOTIFICATION_READ_STATUS } from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'

export function useNotificationsSuperAdmin(userId: string | undefined) {
  const [records, setRecords] = useState<ApiNotificationResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchNotificationsByUser(userId)
      const sorted = [...data].sort(
        (a, b) => new Date(b.sentAt ?? b.createdAt).getTime() - new Date(a.sentAt ?? a.createdAt).getTime()
      )
      setRecords(sorted)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudieron cargar las notificaciones.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const notifications = useMemo(() => records.map(mapNotificationToNotificacion), [records])
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications])

  const markAsRead = useCallback(
    async (id: string) => {
      const record = records.find((r) => r.id === id)
      if (!record || record.status === NOTIFICATION_READ_STATUS) return
      try {
        await updateNotification(id, {
          userId: record.userId,
          appointmentId: record.appointmentId,
          message: record.message,
          sentAt: record.sentAt,
          status: NOTIFICATION_READ_STATUS,
          type: record.type,
        })
        setRecords((curr) => curr.map((r) => (r.id === id ? { ...r, status: NOTIFICATION_READ_STATUS } : r)))
      } catch {
        // Silencioso: marcar como leída es una acción secundaria, no bloquea la vista.
      }
    },
    [records]
  )

  const markAllAsRead = useCallback(async () => {
    const unread = records.filter((r) => r.status !== NOTIFICATION_READ_STATUS)
    if (unread.length === 0) return
    try {
      await Promise.all(
        unread.map((record) =>
          updateNotification(record.id, {
            userId: record.userId,
            appointmentId: record.appointmentId,
            message: record.message,
            sentAt: record.sentAt,
            status: NOTIFICATION_READ_STATUS,
            type: record.type,
          })
        )
      )
      setRecords((curr) => curr.map((r) => ({ ...r, status: NOTIFICATION_READ_STATUS })))
    } catch {
      // Silencioso: si falla, el usuario puede reintentar abriendo el panel de nuevo.
    }
  }, [records])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    reload: loadData,
    markAsRead,
    markAllAsRead,
  }
}
