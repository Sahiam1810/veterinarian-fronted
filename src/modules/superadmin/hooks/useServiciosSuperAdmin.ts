import { useState, useMemo, useEffect, useCallback } from 'react'
import type { ServicioSuperAdmin, ServicioFormData } from '../types'
import {
  fetchServices,
  createService,
  updateService,
  fetchTypeServices,
} from '../services'
import { mapServiceToServicio } from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'

export function useServiciosSuperAdmin() {
  const [servicios, setServicios] = useState<ServicioSuperAdmin[]>([])
  const [typeServices, setTypeServices] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [defaultTypeServiceId, setDefaultTypeServiceId] = useState<string>('')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingServicio, setEditingServicio] = useState<ServicioSuperAdmin | null>(null)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification(null)
    }, 3200)
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [services, types] = await Promise.all([fetchServices(), fetchTypeServices()])
      setServicios(services.map(mapServiceToServicio))
      setTypeServices(types.map((t) => ({ id: t.id, name: t.name })))
      setDefaultTypeServiceId(types[0]?.id ?? '')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudieron cargar los servicios.'
      showToast(message)
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filteredServicios = useMemo(() => {
    return servicios.filter((srv) => {
      const matchSearch =
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus =
        selectedStatus === 'all' ||
        srv.status.toLowerCase() === selectedStatus.toLowerCase()

      return matchSearch && matchStatus
    })
  }, [servicios, searchQuery, selectedStatus])

  const totalPages = Math.ceil(filteredServicios.length / itemsPerPage) || 1
  const paginatedServicios = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredServicios.slice(start, start + itemsPerPage)
  }, [filteredServicios, currentPage, itemsPerPage])

  const handleSaveServicio = async (data: ServicioFormData) => {
    const typeServiceId =
      data.typeServiceId || editingServicio?.typeServiceId || defaultTypeServiceId
    if (!typeServiceId) {
      showToast('No hay tipos de servicio configurados en el sistema.')
      return
    }

    try {
      if (editingServicio) {
        await updateService(editingServicio.id, {
          typeServiceId,
          name: data.name,
          durationMinutes: data.duration,
          price: data.price,
          isActive: data.status === 'Activo',
        })
        showToast(`Servicio "${data.name}" actualizado correctamente.`)
      } else {
        await createService({
          typeServiceId,
          name: data.name,
          durationMinutes: data.duration,
          price: data.price,
          isActive: data.status === 'Activo',
        })
        showToast(`Servicio "${data.name}" registrado correctamente.`)
      }

      setIsDrawerOpen(false)
      setEditingServicio(null)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo guardar el servicio.'
      showToast(message)
    }
  }

  const handleDeleteServicio = async (id: string) => {
    const target = servicios.find((s) => s.id === id)
    if (!target) return

    if (!window.confirm(`¿Estás seguro de que deseas desactivar el servicio "${target.name}"?`)) {
      return
    }

    try {
      const typeServiceId = target.typeServiceId ?? defaultTypeServiceId
      if (!typeServiceId) {
        showToast('No se pudo determinar el tipo de servicio.')
        return
      }

      await updateService(id, {
        typeServiceId,
        name: target.name,
        durationMinutes: target.duration,
        price: target.price,
        isActive: false,
      })
      showToast(`Servicio "${target.name}" marcado como Inactivo.`)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo desactivar el servicio.'
      showToast(message)
    }
  }

  return {
    servicios,
    typeServices,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    activeNotification,
    showToast,
    isDrawerOpen,
    setIsDrawerOpen,
    editingServicio,
    setEditingServicio,
    filteredServicios,
    totalPages,
    paginatedServicios,
    handleSaveServicio,
    handleDeleteServicio,
    reload: loadData,
  }
}
