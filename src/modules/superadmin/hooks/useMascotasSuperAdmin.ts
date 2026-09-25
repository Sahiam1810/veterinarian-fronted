import { useState, useMemo, useEffect, useCallback } from 'react'
import type {
  SuperAdminMascota,
  SuperAdminDueno,
  MascotaFormData,
  DuenoFormData,
  MascotaFilters,
  DuenoFilters,
  MascotaDuenoDetailItem,
} from '../types/mascotasSuperAdmin.types.ts'
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
} from '../services/superAdminClientsService.ts'
import {
  fetchPets,
  createPet,
  updatePet,
  deletePet,
} from '../services/superAdminPetsService.ts'
import {
  fetchClientsPets,
  createClientPet,
  deleteClientPet,
} from '../services/superAdminClientsPetsService.ts'
import {
  fetchSpecies,
  fetchRaces,
} from '../services/superAdminCatalogService.ts'
import {
  mapClientToDueno,
  findSpeciesId,
  findRaceId,
  filterRacesBySpecies,
  parseAgeToInt,
  parseWeightToDecimal,
  mapSexoToGender,
} from '../utils/superAdminApiMappers.ts'
import { ApiError } from '../../../services/apiClient.ts'
import { extractUserApiErrorMessage } from '../utils/translateUserApiError.ts'
import {
  applyMascotasSettledResults,
  assertMascotaFormCatalogsOpen,
  assertMascotaSubmitCatalogs,
  resolveCatalogResourceError,
  statusFromListResult,
  type CatalogResourceStatus,
  type MascotasLoadBundle,
} from './mascotasLoadHelpers.ts'

export type {
  CatalogResourceStatus,
  MascotasCatalogResource,
  MascotasLoadBundle,
} from './mascotasLoadHelpers.ts'

export {
  applyMascotasSettledResults,
  applyOwnersRetryPreserveCatalogs,
  assertMascotaFormCatalogsOpen,
  assertMascotaSubmitCatalogs,
  getRacesUnavailableMessage,
  getSpeciesSelectPlaceholder,
  resolveCatalogResourceError,
  statusFromListResult,
} from './mascotasLoadHelpers.ts'

/** Carga inicial: allSettled + apply independiente. */
export async function fetchMascotasLoadBundle(): Promise<MascotasLoadBundle> {
  const [clientsResult, petsResult, clientsPetsResult, speciesResult, racesResult] =
    await Promise.allSettled([
      fetchClients(),
      fetchPets(),
      fetchClientsPets(),
      fetchSpecies(),
      fetchRaces(),
    ])

  return applyMascotasSettledResults(
    clientsResult,
    petsResult,
    clientsPetsResult,
    speciesResult,
    racesResult,
  )
}

/** Reintento exclusivo de dueños: no toca species/races. */
export async function fetchOwnersRetryResult(): Promise<{
  status: Exclude<CatalogResourceStatus, 'loading'>
  error: string | null
  duenos: SuperAdminDueno[]
}> {
  try {
    const clients = await fetchClients()
    const settled = statusFromListResult(
      { status: 'fulfilled', value: clients },
      'owners',
    )
    return {
      status: settled.status,
      error: settled.error,
      duenos: settled.items.map((c) => mapClientToDueno(c, [])),
    }
  } catch (err) {
    return {
      status: 'error',
      error: resolveCatalogResourceError('owners', err),
      duenos: [],
    }
  }
}

/** Reintento exclusivo de especies. */
export async function fetchSpeciesRetryResult(): Promise<{
  status: Exclude<CatalogResourceStatus, 'loading'>
  error: string | null
  options: { id: string; name: string }[]
}> {
  try {
    const species = await fetchSpecies()
    const settled = statusFromListResult(
      { status: 'fulfilled', value: species },
      'species',
    )
    return {
      status: settled.status,
      error: settled.error,
      options: settled.items.map((s) => ({ id: s.id, name: s.name })),
    }
  } catch (err) {
    return {
      status: 'error',
      error: resolveCatalogResourceError('species', err),
      options: [],
    }
  }
}

/** Reintento exclusivo de razas. */
export async function fetchRacesRetryResult(): Promise<{
  status: Exclude<CatalogResourceStatus, 'loading'>
  error: string | null
  options: { id: string; name: string; speciesId: string }[]
}> {
  try {
    const races = await fetchRaces()
    const settled = statusFromListResult(
      { status: 'fulfilled', value: races },
      'races',
    )
    return {
      status: settled.status,
      error: settled.error,
      options: settled.items.map((r) => ({
        id: r.id,
        name: r.name,
        speciesId: r.speciesId,
      })),
    }
  } catch (err) {
    return {
      status: 'error',
      error: resolveCatalogResourceError('races', err),
      options: [],
    }
  }
}

export function useMascotasSuperAdmin() {
  const [activeTab, setActiveTab] = useState<'mascotas' | 'duenos'>('mascotas')
  const [mascotas, setMascotas] = useState<SuperAdminMascota[]>([])
  const [duenos, setDuenos] = useState<SuperAdminDueno[]>([])
  const [speciesOptions, setSpeciesOptions] = useState<{ id: string; name: string }[]>([])
  const [raceOptions, setRaceOptions] = useState<{ id: string; name: string; speciesId: string }[]>([])
  const [speciesStatus, setSpeciesStatus] = useState<CatalogResourceStatus>('loading')
  const [speciesError, setSpeciesError] = useState<string | null>(null)
  const [racesStatus, setRacesStatus] = useState<CatalogResourceStatus>('loading')
  const [racesError, setRacesError] = useState<string | null>(null)
  const [ownersStatus, setOwnersStatus] = useState<CatalogResourceStatus>('loading')
  const [ownersError, setOwnersError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Compat: DuenosPage (y consumidores) leen loadError como fallo de dueños
  const [loadError, setLoadError] = useState<string | null>(null)

  const [mascotaFilters, setMascotaFilters] = useState<MascotaFilters>({
    searchQuery: '',
    speciesFilter: 'all',
    statusFilter: 'all',
  })

  const [duenoFilters, setDuenoFilters] = useState<DuenoFilters>({
    searchQuery: '',
    statusFilter: 'all',
  })

  const [mascotaPage, setMascotaPage] = useState(1)
  const [duenoPage, setDuenoPage] = useState(1)
  const itemsPerPage = 10

  const [isMascotaModalOpen, setIsMascotaModalOpen] = useState(false)
  const [editingMascota, setEditingMascota] = useState<SuperAdminMascota | null>(null)
  const [isDuenoModalOpen, setIsDuenoModalOpen] = useState(false)
  const [editingDueno, setEditingDueno] = useState<SuperAdminDueno | null>(null)
  const [detailItem, setDetailItem] = useState<MascotaDuenoDetailItem | null>(null)

  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((curr) => (curr === message ? null : curr))
    }, 3000)
  }, [])

  const applyBundle = useCallback((bundle: MascotasLoadBundle) => {
    // Species/Races: en error no borrar opciones ya ready (evita falso vacío en reload)
    setSpeciesStatus(bundle.speciesStatus)
    setSpeciesError(bundle.speciesError)
    if (bundle.speciesStatus !== 'error') {
      setSpeciesOptions(bundle.speciesOptions)
    }
    setRacesStatus(bundle.racesStatus)
    setRacesError(bundle.racesError)
    if (bundle.racesStatus !== 'error') {
      setRaceOptions(bundle.raceOptions)
    }
    setOwnersStatus(bundle.ownersStatus)
    setOwnersError(bundle.ownersError)
    setDuenos(bundle.duenos)
    setMascotas(bundle.mascotas)
    setLoadError(bundle.ownersError)
    if (bundle.petsError) showToast(bundle.petsError)
    if (bundle.clientsPetsError) showToast(bundle.clientsPetsError)
  }, [showToast])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const bundle = await fetchMascotasLoadBundle()
      applyBundle(bundle)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message === 'Unexpected error'
            ? 'Error del servidor al cargar mascotas. Revisa que el API esté al día (columna PHOTO_URL) y recarga.'
            : err.message
          : 'No se pudieron cargar mascotas y dueños.'
      setLoadError(message)
      setOwnersError(message)
      setOwnersStatus('error')
      showToast(message)
    } finally {
      setIsLoading(false)
    }
  }, [applyBundle, showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const retryOwners = useCallback(async () => {
    setOwnersStatus('loading')
    setOwnersError(null)
    const result = await fetchOwnersRetryResult()
    setOwnersStatus(result.status)
    setOwnersError(result.error)
    setLoadError(result.error)
    setDuenos(result.duenos)
    // Species/Races no se tocan
  }, [])

  const retrySpecies = useCallback(async () => {
    setSpeciesStatus('loading')
    setSpeciesError(null)
    const result = await fetchSpeciesRetryResult()
    setSpeciesStatus(result.status)
    setSpeciesError(result.error)
    if (result.status !== 'error') {
      setSpeciesOptions(result.options)
    }
  }, [])

  const retryRaces = useCallback(async () => {
    setRacesStatus('loading')
    setRacesError(null)
    const result = await fetchRacesRetryResult()
    setRacesStatus(result.status)
    setRacesError(result.error)
    if (result.status !== 'error') {
      setRaceOptions(result.options)
    }
  }, [])

  const filteredMascotas = useMemo(() => {
    return mascotas.filter((m) => {
      const q = mascotaFilters.searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.breed.toLowerCase().includes(q) ||
        m.species.toLowerCase().includes(q) ||
        m.ownerName.toLowerCase().includes(q) ||
        m.ownerPhone.toLowerCase().includes(q)

      const matchesSpecies =
        mascotaFilters.speciesFilter === 'all' ||
        m.species.toLowerCase() === mascotaFilters.speciesFilter.toLowerCase()

      const matchesStatus =
        mascotaFilters.statusFilter === 'all' || m.status === mascotaFilters.statusFilter

      return matchesSearch && matchesSpecies && matchesStatus
    })
  }, [mascotas, mascotaFilters])

  const filteredDuenos = useMemo(() => {
    return duenos.filter((d) => {
      const q = duenoFilters.searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.documentId.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q)

      const matchesStatus =
        duenoFilters.statusFilter === 'all' || d.status === duenoFilters.statusFilter

      return matchesSearch && matchesStatus
    })
  }, [duenos, duenoFilters])

  const totalMascotas = filteredMascotas.length
  const totalMascotaPages = Math.ceil(totalMascotas / itemsPerPage) || 1
  const paginatedMascotas = useMemo(() => {
    const start = (mascotaPage - 1) * itemsPerPage
    return filteredMascotas.slice(start, start + itemsPerPage)
  }, [filteredMascotas, mascotaPage, itemsPerPage])

  const totalDuenos = filteredDuenos.length
  const totalDuenoPages = Math.ceil(totalDuenos / itemsPerPage) || 1
  const paginatedDuenos = useMemo(() => {
    const start = (duenoPage - 1) * itemsPerPage
    return filteredDuenos.slice(start, start + itemsPerPage)
  }, [filteredDuenos, duenoPage, itemsPerPage])

  const createMascota = async (data: MascotaFormData) => {
    const guard = assertMascotaSubmitCatalogs(
      speciesStatus,
      racesStatus,
      ownersStatus,
      duenos.length,
    )
    if (!guard.ok) {
      showToast(guard.message)
      return
    }

    try {
      const [speciesResult, racesResult] = await Promise.allSettled([
        fetchSpecies(),
        fetchRaces(),
      ])
      if (speciesResult.status === 'rejected') {
        showToast(resolveCatalogResourceError('species', speciesResult.reason))
        return
      }
      if (racesResult.status === 'rejected') {
        showToast(resolveCatalogResourceError('races', racesResult.reason))
        return
      }
      const species = speciesResult.value
      const races = racesResult.value
      const speciesId = findSpeciesId(data.species, species)
      const racesForSpecies = filterRacesBySpecies(data.species, races, species)
      if (racesForSpecies.length === 0) {
        showToast('No hay razas registradas para esa especie.')
        return
      }
      const raceId = findRaceId(data.breed, racesForSpecies)

      const created = await createPet({
        name: data.name.trim(),
        age: parseAgeToInt(data.age),
        gender: mapSexoToGender(data.sex),
        weight: parseWeightToDecimal(data.weight),
        observations: data.notes?.trim() || null,
        speciesId,
        raceId,
        photoUrl: data.photoUrl?.trim() || null,
      })

      await createClientPet({
        clientId: data.ownerId,
        petId: created.id,
        isPrimaryOwner: true,
      })

      setIsMascotaModalOpen(false)
      showToast(`Mascota "${data.name}" registrada con éxito`)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo registrar la mascota.'
      showToast(message)
    }
  }

  const updateMascota = async (id: string, data: MascotaFormData) => {
    const guard = assertMascotaSubmitCatalogs(
      speciesStatus,
      racesStatus,
      ownersStatus,
      duenos.length,
    )
    if (!guard.ok) {
      showToast(guard.message)
      return
    }

    try {
      const current = mascotas.find((m) => m.id === id)
      const [speciesResult, racesResult] = await Promise.allSettled([
        fetchSpecies(),
        fetchRaces(),
      ])
      if (speciesResult.status === 'rejected') {
        showToast(resolveCatalogResourceError('species', speciesResult.reason))
        return
      }
      if (racesResult.status === 'rejected') {
        showToast(resolveCatalogResourceError('races', racesResult.reason))
        return
      }
      const species = speciesResult.value
      const races = racesResult.value
      const speciesId = findSpeciesId(data.species, species)
      const racesForSpecies = filterRacesBySpecies(data.species, races, species)
      if (racesForSpecies.length === 0) {
        showToast('No hay razas registradas para esa especie.')
        return
      }
      const raceId = findRaceId(data.breed, racesForSpecies)

      await updatePet(id, {
        name: data.name.trim(),
        age: parseAgeToInt(data.age),
        gender: mapSexoToGender(data.sex),
        weight: parseWeightToDecimal(data.weight),
        observations: data.notes?.trim() || null,
        speciesId,
        raceId,
        photoUrl: data.photoUrl?.trim() || null,
      })

      const ownerChanged =
        !current?.ownerId ||
        current.ownerId.toLowerCase() !== data.ownerId.toLowerCase()
      if (!current?.clientPetId) {
        await createClientPet({
          clientId: data.ownerId,
          petId: id,
          isPrimaryOwner: true,
        })
      } else if (ownerChanged) {
        await deleteClientPet(current.clientPetId)
        await createClientPet({
          clientId: data.ownerId,
          petId: id,
          isPrimaryOwner: true,
        })
      }

      setIsMascotaModalOpen(false)
      setEditingMascota(null)
      showToast(`Mascota "${data.name}" actualizada con éxito`)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo actualizar la mascota.'
      showToast(message)
    }
  }

  const deleteMascota = async (id: string) => {
    const item = mascotas.find((m) => m.id === id)
    try {
      if (item?.clientPetId) {
        await deleteClientPet(item.clientPetId)
      }
      await deletePet(id)
      showToast(`Mascota "${item?.name || ''}" eliminada`)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo eliminar la mascota.'
      showToast(message)
    }
  }

  const createDueno = async (data: DuenoFormData) => {
    try {
      await createClient({
        fullName: data.name.trim(),
        email: data.email.trim(),
        identificationNumber: data.documentId.trim(),
        phoneNumber: data.phone.trim(),
        address: data.address?.trim() || null,
      })

      setIsDuenoModalOpen(false)
      showToast(`Dueño "${data.name}" registrado con éxito`)
      await loadData()
    } catch (err) {
      showToast(extractUserApiErrorMessage(err))
    }
  }

  const updateDueno = async (id: string, data: DuenoFormData) => {
    try {
      const client = await fetchClients().then((list) => list.find((c) => c.id === id))
      if (!client) {
        showToast('Dueño no encontrado.')
        return
      }

      await updateClient(id, {
        fullName: data.name.trim(),
        email: data.email.trim(),
        identificationNumber: data.documentId.trim(),
        phoneNumber: data.phone.trim(),
        address: data.address.trim() || null,
        isActive: client.isActive,
      })

      setIsDuenoModalOpen(false)
      setEditingDueno(null)
      showToast(`Dueño "${data.name}" actualizado con éxito`)
      await loadData()
    } catch (err) {
      showToast(extractUserApiErrorMessage(err))
    }
  }

  const deleteDueno = async (id: string) => {
    const item = duenos.find((d) => d.id === id)
    try {
      await deleteClient(id)
      showToast(`Dueño "${item?.name || ''}" eliminado`)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo eliminar el dueño.'
      showToast(message)
    }
  }

  const toggleDuenoStatus = async (id: string) => {
    const item = duenos.find((d) => d.id === id)
    if (!item) return
    try {
      const client = await fetchClients().then((list) => list.find((c) => c.id === id))
      if (!client) {
        showToast('Dueño no encontrado.')
        return
      }

      await updateClient(id, {
        fullName: client.fullName,
        email: client.email,
        identificationNumber: client.identificationNumber,
        phoneNumber: client.phoneNumber?.trim() || '',
        address: client.address ?? null,
        isActive: !client.isActive,
      })

      showToast(`Dueño "${item.name}" ${item.status === 'Activo' ? 'desactivado' : 'activado'} con éxito`)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo actualizar el estado del dueño.'
      showToast(message)
    }
  }

  const openCreateMascota = () => {
    const guard = assertMascotaFormCatalogsOpen(speciesStatus, racesStatus)
    if (!guard.ok) {
      showToast(guard.message)
      return
    }
    setEditingMascota(null)
    setIsMascotaModalOpen(true)
  }

  const openEditMascota = (m: SuperAdminMascota) => {
    const guard = assertMascotaFormCatalogsOpen(speciesStatus, racesStatus)
    if (!guard.ok) {
      showToast(guard.message)
      return
    }
    setEditingMascota(m)
    setIsMascotaModalOpen(true)
  }

  const openCreateDueno = () => {
    setEditingDueno(null)
    setIsDuenoModalOpen(true)
  }

  const openEditDueno = (d: SuperAdminDueno) => {
    setEditingDueno(d)
    setIsDuenoModalOpen(true)
  }

  return {
    activeTab,
    setActiveTab,
    mascotas,
    duenos,
    speciesOptions,
    raceOptions,
    speciesStatus,
    speciesError,
    racesStatus,
    racesError,
    ownersStatus,
    ownersError,
    isLoading,
    loadError,
    reload: loadData,
    retryOwners,
    retrySpecies,
    retryRaces,
    filteredMascotas,
    filteredDuenos,
    paginatedMascotas,
    paginatedDuenos,
    mascotaPage,
    setMascotaPage,
    totalMascotaPages,
    totalMascotas,
    duenoPage,
    setDuenoPage,
    totalDuenoPages,
    totalDuenos,
    itemsPerPage,
    mascotaFilters,
    setMascotaFilters,
    duenoFilters,
    setDuenoFilters,
    isMascotaModalOpen,
    setIsMascotaModalOpen,
    editingMascota,
    isDuenoModalOpen,
    setIsDuenoModalOpen,
    editingDueno,
    detailItem,
    setDetailItem,
    createMascota,
    updateMascota,
    deleteMascota,
    openCreateMascota,
    openEditMascota,
    createDueno,
    updateDueno,
    deleteDueno,
    toggleDuenoStatus,
    openCreateDueno,
    openEditDueno,
    activeNotification,
    showToast,
  }
}
