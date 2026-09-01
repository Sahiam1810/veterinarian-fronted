import { useEffect, useMemo, useState } from 'react'
import type {
  HistoriaClinicaPayload,
  MascotaDetail,
  MascotasDirectoryPayload,
} from '../types'
import { fetchHistoriaClinica, fetchVetMascotasDirectory } from '../services'

const PAGE_SIZE = 8

export function useVetMascotas(enabled: boolean) {
  const [directory, setDirectory] = useState<MascotasDirectoryPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [historia, setHistoria] = useState<HistoriaClinicaPayload | null>(null)
  const [isHistoriaOpen, setIsHistoriaOpen] = useState(false)
  const [isHistoriaLoading, setIsHistoriaLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function loadDirectory() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchVetMascotasDirectory()
        if (!cancelled) {
          setDirectory(data)
          setPage(1)
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : 'No se pudo cargar el directorio de mascotas'
          setError(msg)
        }
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
    if (!enabled) {
      setSelectedId(null)
      setIsHistoriaOpen(false)
      setHistoria(null)
    }
  }, [enabled])

  const filteredItems = useMemo(() => {
    if (!directory) return []
    const query = search.trim().toLowerCase()

    return directory.items.filter((pet) => {
      const matchesSpecies = !speciesFilter || pet.species === speciesFilter
      const matchesQuery =
        !query ||
        pet.name.toLowerCase().includes(query) ||
        pet.ownerName.toLowerCase().includes(query) ||
        pet.breed.toLowerCase().includes(query)
      return matchesSpecies && matchesQuery
    })
  }, [directory, search, speciesFilter])

  useEffect(() => {
    setPage(1)
  }, [search, speciesFilter])

  const totalFiltered = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStartIndex = (safePage - 1) * PAGE_SIZE
  const pagedItems = filteredItems.slice(pageStartIndex, pageStartIndex + PAGE_SIZE)
  const pageStart = totalFiltered === 0 ? 0 : pageStartIndex + 1
  const pageEnd = Math.min(pageStartIndex + PAGE_SIZE, totalFiltered)

  const selectedDetail: MascotaDetail | null =
    directory && selectedId ? directory.detailsById[selectedId] ?? null : null

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 2800)
  }

  const handleSelect = (petId: string) => {
    setSelectedId(petId)
  }

  const handleCloseDetail = () => {
    setSelectedId(null)
  }

  const handleOpenFilters = () => {
    showNotice('Usa la búsqueda y el filtro de especie de la barra superior')
  }

  const handleViewClinicalHistory = async () => {
    if (!selectedId || !selectedDetail) return

    setIsHistoriaLoading(true)
    try {
      const data = await fetchHistoriaClinica(selectedId, selectedDetail)
      if (!data) {
        showNotice('No hay historia clínica para esta mascota')
        return
      }
      setHistoria(data)
      setIsHistoriaOpen(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar la historia clínica'
      showNotice(msg)
    } finally {
      setIsHistoriaLoading(false)
    }
  }

  const handleCloseHistoria = () => {
    setIsHistoriaOpen(false)
  }

  const handlePrevPage = () => {
    setPage((current) => Math.max(1, current - 1))
  }

  const handleNextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1))
  }

  return {
    directory,
    filteredItems: pagedItems,
    selectedDetail,
    search,
    setSearch,
    speciesFilter,
    setSpeciesFilter,
    pageStart,
    pageEnd,
    totalCount: totalFiltered,
    isLoading,
    error,
    notice,
    historia,
    isHistoriaOpen,
    isHistoriaLoading,
    handleSelect,
    handleCloseDetail,
    handleOpenFilters,
    handleViewClinicalHistory,
    handleCloseHistoria,
    handlePrevPage,
    handleNextPage,
  }
}
