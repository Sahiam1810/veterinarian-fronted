import { useState, useMemo } from 'react'
import type {
  AdminMascota,
  AdminDueno,
  MascotaFormData,
  DuenoFormData,
  MascotaFilters,
  DuenoFilters,
  EstadoMascota,
} from '../types'


const INITIAL_DUENOS: AdminDueno[] = [
  {
    id: 'due-1',
    name: 'Carlos Ruiz',
    documentId: 'CC 1098765432',
    email: 'carlos.ruiz@gmail.com',
    phone: '555-0192',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    status: 'Activo',
    registrationDate: '15 Ene 2023',
    mascotasSummary: ['Max (Canino)', 'Milo (Felino)'],
  },
  {
    id: 'due-2',
    name: 'Ana Gómez',
    documentId: 'CC 52431987',
    email: 'ana.gomez@hotmail.com',
    phone: '555-0321',
    address: 'Carrera 7 #89-12',
    city: 'Medellín',
    status: 'Activo',
    registrationDate: '10 Feb 2023',
    mascotasSummary: ['Luna (Felino)'],
  },
  {
    id: 'due-3',
    name: 'Miguel Paz',
    documentId: 'CC 79841235',
    email: 'miguel.paz@outlook.com',
    phone: '555-8843',
    address: 'Av. Siempre Viva 742',
    city: 'Cali',
    status: 'Inactivo',
    registrationDate: '05 Mar 2023',
    mascotasSummary: ['Lolo (Ave)'],
  },
  {
    id: 'due-4',
    name: 'Sofía Morales',
    documentId: 'CC 1023456789',
    email: 'sofia.morales@gmail.com',
    phone: '555-9012',
    address: 'Calle 50 #30-20',
    city: 'Barranquilla',
    status: 'Activo',
    registrationDate: '22 Abr 2023',
    mascotasSummary: ['Rocky (Canino)'],
  },
  {
    id: 'due-5',
    name: 'Elena Vargas',
    documentId: 'CC 34567890',
    email: 'elena.vargas@yahoo.com',
    phone: '555-7766',
    address: 'Transversal 22 #10-05',
    city: 'Bucaramanga',
    status: 'Activo',
    registrationDate: '18 May 2023',
    mascotasSummary: ['Bella (Canino)'],
  },
  {
    id: 'due-6',
    name: 'Valentina Cruz',
    documentId: 'CC 1009876543',
    email: 'valentina.cruz@gmail.com',
    phone: '555-2211',
    address: 'Calle 9 #15-40',
    city: 'Cartagena',
    status: 'Activo',
    registrationDate: '30 Jun 2023',
    mascotasSummary: ['Nemo (Exótico)'],
  },
  {
    id: 'due-7',
    name: 'Daniel Ortiz',
    documentId: 'CC 98765432',
    email: 'daniel.ortiz@gmail.com',
    phone: '555-6677',
    address: 'Carrera 15 #80-50',
    city: 'Pereira',
    status: 'Inactivo',
    registrationDate: '12 Jul 2023',
    mascotasSummary: ['Coco (Roedor)'],
  },
  {
    id: 'due-8',
    name: 'Andrés Mendoza',
    documentId: 'CC 1012345678',
    email: 'andres.mendoza@gmail.com',
    phone: '555-3322',
    address: 'Calle 85 #11-20',
    city: 'Bogotá',
    status: 'Activo',
    registrationDate: '01 Ago 2023',
    mascotasSummary: ['Thor (Canino)'],
  },
  {
    id: 'due-9',
    name: 'Camila Torres',
    documentId: 'CC 53123456',
    email: 'camila.torres@gmail.com',
    phone: '555-1199',
    address: 'Carrera 43A #1-50',
    city: 'Medellín',
    status: 'Activo',
    registrationDate: '19 Sep 2023',
    mascotasSummary: ['Mia (Felino)'],
  },
]

const INITIAL_MASCOTAS: AdminMascota[] = [
  {
    id: 'masc-1',
    name: 'Max',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&auto=format&fit=crop&q=80',
    species: 'Canino',
    breed: 'Golden Retriever',
    age: '3 años',
    sex: 'Macho',
    weight: '32 kg',
    ownerId: 'due-1',
    ownerName: 'Carlos Ruiz',
    ownerPhone: '555-0192',
    status: 'Activo',
    registrationDate: '15 Ene 2023',
    notes: 'Vacunas al día. Muy sociable y amigable.',
  },
  {
    id: 'masc-2',
    name: 'Luna',
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80',
    species: 'Felino',
    breed: 'Siamés',
    age: '1.5 años',
    sex: 'Hembra',
    weight: '4 kg',
    ownerId: 'due-2',
    ownerName: 'Ana Gómez',
    ownerPhone: '555-0321',
    status: 'Activo',
    registrationDate: '10 Feb 2023',
    notes: 'Esterilizada. Sensibilidad gástrica leve.',
  },
  {
    id: 'masc-3',
    name: 'Lolo',
    photoUrl: undefined,
    species: 'Ave',
    breed: 'Loro Gris',
    age: '12 años',
    sex: 'Macho',
    weight: '0.5 kg',
    ownerId: 'due-3',
    ownerName: 'Miguel Paz',
    ownerPhone: '555-8843',
    status: 'Inactivo',
    registrationDate: '05 Mar 2023',
    notes: 'Revisión periódica de pico y plumas.',
  },
  {
    id: 'masc-4',
    name: 'Rocky',
    photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&auto=format&fit=crop&q=80',
    species: 'Canino',
    breed: 'Bulldog Francés',
    age: '2 años',
    sex: 'Macho',
    weight: '12 kg',
    ownerId: 'due-4',
    ownerName: 'Sofía Morales',
    ownerPhone: '555-9012',
    status: 'Activo',
    registrationDate: '22 Abr 2023',
    notes: 'Control respiratorio branquicéfalo.',
  },
  {
    id: 'masc-5',
    name: 'Milo',
    photoUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=150&auto=format&fit=crop&q=80',
    species: 'Felino',
    breed: 'Persa',
    age: '4 años',
    sex: 'Macho',
    weight: '5 kg',
    ownerId: 'due-1',
    ownerName: 'Carlos Ruiz',
    ownerPhone: '555-0192',
    status: 'Activo',
    registrationDate: '12 May 2023',
    notes: 'Cepillado frecuente requerido.',
  },
  {
    id: 'masc-6',
    name: 'Bella',
    photoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=150&auto=format&fit=crop&q=80',
    species: 'Canino',
    breed: 'Poodle',
    age: '5 años',
    sex: 'Hembra',
    weight: '7 kg',
    ownerId: 'due-5',
    ownerName: 'Elena Vargas',
    ownerPhone: '555-7766',
    status: 'Activo',
    registrationDate: '18 May 2023',
    notes: 'Excelente estado de salud.',
  },
  {
    id: 'masc-7',
    name: 'Nemo',
    photoUrl: undefined,
    species: 'Exótico',
    breed: 'Pez Payaso',
    age: '1 año',
    sex: 'Macho',
    weight: '0.1 kg',
    ownerId: 'due-6',
    ownerName: 'Valentina Cruz',
    ownerPhone: '555-2211',
    status: 'Activo',
    registrationDate: '30 Jun 2023',
    notes: 'Parámetros de acuario estables.',
  },
  {
    id: 'masc-8',
    name: 'Coco',
    photoUrl: undefined,
    species: 'Roedor',
    breed: 'Hámster Sirio',
    age: '8 meses',
    sex: 'Macho',
    weight: '0.2 kg',
    ownerId: 'due-7',
    ownerName: 'Daniel Ortiz',
    ownerPhone: '555-6677',
    status: 'Inactivo',
    registrationDate: '12 Jul 2023',
    notes: 'Dieta balanceada con semillas.',
  },
  {
    id: 'masc-9',
    name: 'Thor',
    photoUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5455?w=150&auto=format&fit=crop&q=80',
    species: 'Canino',
    breed: 'Pastor Alemán',
    age: '4 años',
    sex: 'Macho',
    weight: '35 kg',
    ownerId: 'due-8',
    ownerName: 'Andrés Mendoza',
    ownerPhone: '555-3322',
    status: 'Activo',
    registrationDate: '01 Ago 2023',
    notes: 'Entrenamiento canino avanzado.',
  },
  {
    id: 'masc-10',
    name: 'Mia',
    photoUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=150&auto=format&fit=crop&q=80',
    species: 'Felino',
    breed: 'Angora',
    age: '2 años',
    sex: 'Hembra',
    weight: '3.8 kg',
    ownerId: 'due-9',
    ownerName: 'Camila Torres',
    ownerPhone: '555-1199',
    status: 'Activo',
    registrationDate: '19 Sep 2023',
    notes: 'Desparasitación al día.',
  },
]

export function useMascotasAdmin() {
  const [activeTab, setActiveTab] = useState<'mascotas' | 'duenos'>('mascotas')
  const [mascotas, setMascotas] = useState<AdminMascota[]>(INITIAL_MASCOTAS)
  const [duenos, setDuenos] = useState<AdminDueno[]>(INITIAL_DUENOS)

  // Filters
  const [mascotaFilters, setMascotaFilters] = useState<MascotaFilters>({
    searchQuery: '',
    speciesFilter: 'all',
    statusFilter: 'all',
  })

  const [duenoFilters, setDuenoFilters] = useState<DuenoFilters>({
    searchQuery: '',
    statusFilter: 'all',
  })

  // Pagination
  const [mascotaPage, setMascotaPage] = useState(1)
  const [duenoPage, setDuenoPage] = useState(1)
  const itemsPerPage = 5

  // Modals & Drawers
  const [isMascotaModalOpen, setIsMascotaModalOpen] = useState(false)
  const [editingMascota, setEditingMascota] = useState<AdminMascota | null>(null)
  const [isDuenoModalOpen, setIsDuenoModalOpen] = useState(false)
  const [editingDueno, setEditingDueno] = useState<AdminDueno | null>(null)
  const [detailItem, setDetailItem] = useState<{
    type: 'mascota' | 'dueno'
    data: AdminMascota | AdminDueno
  } | null>(null)

  // Notification Toast
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  const showToast = (message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification((curr) => (curr === message ? null : curr))
    }, 3000)
  }

  // Filtered Mascotas
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

  // Filtered Dueños
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

  // Mascotas Pagination Slice
  const totalMascotas = filteredMascotas.length
  const totalMascotaPages = Math.ceil(totalMascotas / itemsPerPage) || 1
  const paginatedMascotas = useMemo(() => {
    const start = (mascotaPage - 1) * itemsPerPage
    return filteredMascotas.slice(start, start + itemsPerPage)
  }, [filteredMascotas, mascotaPage, itemsPerPage])

  // Dueños Pagination Slice
  const totalDuenos = filteredDuenos.length
  const totalDuenoPages = Math.ceil(totalDuenos / itemsPerPage) || 1
  const paginatedDuenos = useMemo(() => {
    const start = (duenoPage - 1) * itemsPerPage
    return filteredDuenos.slice(start, start + itemsPerPage)
  }, [filteredDuenos, duenoPage, itemsPerPage])

  // CRUD Mascotas
  const createMascota = (data: MascotaFormData) => {
    const owner = duenos.find((d) => d.id === data.ownerId)
    const newMascota: AdminMascota = {
      id: `masc-${Date.now()}`,
      name: data.name.trim(),
      species: data.species,
      breed: data.breed.trim(),
      age: data.age.trim(),
      sex: data.sex,
      weight: data.weight.trim(),
      ownerId: data.ownerId,
      ownerName: owner ? owner.name : 'Sin asignar',
      ownerPhone: owner ? owner.phone : '',
      status: data.status,
      photoUrl: data.photoUrl?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      registrationDate: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    }

    setMascotas((prev) => [newMascota, ...prev])
    setIsMascotaModalOpen(false)
    showToast(`Mascota "${newMascota.name}" registrada con éxito`)
  }

  const updateMascota = (id: string, data: MascotaFormData) => {
    const owner = duenos.find((d) => d.id === data.ownerId)
    setMascotas((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              name: data.name.trim(),
              species: data.species,
              breed: data.breed.trim(),
              age: data.age.trim(),
              sex: data.sex,
              weight: data.weight.trim(),
              ownerId: data.ownerId,
              ownerName: owner ? owner.name : m.ownerName,
              ownerPhone: owner ? owner.phone : m.ownerPhone,
              status: data.status,
              photoUrl: data.photoUrl?.trim() || undefined,
              notes: data.notes?.trim() || undefined,
            }
          : m
      )
    )
    setIsMascotaModalOpen(false)
    setEditingMascota(null)
    showToast(`Mascota "${data.name}" actualizada con éxito`)
  }

  const deleteMascota = (id: string) => {
    const item = mascotas.find((m) => m.id === id)
    setMascotas((prev) => prev.filter((m) => m.id !== id))
    showToast(`Mascota "${item?.name || ''}" eliminada`)
  }

  const toggleMascotaStatus = (id: string) => {
    setMascotas((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newStatus: EstadoMascota = m.status === 'Activo' ? 'Inactivo' : 'Activo'
          showToast(`Estado de "${m.name}" cambiado a ${newStatus}`)
          return { ...m, status: newStatus }
        }
        return m
      })
    )
  }

  // CRUD Dueños
  const createDueno = (data: DuenoFormData) => {
    const newDueno: AdminDueno = {
      id: `due-${Date.now()}`,
      name: data.name.trim(),
      documentId: data.documentId.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      status: data.status,
      registrationDate: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      mascotasSummary: [],
    }

    setDuenos((prev) => [newDueno, ...prev])
    setIsDuenoModalOpen(false)
    showToast(`Dueño "${newDueno.name}" registrado con éxito`)
  }

  const updateDueno = (id: string, data: DuenoFormData) => {
    setDuenos((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              name: data.name.trim(),
              documentId: data.documentId.trim(),
              email: data.email.trim(),
              phone: data.phone.trim(),
              address: data.address.trim(),
              city: data.city.trim(),
              status: data.status,
            }
          : d
      )
    )
    // Update owner names on associated mascotas
    setMascotas((prev) =>
      prev.map((m) =>
        m.ownerId === id
          ? { ...m, ownerName: data.name.trim(), ownerPhone: data.phone.trim() }
          : m
      )
    )
    setIsDuenoModalOpen(false)
    setEditingDueno(null)
    showToast(`Dueño "${data.name}" actualizado con éxito`)
  }

  const deleteDueno = (id: string) => {
    const item = duenos.find((d) => d.id === id)
    setDuenos((prev) => prev.filter((d) => d.id !== id))
    showToast(`Dueño "${item?.name || ''}" eliminado`)
  }

  const toggleDuenoStatus = (id: string) => {
    setDuenos((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const newStatus: EstadoMascota = d.status === 'Activo' ? 'Inactivo' : 'Activo'
          showToast(`Estado de "${d.name}" cambiado a ${newStatus}`)
          return { ...d, status: newStatus }
        }
        return d
      })
    )
  }

  // Modal actions
  const openCreateMascota = () => {
    setEditingMascota(null)
    setIsMascotaModalOpen(true)
  }

  const openEditMascota = (m: AdminMascota) => {
    setEditingMascota(m)
    setIsMascotaModalOpen(true)
  }

  const openCreateDueno = () => {
    setEditingDueno(null)
    setIsDuenoModalOpen(true)
  }

  const openEditDueno = (d: AdminDueno) => {
    setEditingDueno(d)
    setIsDuenoModalOpen(true)
  }

  return {
    activeTab,
    setActiveTab,
    mascotas,
    duenos,
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
    // Modals
    isMascotaModalOpen,
    setIsMascotaModalOpen,
    editingMascota,
    isDuenoModalOpen,
    setIsDuenoModalOpen,
    editingDueno,
    detailItem,
    setDetailItem,
    // Actions
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
    // Notifications
    activeNotification,
    showToast,
  }
}
