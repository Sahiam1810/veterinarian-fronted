import { useState, useMemo, useEffect, useCallback } from 'react'
import type { ServicioSuperAdmin, ServicioFormData } from '../types'
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
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
  const [toastTone, setToastTone] = useState<'success' | 'warning'>('success')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingServicio, setEditingServicio] = useState<ServicioSuperAdmin | null>(null)

  const showToast = useCallback((message: string, tone: 'success' | 'warning' = 'success') => {
    setToastTone(tone)
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
      showToast(message, 'warning')
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
      showToast('No hay tipos de servicio configurados en el sistema.', 'warning')
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
        showToast(
          data.status === 'Inactivo'
            ? `Servicio "${data.name}" marcado como Inactivo. Las citas existentes se conservan; no se asignará a citas nuevas.`
            : `Servicio "${data.name}" actualizado correctamente.`,
        )
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
      showToast(message, 'warning')
    }
  }

  // Solo elimina si está Inactivo (sin window.confirm; el modal vive en la página).
  const handleDeleteServicio = async (servicio: ServicioSuperAdmin) => {
    if (servicio.status !== 'Inactivo') {
      showToast(
        'Desactiva el servicio antes de eliminarlo. Edítalo y márcalo como Inactivo.',
        'warning',
      )
      return
    }

    try {
      await deleteService(servicio.id)
      showToast(`Servicio "${servicio.name}" eliminado.`)
      await loadData()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo eliminar el servicio.'
      showToast(message, 'warning')
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
    toastTone,
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
