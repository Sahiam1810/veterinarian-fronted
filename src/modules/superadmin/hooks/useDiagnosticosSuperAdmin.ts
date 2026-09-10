import { useState, useMemo, useEffect, useCallback } from 'react'
import type { DiagnosticoCatalogo, DiagnosticoFormData } from '../types/diagnosticosSuperAdmin.types'
import {
  fetchDiagnostics,
  createDiagnostic,
  updateDiagnostic,
  deactivateDiagnostic,
} from '../services'
import { ApiError } from '@/services'

function mapDiagnostic(d: {
  id: string
  code?: string | null
  name?: string | null
  description?: string | null
  isActive: boolean
}): DiagnosticoCatalogo {
  return {
    id: d.id,
    code: d.code?.trim() || '',
    name: d.name?.trim() || '',
    description: d.description?.trim() || '',
    status: d.isActive ? 'Activo' : 'Inactivo',
  }
}

export function useDiagnosticosSuperAdmin() {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoCatalogo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const [toastTone, setToastTone] = useState<'success' | 'warning'>('success')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingDiagnostico, setEditingDiagnostico] = useState<DiagnosticoCatalogo | null>(null)

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
      // Incluye inactivos para poder reactivarlos desde el panel
      const list = await fetchDiagnostics(false)
      setDiagnosticos(list.map(mapDiagnostic))
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudieron cargar los diagnósticos.'
      showToast(message, 'warning')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filteredDiagnosticos = useMemo(() => {
    return diagnosticos.filter((d) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)

      const matchStatus =
        selectedStatus === 'all' || d.status.toLowerCase() === selectedStatus.toLowerCase()

      return matchSearch && matchStatus
    })
  }, [diagnosticos, searchQuery, selectedStatus])

  const totalPages = Math.ceil(filteredDiagnosticos.length / itemsPerPage) || 1
  const paginatedDiagnosticos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredDiagnosticos.slice(start, start + itemsPerPage)
  }, [filteredDiagnosticos, currentPage, itemsPerPage])

  const handleSaveDiagnostico = async (data: DiagnosticoFormData) => {
    const code = data.code.trim().toUpperCase()
    const name = data.name.trim()
    const description = data.description.trim() || null

    if (!code || !name) {
      showToast('Código y nombre son obligatorios.', 'warning')
      return
    }

    try {
      if (editingDiagnostico) {
        await updateDiagnostic(editingDiagnostico.id, {
          code,
          name,
          description,
          isActive: data.status === 'Activo',
        })
        showToast(
          data.status === 'Inactivo'
            ? `Diagnóstico "${name}" marcado como Inactivo. Las historias existentes se conservan.`
            : `Diagnóstico "${name}" actualizado correctamente.`,
        )
      } else {
        await createDiagnostic({ code, name, description })
        showToast(`Diagnóstico "${name}" registrado correctamente.`)
      }

      setIsDrawerOpen(false)
      setEditingDiagnostico(null)
      await loadData()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo guardar el diagnóstico.'
      showToast(message, 'warning')
    }
  }

  // Baja lógica vía DELETE; preferible si ya está Inactivo
  const handleDeactivateDiagnostico = async (diagnostico: DiagnosticoCatalogo) => {
    try {
      await deactivateDiagnostic(diagnostico.id)
      showToast(`Diagnóstico "${diagnostico.name}" desactivado.`)
      await loadData()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo desactivar el diagnóstico.'
      showToast(message, 'warning')
    }
  }

  return {
    diagnosticos,
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
    editingDiagnostico,
    setEditingDiagnostico,
    filteredDiagnosticos,
    totalPages,
    paginatedDiagnosticos,
    handleSaveDiagnostico,
    handleDeactivateDiagnostico,
    reload: loadData,
  }
}
