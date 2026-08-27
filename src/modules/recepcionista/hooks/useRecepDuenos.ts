import { useEffect, useMemo, useState } from 'react'
import type {
  RecepDuenoDetail,
  RecepDuenoStatusFilter,
  RecepDuenosDirectoryPayload,
} from '../types'
import { fetchRecepDuenosDirectory } from '../services'

export function useRecepDuenos(enabled: boolean) {
  const [directory, setDirectory] = useState<RecepDuenosDirectoryPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RecepDuenoStatusFilter>('todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function loadDirectory() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchRecepDuenosDirectory()
        if (!cancelled) setDirectory(data)
      } catch {
        if (!cancelled) setError('No se pudo cargar el directorio de dueños')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadDirectory()
    return () => {
      cancelled = true
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) setSelectedId(null)
  }, [enabled])

  const filteredItems = useMemo(() => {
    if (!directory) return []
    const query = search.trim().toLowerCase()

    return directory.items.filter((owner) => {
      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'activos' && owner.estado === 'Activo') ||
        (statusFilter === 'inactivos' && owner.estado === 'Inactivo')

      const matchesQuery =
        !query ||
        owner.fullName.toLowerCase().includes(query) ||
        owner.documentId.toLowerCase().includes(query) ||
        owner.email.toLowerCase().includes(query) ||
        owner.phone.toLowerCase().includes(query) ||
        owner.code.toLowerCase().includes(query)

      return matchesStatus && matchesQuery
    })
  }, [directory, search, statusFilter])

  const selectedDetail: RecepDuenoDetail | null =
    directory && selectedId ? directory.detailsById[selectedId] ?? null : null

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 2800)
  }

  const handleSelect = (ownerId: string) => setSelectedId(ownerId)
  const handleCloseDetail = () => setSelectedId(null)
  const handleNewOwner = () => showNotice('Nuevo dueño: módulo pendiente')
  const handlePrevPage = () => showNotice('Paginación: pendiente de API')
  const handleNextPage = () => showNotice('Paginación: pendiente de API')
  const handleGoToPage = (page: number) =>
    showNotice(`Ir a página ${page}: pendiente de API`)

  return {
    directory,
    filteredItems,
    selectedDetail,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,
    notice,
    handleSelect,
    handleCloseDetail,
    handleNewOwner,
    handlePrevPage,
    handleNextPage,
    handleGoToPage,
  }
}
