import { useEffect, useMemo, useState, useCallback } from 'react'
import { fetchMyModulePermissions, type MyPermissionsMap } from '@/modules/auth'
import type {
  RecepMascotaDetail,
  RecepMascotaFormData,
  RecepMascotaRawFields,
  RecepMascotasDirectoryPayload,
} from '../types'
import {
  fetchRecepMascotasDirectory,
  createRecepPetWithClient,
  updateRecepPet,
  fetchRecepMascotaFormCatalogs,
} from '../services'
import type { RecepMascotaCatalogOption, RecepMascotaOwnerOption } from '../components/RecepMascotaModal'
import { mapRecepUiGenderToApi } from '../utils/recepPetMapping'
import { createRecepPermissionHelpers } from '../utils/recepModulePermissions'

const ITEMS_PER_PAGE = 8

export function useRecepMascotas(enabled: boolean) {
  const [directory, setDirectory] = useState<RecepMascotasDirectoryPayload | null>(null)
  const [modulePermissions, setModulePermissions] =
    useState<MyPermissionsMap | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Estado del modal de nueva/editar mascota y sus catálogos
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false)
  const [speciesList, setSpeciesList] = useState<RecepMascotaCatalogOption[]>([])
  const [racesList, setRacesList] = useState<RecepMascotaCatalogOption[]>([])
  const [duenosList, setDuenosList] = useState<RecepMascotaOwnerOption[]>([])
  const [editingPet, setEditingPet] = useState<RecepMascotaRawFields | null>(null)

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

  const canCreate = permissionHelpers.canCreateModule('mascotas')
  const canEdit = permissionHelpers.canEditModule('mascotas')
  const canDelete = permissionHelpers.canDeleteModule('mascotas')

  const loadPermissions = useCallback(async () => {
    try {
      const permissions = await fetchMyModulePermissions()
      setModulePermissions(permissions)
    } catch {
      setModulePermissions({})
    }
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
    void loadPermissions()
  }, [enabled, loadDirectory, loadPermissions])

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

  const loadFormCatalogs = async () => {
    setIsLoadingCatalogs(true)
    try {
      const catalogs = await fetchRecepMascotaFormCatalogs()
      setSpeciesList(catalogs.species.map((s) => ({ id: s.id, name: s.name })))
      setRacesList(catalogs.races.map((r) => ({ id: r.id, name: r.name, speciesId: r.speciesId })))
      setDuenosList(catalogs.duenos)
    } catch (err) {
      console.error('Error cargando catálogos del formulario de mascota:', err)
    } finally {
      setIsLoadingCatalogs(false)
    }
  }

  const openCreatePet = async () => {
    if (!canCreate) {
      showNotice('No tienes permiso para crear mascotas.')
      return
    }
    setEditingPet(null)
    setIsModalOpen(true)
    await loadFormCatalogs()
  }

  const openEditPet = async (petId: string) => {
    if (!canEdit) {
      showNotice('No tienes permiso para editar mascotas.')
      return
    }
    const raw = directory?.rawById[petId]
    if (!raw) {
      showNotice('No se encontró la mascota a editar.')
      return
    }
    setEditingPet(raw)
    setIsModalOpen(true)
    await loadFormCatalogs()
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPet(null)
  }

  const handleSavePet = async (data: RecepMascotaFormData) => {
    if (editingPet && !canEdit) {
      showNotice('No tienes permiso para editar mascotas.')
      throw new Error('No tienes permiso para editar mascotas.')
    }
    if (!editingPet && !canCreate) {
      showNotice('No tienes permiso para crear mascotas.')
      throw new Error('No tienes permiso para crear mascotas.')
    }

    setIsSubmitting(true)
    try {
      if (editingPet) {
        await updateRecepPet(editingPet.id, {
          name: data.name,
          speciesId: data.speciesId,
          raceId: data.raceId,
          age: data.age,
          gender: mapRecepUiGenderToApi(data.gender),
          weight: data.weight,
          observations: data.observations,
          photoUrl: null,
        })
        showNotice(`Mascota "${data.name}" actualizada con éxito`)
      } else {
        const result = await createRecepPetWithClient(data)
        showNotice(`Mascota "${data.name}" registrada con éxito`)
        if (result.id) {
          setSelectedId(result.id)
        }
      }
      setIsModalOpen(false)
      setEditingPet(null)
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
    editingPet,
    error,
    notice,
    canCreate,
    canEdit,
    canDelete,
    reloadDirectory: loadDirectory,
    handleSelect,
    handleCloseDetail,
    handleOpenFilters,
    handleNewPet: openCreatePet,
    openCreatePet,
    openEditPet,
    closeModal,
    handleSavePet,
    handlePrevPage,
    handleNextPage,
  }
}

