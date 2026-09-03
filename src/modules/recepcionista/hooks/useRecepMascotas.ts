import { useEffect, useMemo, useState, useCallback } from 'react'
import type { RecepMascotaDetail, RecepMascotasDirectoryPayload } from '../types'
import { fetchRecepMascotasDirectory } from '../services'

const ITEMS_PER_PAGE = 8

export function useRecepMascotas(enabled: boolean) {
  const [directory, setDirectory] = useState<RecepMascotasDirectoryPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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
  const handleNewPet = () => showNotice('Para registrar mascotas nuevas, utiliza la sección de Mascotas del SuperAdmin o asóciala al agendar una cita.')
  
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
    error,
    notice,
    reloadDirectory: loadDirectory,
    handleSelect,
    handleCloseDetail,
    handleOpenFilters,
    handleNewPet,
    handlePrevPage,
    handleNextPage,
    handleViewClinicalHistory,
  }
}
