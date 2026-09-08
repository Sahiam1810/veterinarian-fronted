import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  fetchAppointments,
  fetchVeterinarians,
  fetchPets,
  fetchClientsPets,
  fetchServices,
  fetchRaces,
} from '../services'
import {
  REPORTES_USE_API,
  resolveReportesDateRange,
  isIsoInRange,
} from '../services/superAdminReportsService'
import { buildReportesDashboardFromCitas } from '../utils/buildReportesDashboard'
import { mapStatusToAppointmentStatus, formatDateEs } from '../utils/superAdminApiMappers'
import { ApiError } from '@/services'
import type {
  ReportesCitaDetalleVm,
  ReportesDashboardVm,
  ReportesPeriodoId,
  ReportesTabId,
} from '../types/reportesSuperAdmin.types'
import { REPORTES_PERIODO_OPTIONS } from '../types/reportesSuperAdmin.types'

const EMPTY_DASHBOARD: ReportesDashboardVm = {
  range: { from: '', to: '' },
  summary: {
    from: '',
    to: '',
    totalAppointments: 0,
    attendedCount: 0,
    canceledCount: 0,
    noShowCount: 0,
    scheduledCount: 0,
    attendanceRate: 0,
    topServiceName: null,
    topServiceCount: 0,
    topServicePercentage: 0,
  },
  byStatus: [],
  byVeterinarian: [],
  byDay: [],
  topServices: [],
  citasDetalle: [],
}

// Hook de Reportes Admin/SuperAdmin. KPIs provisionales en cliente; API Reports aún no cableada.
export function useReportesSuperAdmin() {
  const [citasDetalle, setCitasDetalle] = useState<ReportesCitaDetalleVm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<ReportesPeriodoId>('este-mes')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ReportesTabId>('resumen')
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => setActiveNotification(null), 3200)
  }, [])

  const range = useMemo(() => resolveReportesDateRange(period), [period])

  // Carga detalle de citas (sigue siendo Appointments). No llama /api/Reports.
  const loadDetalleCitas = useCallback(async () => {
    setIsLoading(true)
    try {
      if (REPORTES_USE_API) {
        // Reservado: cuando B1–B4 existan, cargar summary/by-* aquí y dejar detalle aparte.
        showToast('Los endpoints de Reportes aún no están disponibles.')
        setCitasDetalle([])
        return
      }

      // allSettled: si Pets falla (p. ej. PHOTO_URL), igual armamos reportes con citas
      const results = await Promise.allSettled([
        fetchAppointments(),
        fetchVeterinarians(),
        fetchPets(),
        fetchClientsPets(),
        fetchServices(),
        fetchRaces(),
      ])

      const appointments = results[0].status === 'fulfilled' ? results[0].value : []
      const vets = results[1].status === 'fulfilled' ? results[1].value : []
      const pets = results[2].status === 'fulfilled' ? results[2].value : []
      const clientsPets = results[3].status === 'fulfilled' ? results[3].value : []
      const services = results[4].status === 'fulfilled' ? results[4].value : []
      const races = results[5].status === 'fulfilled' ? results[5].value : []

      const failed = results.find((r) => r.status === 'rejected')
      if (failed && failed.status === 'rejected') {
        const reason = failed.reason
        const message =
          reason instanceof ApiError
            ? reason.message === 'Unexpected error'
              ? 'Algunos catálogos fallaron; el resumen usa solo las citas disponibles.'
              : reason.message
            : 'Algunos datos no cargaron; el resumen puede estar incompleto.'
        showToast(message)
      }

      if (results[0].status === 'rejected') {
        setCitasDetalle([])
        return
      }

      const petsById = new Map(pets.map((p) => [p.id, p]))
      const racesById = new Map(races.map((r) => [r.id, r.name]))
      const vetsById = new Map(vets.map((v) => [v.id, v]))
      const servicesById = new Map(services.map((s) => [s.id, s]))

      const mapped: ReportesCitaDetalleVm[] = appointments.map((apt) => {
        const cp = clientsPets.find((x) => x.id === apt.clientPetId)
        const pet = cp ? petsById.get(cp.petId) : undefined
        const vet = vetsById.get(apt.veterinarianId)
        const uiStatus = mapStatusToAppointmentStatus(apt.statusName)
        const status: ReportesCitaDetalleVm['status'] =
          uiStatus === 'Atendido' ? 'Atendido' : uiStatus === 'Cancelado' ? 'Cancelado' : 'Agendado'

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

      setCitasDetalle(mapped)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message === 'Unexpected error'
            ? 'Error del servidor al cargar reportes.'
            : err.message
          : 'No se pudieron cargar los reportes.'
      showToast(message)
      setCitasDetalle([])
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadDetalleCitas()
  }, [loadDetalleCitas])

  const citasEnPeriodo = useMemo(
    () => citasDetalle.filter((c) => isIsoInRange(c.scheduledStart, range)),
    [citasDetalle, range],
  )

  const dashboard: ReportesDashboardVm = useMemo(() => {
    const built = buildReportesDashboardFromCitas(range, citasEnPeriodo)
    return { ...built, citasDetalle: citasEnPeriodo }
  }, [range, citasEnPeriodo])

  const filteredCitas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return dashboard.citasDetalle
    return dashboard.citasDetalle.filter(
      (c) =>
        c.professionalName.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q) ||
        c.petName.toLowerCase().includes(q),
    )
  }, [dashboard.citasDetalle, searchQuery])

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

  const handlePeriodChange = (next: ReportesPeriodoId) => {
    setPeriod(next)
    const label = REPORTES_PERIODO_OPTIONS.find((o) => o.id === next)?.label ?? next
    showToast(`Periodo: ${label}`)
  }

  return {
    isLoading,
    period,
    setPeriod: handlePeriodChange,
    periodOptions: REPORTES_PERIODO_OPTIONS,
    range,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredCitas,
    dashboard,
    // Compat: KPIs antiguos mapeados al summary/by*
    kpis: {
      totalCitas: dashboard.summary.totalAppointments,
      pctAsistencia: Math.round(dashboard.summary.attendanceRate),
      servicioTop: dashboard.summary.topServiceName ?? '—',
      servicioTopPct: Math.round(dashboard.summary.topServicePercentage),
      byStatus: dashboard.byStatus.map((s) => ({
        label: s.statusName,
        count: s.count,
        pct: Math.round(s.percentage),
        color: s.barClassName,
      })),
      byProfessional: dashboard.byVeterinarian.map((v) => ({
        label: v.veterinarianName,
        count: v.totalAppointments,
        pct: Math.round(v.percentage),
      })),
    },
    usingReportsApi: REPORTES_USE_API,
    activeNotification,
    showToast,
    exportCsv,
    reload: loadDetalleCitas,
    emptyDashboard: EMPTY_DASHBOARD,
  }
}
