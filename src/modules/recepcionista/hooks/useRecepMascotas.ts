import { useEffect, useMemo, useState, useCallback } from 'react'
import type { RecepMascotaDetail, RecepMascotaFormData, RecepMascotasDirectoryPayload } from '../types'
import {
  fetchRecepMascotasDirectory,
  createRecepPetWithClient,
  fetchRecepMascotaFormCatalogs,
} from '../services'
import type { RecepMascotaCatalogOption, RecepMascotaOwnerOption } from '../components/RecepMascotaModal'

const ITEMS_PER_PAGE = 8

export function useRecepMascotas(enabled: boolean) {
  const [directory, setDirectory] = useState<RecepMascotasDirectoryPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Estado del modal de nueva mascota y sus catálogos
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false)
  const [speciesList, setSpeciesList] = useState<RecepMascotaCatalogOption[]>([])
  const [racesList, setRacesList] = useState<RecepMascotaCatalogOption[]>([])
  const [duenosList, setDuenosList] = useState<RecepMascotaOwnerOption[]>([])

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

  const openCreatePet = async () => {
    setIsModalOpen(true)
    setIsLoadingCatalogs(true)
    try {
      const catalogs = await fetchRecepMascotaFormCatalogs()
      setSpeciesList(catalogs.species.map((s) => ({ id: s.id, name: s.name })))
      setRacesList(catalogs.races.map((r) => ({ id: r.id, name: r.name, speciesId: r.speciesId })))
      setDuenosList(catalogs.duenos)
    } catch (err) {
      console.error('Error cargando catálogos para nueva mascota:', err)
    } finally {
      setIsLoadingCatalogs(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleSavePet = async (data: RecepMascotaFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createRecepPetWithClient(data)
      showNotice(`Mascota "${data.name}" registrada con éxito`)
      if (result.id) {
        setSelectedId(result.id)
      }
      setIsModalOpen(false)
      await loadDirectory()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la mascota'
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
    isSubmitting: isSubmitting || isLoadingCatalogs,
    isModalOpen,
    speciesList,
    racesList,
    duenosList,
    error,
    notice,
    reloadDirectory: loadDirectory,
    handleSelect,
    handleCloseDetail,
    handleOpenFilters,
    handleNewPet: openCreatePet,
    openCreatePet,
    closeModal,
    handleSavePet,
    handlePrevPage,
    handleNextPage,
    handleViewClinicalHistory,
  }
}

