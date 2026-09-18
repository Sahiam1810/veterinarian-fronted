import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { fetchMyModulePermissions, type MyPermissionsMap } from '@/modules/auth'
import type {
  EscalacionesDirectoryPayload,
  EscalatedConversationListItem,
  EscalationStatusFilter,
} from '../types/index.ts'
import {
  fetchEscalatedConversations,
  resolveChannel,
  resolvePriority,
  resolveStatus,
  formatWaitingTime,
  sortEscalatedConversationItems,
} from '../services/index.ts'
import {
  useChatEscalationsRealtime,
  type ChatEscalationCreatedPayload,
  type ChatMessageReceivedPayload,
  type ChatEscalationResolvedPayload,
} from '../../../global/notifications/index.ts'
import { createRecepPermissionHelpers } from '../utils/recepModulePermissions.ts'

const ITEMS_PER_PAGE = 8

// Ticket FE-6: se reordena con el mismo criterio de buildEscalatedDirectory
// (prioridad, luego tiempo de espera) para que insertar una fila nueva por
// SignalR no rompa el orden que ya ve la Recepcionista en la carga inicial.
function recomputeDirectory(
  items: EscalatedConversationListItem[],
): EscalacionesDirectoryPayload {
  const sortedItems = sortEscalatedConversationItems(items)
  const pendingCount = sortedItems.filter((i) => i.status === 'Pendiente').length
  const urgentCount = sortedItems.filter(
    (i) => i.priority === 'Urgente' || i.priority === 'Alta',
  ).length
  const inProgressCount = sortedItems.filter((i) => i.status === 'En atención').length
  return {
    items: sortedItems,
    totalCount: sortedItems.length,
    pendingCount,
    urgentCount,
    inProgressCount,
    pageStart: sortedItems.length > 0 ? 1 : 0,
    pageEnd: sortedItems.length,
  }
}

export function useRecepEscalaciones(
  enabled: boolean = true,
  autoRefreshIntervalMs: number = 30000,
) {
  const [directory, setDirectory] = useState<EscalacionesDirectoryPayload | null>(null)
  const [modulePermissions, setModulePermissions] =
    useState<MyPermissionsMap | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EscalationStatusFilter>('todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date())

  const isMountedRef = useRef(true)

  const showNotice = useCallback((message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 3000)
  }, [])

  const permissionHelpers = useMemo(
    () => createRecepPermissionHelpers(modulePermissions),
    [modulePermissions],
  )

  const canSendMessages = permissionHelpers.canCreateModule('conversaciones')
  const canResolveEscalations = permissionHelpers.canEditModule('conversaciones')

  const loadPermissions = useCallback(async () => {
    try {
      const permissions = await fetchMyModulePermissions()
      setModulePermissions(permissions)
    } catch {
      setModulePermissions({})
    }
  }, [])

  const loadDirectory = useCallback(
    async (isBackground: boolean = false) => {
      if (isBackground) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)
      try {
        const data = await fetchEscalatedConversations()
        if (isMountedRef.current) {
          setDirectory(data)
          setLastRefreshedAt(new Date())
        }
      } catch (err) {
        if (isMountedRef.current) {
          const msg =
            err instanceof Error
              ? err.message
              : 'No se pudo cargar la bandeja de conversaciones escaladas'
          setError(msg)
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    },
    [],
  )

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    void loadDirectory(false)
    void loadPermissions()
  }, [enabled, loadDirectory, loadPermissions])

  // Intervalo de auto-refresco en segundo plano (degradación segura / polling de respaldo)
  useEffect(() => {
    if (!enabled || autoRefreshIntervalMs <= 0) return

    const timer = setInterval(() => {
      void loadDirectory(true)
    }, autoRefreshIntervalMs)

    return () => clearInterval(timer)
  }, [enabled, autoRefreshIntervalMs, loadDirectory])

  useEffect(() => {
    if (!enabled) setSelectedId(null)
  }, [enabled])

  // =========================================================================
  // Handlers en tiempo real (SignalR)
  // =========================================================================

  // 1. ChatEscalationCreated: agregar conversación al inicio de la lista
  const handleRealtimeEscalationCreated = useCallback(
    (payload: ChatEscalationCreatedPayload) => {
      setDirectory((curr) => {
        const currentItems = curr?.items ?? []
        // Evitar duplicados
        if (
          currentItems.some(
            (i) =>
              i.escalationId === payload.escalationId ||
              i.conversationId === payload.conversationId,
          )
        ) {
          return curr
        }

        const date = new Date(payload.createdAt)
        const lastMessageTimeLabel = !isNaN(date.getTime())
          ? date.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : 'Ahora'

        const waitingInfo = formatWaitingTime(payload.createdAt)

        const newItem: EscalatedConversationListItem = {
          id: payload.escalationId,
          conversationId: payload.conversationId,
          escalationId: payload.escalationId,
          clientName: payload.clientName || 'Cliente',
          clientPhone: payload.clientPhone ?? null,
          channel: resolveChannel(payload.channel),
          channelRaw: payload.channel || 'Telegram',
          lastMessage:
            payload.lastMessage ||
            payload.reason ||
            'Solicitud de asesor humano',
          lastMessageAt: payload.createdAt,
          lastMessageTimeLabel,
          waitingTimeLabel: waitingInfo.label,
          waitingMinutes: waitingInfo.minutes,
          priority: resolvePriority(payload.priority),
          priorityId: payload.priority ?? null,
          status: resolveStatus(payload.status),
          statusId: payload.status ?? null,
          createdAt: payload.createdAt,
          reason: payload.reason ?? null,
        }

        const nextItems = [newItem, ...currentItems]
        return recomputeDirectory(nextItems)
      })

      showNotice(`Nueva conversación: ${payload.clientName || 'Cliente'}`)
    },
    [showNotice],
  )

  // 2. ChatMessageReceived: actualizar último mensaje en la fila
  const handleRealtimeMessageReceived = useCallback(
    (payload: ChatMessageReceivedPayload) => {
      setDirectory((curr) => {
        if (!curr) return curr

        const nextItems = curr.items.map((item) => {
          if (item.conversationId === payload.conversationId) {
            const date = new Date(payload.sentAt)
            const lastMessageTimeLabel = !isNaN(date.getTime())
              ? date.toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : item.lastMessageTimeLabel

            return {
              ...item,
              lastMessage: payload.content,
              lastMessageAt: payload.sentAt,
              lastMessageTimeLabel,
            }
          }
          return item
        })

        return {
          ...curr,
          items: nextItems,
        }
      })
    },
    [],
  )

  // 3. ChatEscalationResolved: remover conversación de la lista
  const handleRealtimeEscalationResolved = useCallback(
    (payload: ChatEscalationResolvedPayload) => {
      setDirectory((curr) => {
        if (!curr) return curr

        const nextItems = curr.items.filter(
          (i) =>
            i.escalationId !== payload.escalationId &&
            (!payload.conversationId || i.conversationId !== payload.conversationId),
        )

        return recomputeDirectory(nextItems)
      })

      setSelectedId((prev) => (prev === payload.escalationId ? null : prev))
      showNotice('Conversación resuelta')
    },
    [showNotice],
  )

  // Conexión reactiva a SignalR
  useChatEscalationsRealtime({
    enabled,
    onEscalationCreated: handleRealtimeEscalationCreated,
    onMessageReceived: handleRealtimeMessageReceived,
    onEscalationResolved: handleRealtimeEscalationResolved,
  })

  // Reiniciar a la página 1 cuando cambia el filtro o la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const filteredItems = useMemo(() => {
    if (!directory) return []
    const query = search.trim().toLowerCase()

    return directory.items.filter((item) => {
      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'pendientes' && item.status === 'Pendiente') ||
        (statusFilter === 'en_atencion' && item.status === 'En atención') ||
        (statusFilter === 'urgentes' && (item.priority === 'Urgente' || item.priority === 'Alta'))

      const matchesQuery =
        !query ||
        item.clientName.toLowerCase().includes(query) ||
        (item.clientPhone && item.clientPhone.toLowerCase().includes(query)) ||
        item.lastMessage.toLowerCase().includes(query) ||
        item.channel.toLowerCase().includes(query) ||
        (item.reason && item.reason.toLowerCase().includes(query)) ||
        item.priority.toLowerCase().includes(query)

      return matchesStatus && matchesQuery
    })
  }, [directory, search, statusFilter])

  // Paginación calculada
  const totalCount = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))
  const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalCount)

  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredItems.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [filteredItems, currentPage])

  const selectedItem: EscalatedConversationListItem | null = useMemo(() => {
    if (!directory || !selectedId) return null
    return directory.items.find((i) => i.id === selectedId || i.conversationId === selectedId) ?? null
  }, [directory, selectedId])

  const handleSelect = (id: string) => setSelectedId(id)
  const handleCloseDetail = () => setSelectedId(null)

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  const handleGoToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const manualReload = useCallback(async () => {
    await loadDirectory(false)
    showNotice('Bandeja actualizada')
  }, [loadDirectory, showNotice])

  return {
    directory,
    items: directory?.items ?? [],
    filteredItems: paginatedItems,
    allFilteredItems: filteredItems,
    selectedId,
    selectedItem,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isLoading,
    isRefreshing,
    error,
    notice,
    canSendMessages,
    canResolveEscalations,
    currentPage,
    totalPages,
    pageStart,
    pageEnd,
    totalCount,
    lastRefreshedAt,
    reloadDirectory: manualReload,
    handleSelect,
    handleCloseDetail,
    handlePrevPage,
    handleNextPage,
    handleGoToPage,
    showNotice,
  }
}
