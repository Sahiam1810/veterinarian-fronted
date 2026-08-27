import { useEffect, useMemo, useState } from 'react'
import type { RecepMascotaDetail, RecepMascotasDirectoryPayload } from '../types'
import { fetchRecepMascotasDirectory } from '../services'

export function useRecepMascotas(enabled: boolean) {
  const [directory, setDirectory] = useState<RecepMascotasDirectoryPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function loadDirectory() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchRecepMascotasDirectory()
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
    if (!enabled) setSelectedId(null)
  }, [enabled])

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

  const selectedDetail: RecepMascotaDetail | null =
    directory && selectedId ? directory.detailsById[selectedId] ?? null : null

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => {
      setNotice((current) => (current === message ? null : current))
    }, 2800)
  }

  const handleSelect = (petId: string) => setSelectedId(petId)
  const handleCloseDetail = () => setSelectedId(null)
  const handleOpenFilters = () => showNotice('Filtros avanzados: módulo pendiente')
  const handleNewPet = () => showNotice('Nueva mascota: módulo pendiente')
  const handlePrevPage = () => showNotice('Paginación: pendiente de API')
  const handleNextPage = () => showNotice('Paginación: pendiente de API')
  const handleViewClinicalHistory = () =>
    showNotice('Historia clínica: módulo pendiente')

  return {
    directory,
    filteredItems,
    selectedDetail,
    search,
    setSearch,
    isLoading,
    error,
    notice,
    handleSelect,
    handleCloseDetail,
    handleOpenFilters,
    handleNewPet,
    handlePrevPage,
    handleNextPage,
    handleViewClinicalHistory,
  }
}
