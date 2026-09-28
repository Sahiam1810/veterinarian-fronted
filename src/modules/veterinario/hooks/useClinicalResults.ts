import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '@/services'
import {
  fetchClinicalResultVeterinarians,
  fetchClinicalResults,
} from '../services/clinicalResultsService'
import type { ApiVeterinarian } from '../api/apiTypes'
import type {
  ClinicalResult,
  ClinicalResultsFilters,
  ClinicalResultsPagination,
} from '../types/resultadosClinicos.types'

const DEFAULT_PAGE_SIZE = 20

const EMPTY_PAGINATION: ClinicalResultsPagination = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  totalItems: 0,
  totalPages: 0,
}

export function useClinicalResults() {
  const [filters, setFiltersState] = useState<ClinicalResultsFilters>({
    search: '',
    veterinarianId: '',
    from: '',
    to: '',
    status: '',
  })
  const [results, setResults] = useState<ClinicalResult[]>([])
  const [veterinarians, setVeterinarians] = useState<ApiVeterinarian[]>([])
  const [pagination, setPagination] = useState(EMPTY_PAGINATION)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    void fetchClinicalResultVeterinarians()
      .then((data) => {
        if (active) setVeterinarians(data)
      })
      .catch(() => {
        // El filtro es opcional; la bandeja sigue funcionando si no se carga el catálogo.
      })

    return () => {
      active = false
    }
  }, [])

  const loadResults = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchClinicalResults(filters, page, DEFAULT_PAGE_SIZE)
      setResults(response.items)
      setPagination(response.pagination)
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setError('No tienes permiso para consultar los resultados clínicos.')
      } else {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los resultados clínicos.')
      }
      setResults([])
      setPagination({ ...EMPTY_PAGINATION, page })
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    void loadResults()
  }, [loadResults])

  const setFilters = useCallback((next: Partial<ClinicalResultsFilters>) => {
    setFiltersState((current) => ({ ...current, ...next }))
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState({ search: '', veterinarianId: '', from: '', to: '', status: '' })
    setPage(1)
  }, [])

  const openResult = useCallback((url?: string | null) => {
    setNotice(null)
    if (!url?.trim()) {
      setNotice('Esta orden no tiene un resultado adjunto.')
      return
    }

    const opened = window.open(url, '_blank', 'noopener,noreferrer')
    if (!opened) {
      setNotice('No se pudo abrir el resultado. Revisa si el navegador bloqueó la ventana.')
    }
  }, [])

  return {
    filters,
    results,
    veterinarians,
    pagination,
    page,
    isLoading,
    error,
    notice,
    setFilters,
    clearFilters,
    setPage,
    openResult,
    reload: loadResults,
  }
}
