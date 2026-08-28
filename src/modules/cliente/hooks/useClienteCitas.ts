import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ClienteCitaTab, ClienteCitasPayload } from '../types'
import { fetchClienteCitas } from '../services'

const PROXIMAS_STATUS = new Set(['AGENDADO', 'CONFIRMADO'])
const ANTERIORES_STATUS = new Set(['ATENDIDO', 'CANCELADO'])

export function useClienteCitas(enabled = true) {
  const [payload, setPayload] = useState<ClienteCitasPayload | null>(null)
  const [activeTab, setActiveTab] = useState<ClienteCitaTab>('proximas')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchClienteCitas()
        if (!cancelled) setPayload(data)
      } catch {
        if (!cancelled) setError('No se pudieron cargar tus citas')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [enabled])

  const filteredItems = useMemo(() => {
    if (!payload) return []

    return payload.items.filter((item) => {
      if (activeTab === 'proximas') return PROXIMAS_STATUS.has(item.status)
      return ANTERIORES_STATUS.has(item.status)
    })
  }, [payload, activeTab])

  const handleNewAppointment = useCallback(() => {
    setNotice('Solicitud de nueva cita enviada a recepción (mock)')
  }, [])

  const handleRescheduleAppointment = useCallback((appointmentId: string) => {
    setNotice(`Reprogramar cita ${appointmentId}: disponible próximamente (mock)`)
  }, [])

  const handleCancelAppointment = useCallback((appointmentId: string) => {
    setNotice(`Cancelación solicitada para la cita ${appointmentId} (mock)`)
  }, [])

  return {
    filteredItems,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    notice,
    handleNewAppointment,
    handleRescheduleAppointment,
    handleCancelAppointment,
  }
}
