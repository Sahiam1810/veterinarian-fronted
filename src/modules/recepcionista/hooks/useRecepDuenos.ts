import { useEffect, useMemo, useState, useCallback } from 'react'
import type {
  RecepDuenoDetail,
  RecepDuenoFormData,
  RecepDuenoStatusFilter,
  RecepDuenosDirectoryPayload,
} from '../types'
import { fetchRecepDuenosDirectory, createRecepDueno, updateRecepDueno } from '../services'

const ITEMS_PER_PAGE = 8

export function useRecepDuenos(enabled: boolean) {
  const [directory, setDirectory] = useState<RecepDuenosDirectoryPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RecepDuenoStatusFilter>('todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Modal de registro / edición de dueño
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOwner, setEditingOwner] = useState<RecepDuenoDetail | null>(null)

  const showNotice = useCallback((message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 3000)
  }, [])

  const loadDirectory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchRecepDuenosDirectory()
      setDirectory(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar el directorio de dueños'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    void loadDirectory()
  }, [enabled, loadDirectory])

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

  // Paginación calculada
  const totalCount = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))
  const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalCount)

  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredItems.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [filteredItems, currentPage])

  const selectedDetail: RecepDuenoDetail | null =
    directory && selectedId ? directory.detailsById[selectedId] ?? null : null

  const handleSelect = (ownerId: string) => setSelectedId(ownerId)
  const handleCloseDetail = () => setSelectedId(null)

  const openCreateOwner = () => {
    setEditingOwner(null)
    setIsModalOpen(true)
  }

  const openEditOwner = (owner: RecepDuenoDetail) => {
    setEditingOwner(owner)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingOwner(null)
  }

  const handleSaveOwner = async (data: RecepDuenoFormData) => {
    setIsSubmitting(true)
    try {
      if (editingOwner) {
        await updateRecepDueno(editingOwner.id, editingOwner.userId, data)
        showNotice(`Dueño "${data.fullName}" actualizado con éxito`)
      } else {
        const result = await createRecepDueno(data)
        showNotice(`Dueño "${data.fullName}" registrado con éxito`)
        if (result.clientId) {
          setSelectedId(result.clientId)
        }
      }
      setIsModalOpen(false)
      setEditingOwner(null)
      await loadDirectory()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el dueño'
      showNotice(msg)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  const handleGoToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  return {
    directory,
    filteredItems: paginatedItems,
    selectedDetail,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isLoading,
    isSubmitting,
    isModalOpen,
    editingOwner,
    error,
    notice,
    currentPage,
    totalPages,
    pageStart,
    pageEnd,
    totalCount,
    reloadDirectory: loadDirectory,
    handleSelect,
    handleCloseDetail,
    handleNewOwner: openCreateOwner,
    openCreateOwner,
    openEditOwner,
    closeModal,
    handleSaveOwner,
    handlePrevPage,
    handleNextPage,
    handleGoToPage,
  }
}

