import { useState, useMemo, useEffect, useCallback } from 'react'
import type {
  SuperAdminMascota,
  SuperAdminDueno,
  MascotaFormData,
  DuenoFormData,
  MascotaFilters,
  DuenoFilters,
} from '../types'
import {
  fetchClients,
  fetchPets,
  fetchClientsPets,
  createPet,
  updatePet,
  deletePet,
  createClientPet,
  deleteClientPet,
  createClient,
  createOwnerWithoutLogin,
  updateClient,
  deleteClient,
  fetchUsers,
  updateUser,
  activateUser,
  deactivateUser,
  fetchRoles,
  fetchSpecies,
  fetchRaces,
} from '../services'
import {
  mapClientToDueno,
  mapPetToMascota,
  findSpeciesId,
  findRaceId,
  filterRacesBySpecies,
  parseAgeToInt,
  parseWeightToDecimal,
  mapSexoToGender,
} from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'

export function useMascotasSuperAdmin() {
  const [activeTab, setActiveTab] = useState<'mascotas' | 'duenos'>('mascotas')
  const [mascotas, setMascotas] = useState<SuperAdminMascota[]>([])
  const [duenos, setDuenos] = useState<SuperAdminDueno[]>([])
  // Catálogos de especies/razas desde la API (para filtros y formularios)
  const [speciesOptions, setSpeciesOptions] = useState<{ id: string; name: string }[]>([])
  const [raceOptions, setRaceOptions] = useState<{ id: string; name: string; speciesId: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
  const itemsPerPage = 5

  const [isMascotaModalOpen, setIsMascotaModalOpen] = useState(false)
  const [editingMascota, setEditingMascota] = useState<SuperAdminMascota | null>(null)
  const [isDuenoModalOpen, setIsDuenoModalOpen] = useState(false)
  const [editingDueno, setEditingDueno] = useState<SuperAdminDueno | null>(null)
  const [detailItem, setDetailItem] = useState<{
    type: 'mascota' | 'dueno'
    data: SuperAdminMascota | SuperAdminDueno
  } | null>(null)

  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((curr) => (curr === message ? null : curr))
    }, 3000)
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const [clients, users, pets, clientsPets, species, races, roles] = await Promise.all([
        fetchClients(),
        fetchUsers(),
        fetchPets(),
        fetchClientsPets(),
        fetchSpecies(),
        fetchRaces(),
        fetchRoles(),
      ])

      // Auto-sincronizar usuarios creados con rol Cliente que aún no tengan registro en Clients
      const clientRoles = roles.filter((r) => {
        const n = r.name.toLowerCase()
        return n.includes('client') || n.includes('cliente') || n.includes('dueño') || n.includes('dueno')
      })
      const clientRoleIds = new Set(clientRoles.map((r) => r.id.toLowerCase()))
      const existingClientUserIds = new Set(clients.map((c) => c.userId.toLowerCase()))
      const unlinkedClientUsers = users.filter(
        (u) => u.roleId && clientRoleIds.has(u.roleId.toLowerCase()) && !existingClientUserIds.has(u.id.toLowerCase()),
      )

      if (unlinkedClientUsers.length > 0) {
        for (const u of unlinkedClientUsers) {
          try {
            // El backend exige phoneNumber (7-20 dígitos) en /api/Clients; sin este
            // placeholder la creación fallaba con 500 y el usuario quedaba sin
            // vincular en silencio (nunca aparecía como dueño disponible).
            const createdClient = await createClient({
              userId: u.id,
              identificationNumber: 'DOC-PENDIENTE',
              phoneNumber: '0000000000',
            })
            clients.push({
              id: createdClient.id,
              userId: u.id,
              identificationNumber: 'DOC-PENDIENTE',
              phoneNumber: '0000000000',
              address: '',
              registrationDate: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            })
          } catch (err) {
            console.error('Error auto-sincronizando perfil de cliente:', err)
          }
        }
      }

      // Normaliza GUIDs: Oracle/JSON a veces cambia mayúsculas y rompe el Map
      const normId = (id: string) => id.toLowerCase()
      const usersById = new Map(users.map((u) => [normId(u.id), u]))
      const speciesById = new Map(species.map((s) => [normId(s.id), s.name]))
      const racesById = new Map(races.map((r) => [normId(r.id), r.name]))
      const petsById = new Map(pets.map((p) => [normId(p.id), p]))
      setSpeciesOptions(species.map((s) => ({ id: s.id, name: s.name })))
      setRaceOptions(races.map((r) => ({ id: r.id, name: r.name, speciesId: r.speciesId })))

      const duenosMapped = clients.map((client) => {
        const user = usersById.get(normId(client.userId))
        const petLinks = clientsPets.filter((cp) => normId(cp.clientId) === normId(client.id))
        const summary = petLinks
          .map((link) => {
            const pet = petsById.get(normId(link.petId))
            if (!pet) return null
            const speciesName = speciesById.get(normId(pet.speciesId)) ?? ''
            return `${pet.name} (${mapPetToMascota({ pet, speciesName }).species})`
          })
          .filter((s): s is string => Boolean(s))
        return mapClientToDueno(client, user, summary)
      })

      const duenosById = new Map(duenosMapped.map((d) => [normId(d.id), d]))
      // Si hay varios dueños, prioriza el principal
      const clientPetByPetId = new Map<string, (typeof clientsPets)[number]>()
      for (const cp of clientsPets) {
        const key = normId(cp.petId)
        const prev = clientPetByPetId.get(key)
        if (!prev || (cp.isPrimaryOwner && !prev.isPrimaryOwner)) {
          clientPetByPetId.set(key, cp)
        }
      }

      const mascotasMapped = pets.map((pet) => {
        const clientPet = clientPetByPetId.get(normId(pet.id))
        const owner = clientPet ? duenosById.get(normId(clientPet.clientId)) : undefined
        return mapPetToMascota({
          pet,
          clientPet,
          owner,
          speciesName: speciesById.get(normId(pet.speciesId)),
          raceName: racesById.get(normId(pet.raceId)),
        })
      })

      setDuenos(duenosMapped)
      setMascotas(mascotasMapped)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message === 'Unexpected error'
            ? 'Error del servidor al cargar mascotas. Revisa que el API esté al día (columna PHOTO_URL) y recarga.'
            : err.message
          : 'No se pudieron cargar mascotas y dueños.'
      setLoadError(message)
      showToast(message)
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

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
    try {
      const [species, races] = await Promise.all([fetchSpecies(), fetchRaces()])
      const speciesId = findSpeciesId(data.species, species)
      // Solo razas de esa especie (evita Golden con Conejo)
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
    try {
      const current = mascotas.find((m) => m.id === id)
      const [species, races] = await Promise.all([fetchSpecies(), fetchRaces()])
      const speciesId = findSpeciesId(data.species, species)
      const racesForSpecies = filterRacesBySpecies(data.species, races, species)
      if (racesForSpecies.length === 0) {
        showToast('No hay razas registradas para esa especie.')
        return
      }
      const raceId = findRaceId(data.breed, racesForSpecies)

      // PUT /api/Pets/{id}
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

      // Sincroniza vínculo ClientsPets (el PUT de ClientsPets no cambia clientId)
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
      await createOwnerWithoutLogin({
        name: data.name.trim(),
        identificationNumber: data.documentId.trim(),
        phoneNumber: data.phone.trim(),
        email: data.email.trim(),
        address: data.address?.trim() || null,
      })

      setIsDuenoModalOpen(false)
      showToast(`Dueño "${data.name}" registrado con éxito`)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo registrar el dueño.'
      showToast(message)
    }
  }

  const updateDueno = async (id: string, data: DuenoFormData) => {
    try {
      const client = await fetchClients().then((list) => list.find((c) => c.id === id))
      if (!client) {
        showToast('Dueño no encontrado.')
        return
      }

      const roles = await fetchRoles()
      const clientRole = roles.find((r) => {
        const n = r.name.toLowerCase()
        return n.includes('client') || n.includes('cliente')
      })

      await updateClient(id, {
        userId: client.userId,
        identificationNumber: data.documentId.trim(),
        phoneNumber: data.phone.trim(),
        address: data.address.trim() || null,
        registrationDate: client.registrationDate,
      })

      if (clientRole) {
        await updateUser(client.userId, {
          fullName: data.name.trim(),
          email: data.email.trim(),
          roleId: clientRole.id,
        })
      }

      setIsDuenoModalOpen(false)
      setEditingDueno(null)
      showToast(`Dueño "${data.name}" actualizado con éxito`)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo actualizar el dueño.'
      showToast(message)
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

      if (item.status === 'Activo') {
        await deactivateUser(client.userId)
      } else {
        await activateUser(client.userId)
      }

      showToast(`Dueño "${item.name}" ${item.status === 'Activo' ? 'desactivado' : 'activado'} con éxito`)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo actualizar el estado del dueño.'
      showToast(message)
    }
  }

  const openCreateMascota = () => {
    setEditingMascota(null)
    setIsMascotaModalOpen(true)
  }

  const openEditMascota = (m: SuperAdminMascota) => {
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
    isLoading,
    loadError,
    reload: loadData,
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
