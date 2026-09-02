import { useState, useMemo, useEffect, useCallback } from 'react'
import type {
  SuperAdminMascota,
  SuperAdminDueno,
  MascotaFormData,
  DuenoFormData,
  MascotaFilters,
  DuenoFilters,
  EstadoMascota,
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
  updateClient,
  deleteClient,
  fetchUsers,
  createFullUser,
  updateUser,
  fetchRoles,
  fetchSpecies,
  fetchRaces,
} from '../services'
import {
  mapClientToDueno,
  mapPetToMascota,
  findSpeciesId,
  findRaceId,
  parseAgeToInt,
  parseWeightToDecimal,
  mapSexoToGender,
} from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'

export function useMascotasSuperAdmin() {
  const [activeTab, setActiveTab] = useState<'mascotas' | 'duenos'>('mascotas')
  const [mascotas, setMascotas] = useState<SuperAdminMascota[]>([])
  const [duenos, setDuenos] = useState<SuperAdminDueno[]>([])
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
      const [clients, users, pets, clientsPets, species, races] = await Promise.all([
        fetchClients(),
        fetchUsers(),
        fetchPets(),
        fetchClientsPets(),
        fetchSpecies(),
        fetchRaces(),
      ])

      const usersById = new Map(users.map((u) => [u.id, u]))
      const speciesById = new Map(species.map((s) => [s.id, s.name]))
      const racesById = new Map(races.map((r) => [r.id, r.name]))

      const duenosMapped = clients.map((client) => {
        const user = usersById.get(client.userId)
        const petLinks = clientsPets.filter((cp) => cp.clientId === client.id)
        const summary = petLinks
          .map((link) => {
            const pet = pets.find((p) => p.id === link.petId)
            if (!pet) return null
            const speciesName = speciesById.get(pet.speciesId) ?? ''
            return `${pet.name} (${mapPetToMascota({ pet, speciesName }).species})`
          })
          .filter((s): s is string => Boolean(s))
        return mapClientToDueno(client, user, summary)
      })

      const duenosById = new Map(duenosMapped.map((d) => [d.id, d]))
      const clientPetByPetId = new Map(clientsPets.map((cp) => [cp.petId, cp]))

      const mascotasMapped = pets.map((pet) => {
        const clientPet = clientPetByPetId.get(pet.id)
        const owner = clientPet ? duenosById.get(clientPet.clientId) : undefined
        return mapPetToMascota({
          pet,
          clientPet,
          owner,
          speciesName: speciesById.get(pet.speciesId),
          raceName: racesById.get(pet.raceId),
        })
      })

      setDuenos(duenosMapped)
      setMascotas(mascotasMapped)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudieron cargar mascotas y dueños.'
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
      const raceId = findRaceId(data.breed, races)

      const created = await createPet({
        name: data.name.trim(),
        age: parseAgeToInt(data.age),
        gender: mapSexoToGender(data.sex),
        weight: parseWeightToDecimal(data.weight),
        observations: data.notes?.trim() || null,
        speciesId,
        raceId,
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
      const [species, races] = await Promise.all([fetchSpecies(), fetchRaces()])
      const speciesId = findSpeciesId(data.species, species)
      const raceId = findRaceId(data.breed, races)

      await updatePet(id, {
        name: data.name.trim(),
        age: parseAgeToInt(data.age),
        gender: mapSexoToGender(data.sex),
        weight: parseWeightToDecimal(data.weight),
        observations: data.notes?.trim() || null,
        speciesId,
        raceId,
      })

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

  const toggleMascotaStatus = (id: string) => {
    const item = mascotas.find((m) => m.id === id)
    showToast(`El estado de "${item?.name ?? 'mascota'}" se gestiona desde el backend.`)
  }

  const createDueno = async (data: DuenoFormData) => {
    try {
      const roles = await fetchRoles()
      const clientRole = roles.find((r) => {
        const n = r.name.toLowerCase()
        return n.includes('client') || n.includes('cliente')
      })
      if (!clientRole) {
        showToast('No se encontró el rol de cliente en el sistema.')
        return
      }

      const tempPassword = `Tmp${Date.now().toString(36)}!`
      const { userId } = await createFullUser({
        fullName: data.name.trim(),
        email: data.email.trim(),
        password: tempPassword,
        roleId: clientRole.id,
      })

      await createClient({
        userId,
        identificationNumber: data.documentId.trim(),
        address: data.address.trim() || null,
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

  const toggleDuenoStatus = (id: string) => {
    const item = duenos.find((d) => d.id === id)
    const newStatus: EstadoMascota = item?.status === 'Activo' ? 'Inactivo' : 'Activo'
    showToast(`Activa o desactiva a "${item?.name ?? 'dueño'}" desde el módulo de usuarios (${newStatus}).`)
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
    toggleMascotaStatus,
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
