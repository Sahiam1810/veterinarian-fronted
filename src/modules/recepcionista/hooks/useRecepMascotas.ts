import { useEffect, useMemo, useState, useCallback } from 'react'
import type { RecepMascotaDetail, RecepMascotasDirectoryPayload } from '../types'
import {
  fetchRecepMascotasDirectory,
  registerRecepPet,
  type RecepPetFormData,
} from '../services'

const ITEMS_PER_PAGE = 8

export function useRecepMascotas(enabled: boolean) {
  const [directory, setDirectory] = useState<RecepMascotasDirectoryPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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
      const data = await fetchRecepMascotasDirectory()
      setDirectory(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar el directorio de mascotas'
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

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const filteredItems = useMemo(() => {
    if (!directory) return []
    const query = search.trim().toLowerCase()

    return directory.items.filter((pet) => {
      if (!query) return true
      return (
        pet.name.toLowerCase().includes(query) ||
        pet.ownerName.toLowerCase().includes(query) ||
        pet.breed.toLowerCase().includes(query) ||
        pet.species.toLowerCase().includes(query)
      )
    })
  }, [directory, search])

  // Paginación calculada
  const totalCount = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))
  const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalCount)

  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredItems.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [filteredItems, currentPage])

  const selectedDetail: RecepMascotaDetail | null =
    directory && selectedId ? directory.detailsById[selectedId] ?? null : null

  const handleSelect = (petId: string) => setSelectedId(petId)
  const handleCloseDetail = () => setSelectedId(null)
  const handleOpenFilters = () => showNotice('Usa el buscador para filtrar rápidamente por nombre, dueño, raza o especie.')

  const openCreatePet = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const handleSavePet = async (data: RecepPetFormData) => {
    setIsSubmitting(true)
    try {
      await registerRecepPet(data)
      showNotice(`Mascota "${data.name}" registrada con éxito`)
      setIsModalOpen(false)
      await loadDirectory()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar la mascota'
      showNotice(msg)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewPet = openCreatePet
  
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  const handleViewClinicalHistory = () => {
    showNotice('La historia clínica detallada se gestiona desde el módulo veterinario.')
  }

  return {
    directory,
    filteredItems: paginatedItems,
    selectedDetail,
    search,
    setSearch,
    currentPage,
    totalPages,
    pageStart,
    pageEnd,
    totalCount,
    isLoading,
    isSubmitting,
    isModalOpen,
    error,
    notice,
    reloadDirectory: loadDirectory,
    handleSelect,
    handleCloseDetail,
    handleOpenFilters,
    openCreatePet,
    closeModal,
    handleSavePet,
    handleNewPet,
    handlePrevPage,
    handleNextPage,
    handleViewClinicalHistory,
  }
}
