import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import type {
  EscalacionesDirectoryPayload,
  EscalatedConversationListItem,
  EscalationStatusFilter,
} from '../types/index.ts'
import { fetchEscalatedConversations } from '../services/index.ts'

const ITEMS_PER_PAGE = 8

export function useRecepEscalaciones(
  enabled: boolean = true,
  autoRefreshIntervalMs: number = 30000,
) {
  const [directory, setDirectory] = useState<EscalacionesDirectoryPayload | null>(null)
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
  }, [enabled, loadDirectory])

  // Intervalo de auto-refresco en segundo plano
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
