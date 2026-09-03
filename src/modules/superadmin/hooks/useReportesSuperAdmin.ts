import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  fetchAppointments,
  fetchVeterinarians,
  fetchPets,
  fetchClientsPets,
  fetchServices,
  fetchUsers,
  fetchClients,
  fetchRaces,
} from '../services'
import { mapStatusToAppointmentStatus, formatDateEs } from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'

export interface ReporteCitaReciente {
  id: string
  dateStr: string
  timeStr: string
  professionalName: string
  service: string
  petName: string
  petBreed: string
  status: 'Atendido' | 'Agendado' | 'Cancelado'
  scheduledStart: string
}

export interface ReportesKpis {
  totalCitas: number
  pctAsistencia: number
  servicioTop: string
  servicioTopPct: number
  byStatus: { label: string; count: number; pct: number; color: string }[]
  byProfessional: { label: string; count: number; pct: number }[]
}

function inPeriod(iso: string, period: string): boolean {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()
  if (period === 'este-mes') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }
  if (period === '30-dias') {
    const from = new Date(now)
    from.setDate(from.getDate() - 30)
    return d >= from
  }
  // ultimo-ano
  const from = new Date(now)
  from.setFullYear(from.getFullYear() - 1)
  return d >= from
}

export function useReportesSuperAdmin() {
  const [citas, setCitas] = useState<ReporteCitaReciente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('este-mes')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'resumen' | 'detalles'>('resumen')
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => setActiveNotification(null), 3200)
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [appointments, vets, pets, clientsPets, services, users, clients, races] =
        await Promise.all([
          fetchAppointments(),
          fetchVeterinarians(),
          fetchPets(),
          fetchClientsPets(),
          fetchServices(),
          fetchUsers(),
          fetchClients(),
          fetchRaces(),
        ])

      const petsById = new Map(pets.map((p) => [p.id, p]))
      const racesById = new Map(races.map((r) => [r.id, r.name]))
      const vetsById = new Map(vets.map((v) => [v.id, v]))
      const servicesById = new Map(services.map((s) => [s.id, s]))

      const mapped: ReporteCitaReciente[] = appointments.map((apt) => {
        const cp = clientsPets.find((x) => x.id === apt.clientPetId)
        const pet = cp ? petsById.get(cp.petId) : undefined
        const vet = vetsById.get(apt.veterinarianId)
        const uiStatus = mapStatusToAppointmentStatus(apt.statusName)
        const status: ReporteCitaReciente['status'] =
          uiStatus === 'Atendido'
            ? 'Atendido'
            : uiStatus === 'Cancelado'
              ? 'Cancelado'
              : 'Agendado'

        const start = new Date(apt.scheduledStart)
        return {
          id: apt.id,
          dateStr: formatDateEs(apt.scheduledStart),
          timeStr: start.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          professionalName: vet?.userFullName ?? 'Profesional',
          service: apt.serviceName ?? servicesById.get(apt.serviceId)?.name ?? 'Servicio',
          petName: pet?.name ?? 'Mascota',
          petBreed: pet ? racesById.get(pet.raceId) ?? '' : '',
          status,
          scheduledStart: apt.scheduledStart,
        }
      })

      setCitas(mapped)
      void users
      void clients
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudieron cargar los reportes.'
      showToast(message)
      setCitas([])
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const periodCitas = useMemo(
    () => citas.filter((c) => inPeriod(c.scheduledStart, period)),
    [citas, period],
  )

  const filteredCitas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return periodCitas
    return periodCitas.filter(
      (c) =>
        c.professionalName.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q) ||
        c.petName.toLowerCase().includes(q),
    )
  }, [periodCitas, searchQuery])

  const kpis: ReportesKpis = useMemo(() => {
    const total = periodCitas.length
    const attended = periodCitas.filter((c) => c.status === 'Atendido').length
    const scheduled = periodCitas.filter((c) => c.status === 'Agendado').length
    const cancelled = periodCitas.filter((c) => c.status === 'Cancelado').length
    const pctAsistencia = total > 0 ? Math.round((attended / total) * 100) : 0

    const serviceCounts = new Map<string, number>()
    for (const c of periodCitas) {
      serviceCounts.set(c.service, (serviceCounts.get(c.service) ?? 0) + 1)
    }
    let servicioTop = '—'
    let servicioTopCount = 0
    for (const [name, count] of serviceCounts) {
      if (count > servicioTopCount) {
        servicioTop = name
        servicioTopCount = count
      }
    }
    const servicioTopPct = total > 0 ? Math.round((servicioTopCount / total) * 100) : 0

    const byStatus = [
      {
        label: 'Atendido',
        count: attended,
        pct: total > 0 ? Math.round((attended / total) * 100) : 0,
        color: 'bg-terracotta',
      },
      {
        label: 'Agendado',
        count: scheduled,
        pct: total > 0 ? Math.round((scheduled / total) * 100) : 0,
        color: 'bg-brand/60',
      },
      {
        label: 'Cancelado',
        count: cancelled,
        pct: total > 0 ? Math.round((cancelled / total) * 100) : 0,
        color: 'bg-[#B24C3D]',
      },
    ]

    const profCounts = new Map<string, number>()
    for (const c of periodCitas) {
      profCounts.set(c.professionalName, (profCounts.get(c.professionalName) ?? 0) + 1)
    }
    const byProfessional = [...profCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({
        label,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }))

    return {
      totalCitas: total,
      pctAsistencia,
      servicioTop,
      servicioTopPct,
      byStatus,
      byProfessional,
    }
  }, [periodCitas])

  const exportCsv = () => {
    if (filteredCitas.length === 0) {
      showToast('No hay citas para exportar en este período.')
      return
    }
    const header = 'Fecha,Hora,Profesional,Servicio,Mascota,Raza,Estado'
    const rows = filteredCitas.map(
      (c) =>
        `"${c.dateStr}","${c.timeStr}","${c.professionalName}","${c.service}","${c.petName}","${c.petBreed}","${c.status}"`,
    )
    const blob = new Blob([[header, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reportes-citas-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Reporte CSV descargado.')
  }

  return {
    isLoading,
    period,
    setPeriod,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredCitas,
    kpis,
    activeNotification,
    showToast,
    exportCsv,
    reload: loadData,
  }
}
