import { useEffect, useMemo, useState } from 'react'
import type {
  HistoriaClinicaPayload,
  MascotaDetail,
  MascotasDirectoryPayload,
} from '../types'
import { fetchHistoriaClinica, fetchVetMascotasDirectory } from '../services'

export function useVetMascotas(enabled: boolean) {
  const [directory, setDirectory] = useState<MascotasDirectoryPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')
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
        if (!cancelled) setDirectory(data)
      } catch {
        if (!cancelled) setError('No se pudo cargar el directorio de mascotas')
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
        pet.ownerName.toLowerCase().includes(query)
      return matchesSpecies && matchesQuery
    })
  }, [directory, search, speciesFilter])

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

  const handleOpenFilters = () => showNotice('Filtros avanzados: módulo pendiente')

  // Abre el modal centrado con la historia clínica de la mascota seleccionada
  const handleViewClinicalHistory = async () => {
    if (!selectedId) return

    setIsHistoriaLoading(true)
    try {
      const data = await fetchHistoriaClinica(selectedId)
      if (!data) {
        showNotice('No hay historia clínica para esta mascota')
        return
      }
      setHistoria(data)
      setIsHistoriaOpen(true)
    } catch {
      showNotice('No se pudo cargar la historia clínica')
    } finally {
      setIsHistoriaLoading(false)
    }
  }

  const handleCloseHistoria = () => {
    setIsHistoriaOpen(false)
  }

  const handlePrevPage = () => showNotice('Paginación: pendiente de API')
  const handleNextPage = () => showNotice('Paginación: pendiente de API')

  return {
    directory,
    filteredItems,
    selectedDetail,
    search,
    setSearch,
    speciesFilter,
    setSpeciesFilter,
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
