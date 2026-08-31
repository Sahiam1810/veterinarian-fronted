import { useState, useMemo } from 'react'
import {
  AdminHeader,
  AdminSidebar,
  DashboardBackgroundDecoration,
} from '../../components'

interface ReportesAdminProps {
  onNavigate?: (routeId: string) => void
  activeRoute?: string
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  onCloseSidebar?: () => void
  userName?: string
  userRole?: string
  onLogout?: () => void
}

interface CitaReciente {
  id: string
  dateStr: string
  timeStr: string
  professionalName: string
  professionalAvatar?: string
  service: string
  petName: string
  petBreed: string
  status: 'Atendido' | 'Agendado' | 'Cancelado'
}

const INITIAL_CITAS_RECIENTES: CitaReciente[] = [
  {
    id: 'rec-1',
    dateStr: '15 Oct 2023',
    timeStr: '09:00 AM',
    professionalName: 'Dr. Martínez',
    service: 'Cirugía General',
    petName: 'Max',
    petBreed: 'Golden Retriever',
    status: 'Atendido',
  },
  {
    id: 'rec-2',
    dateStr: '15 Oct 2023',
    timeStr: '10:30 AM',
    professionalName: 'Dra. Silva',
    service: 'Consulta General',
    petName: 'Luna',
    petBreed: 'Gato Siamés',
    status: 'Agendado',
  },
  {
    id: 'rec-3',
    dateStr: '14 Oct 2023',
    timeStr: '11:30 AM',
    professionalName: 'Dr. Gómez',
    service: 'Dermatología',
    petName: 'Rocky',
    petBreed: 'Boxer',
    status: 'Atendido',
  },
  {
    id: 'rec-4',
    dateStr: '14 Oct 2023',
    timeStr: '04:00 PM',
    professionalName: 'Dra. Ruiz',
    service: 'Odontología',
    petName: 'Bella',
    petBreed: 'Persa',
    status: 'Cancelado',
  },
  {
    id: 'rec-5',
    dateStr: '13 Oct 2023',
    timeStr: '02:15 PM',
    professionalName: 'Dr. Martínez',
    service: 'Cirugía General',
    petName: 'Coco',
    petBreed: 'Poodle',
    status: 'Atendido',
  },
  {
    id: 'rec-6',
    dateStr: '13 Oct 2023',
    timeStr: '03:30 PM',
    professionalName: 'Dra. Silva',
    service: 'Vacunación Anual',
    petName: 'Toby',
    petBreed: 'Pastor Alemán',
    status: 'Atendido',
  },
]

export function ReportesAdmin({
  onNavigate,
  activeRoute = 'reportes',
  isSidebarOpen: externalIsSidebarOpen,
  onToggleSidebar: externalOnToggleSidebar,
  onCloseSidebar: externalOnCloseSidebar,
  userName = 'Admin Veterinario',
  userRole = 'Administrador',
  onLogout,
}: ReportesAdminProps = {}) {
  // Navigation & Sidebar
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false)
  const isSidebarOpen =
    externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : internalIsSidebarOpen
  const toggleSidebar =
    externalOnToggleSidebar || (() => setInternalIsSidebarOpen((prev) => !prev))
  const closeSidebar =
    externalOnCloseSidebar || (() => setInternalIsSidebarOpen(false))

  // Filters & State
  const [period, setPeriod] = useState('este-mes')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'resumen' | 'detalles'>('resumen')

  // Toast Notification
  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const showToast = (message: string) => {
    setActiveNotification(message)
    setTimeout(() => {
      setActiveNotification(null)
    }, 3200)
  }

  const handleSidebarNavigate = (routeId: string) => {
    if (onNavigate) {
      onNavigate(routeId)
    } else {
      showToast(`Navegando a: ${routeId}`)
    }
  }

  // Filtered appointments list
  const filteredCitas = useMemo(() => {
    return INITIAL_CITAS_RECIENTES.filter((c) => {
      const matchQuery =
        c.professionalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.petName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchQuery
    })
  }, [searchQuery])

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-bone relative text-charcoal">
      {/* 1. Top Header Fijo */}
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        userName={userName}
        userRole={userRole}
        onNotificationClick={() => showToast('Tienes 2 notificaciones del sistema')}
        onProfileClick={() => showToast('Abriendo panel de perfil de administrador')}
      />

      {/* 2. Cuerpo Principal */}
      <div className="flex-1 flex overflow-hidden relative">
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleSidebarNavigate}
          onLogout={onLogout}
        />

        <main
          key={activeRoute}
          className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-7 animate-view-popup"
        >
          <DashboardBackgroundDecoration />

          {/* Toast Notification */}
          {activeNotification && (
            <div
              className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-brand text-white text-xs sm:text-sm font-semibold shadow-lg border border-white/20 flex items-center gap-2 pointer-events-none"
              role="alert"
            >
              <svg className="w-4 h-4 text-ochre shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              <span>{activeNotification}</span>
            </div>
          )}

          {/* Header de la Vista */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pop-in stagger-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
                Reportes Administrativos
              </h1>
              <p className="text-xs sm:text-sm text-sage font-medium mt-1">
                Visualización de métricas clave y rendimiento de la clínica.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              {/* Selector de Período */}
              <select
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value)
                  showToast(`Rango filtrado a: ${e.target.value === 'este-mes' ? 'Este Mes' : e.target.value === '30-dias' ? 'Últimos 30 días' : 'Último Año'}`)
                }}
                className="px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal font-bold focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="este-mes">Este Mes</option>
                <option value="30-dias">Últimos 30 días</option>
                <option value="ultimo-ano">Último Año</option>
              </select>

              {/* Botón Filtros */}
              <button
                type="button"
                onClick={() => showToast('Abriendo filtros avanzados')}
                className="border border-border-tan bg-white hover:bg-bone text-charcoal text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <svg className="w-4 h-4 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filtros</span>
              </button>

              {/* Botón Exportar */}
              <button
                type="button"
                onClick={() => showToast('Exportando reporte a PDF/Excel')}
                className="bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs active:translate-y-0.5"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Barra de Pestañas (Resumen / Detalles Cita) */}
          <div className="relative z-10 border-b border-border-tan/70 flex items-center justify-between gap-4 animate-pop-in stagger-1.5">
            <div className="flex items-center gap-6 sm:gap-8">
              <button
                type="button"
                onClick={() => setActiveTab('resumen')}
                className={`relative px-5 pt-3 pb-3.5 text-sm sm:text-[15px] font-semibold transition-colors cursor-pointer ${
                  activeTab === 'resumen'
                    ? "text-brand font-bold after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2.5px] after:bg-brand after:rounded-full"
                    : 'text-sage hover:text-brand'
                }`}
              >
                Resumen General
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('detalles')}
                className={`relative px-5 pt-3 pb-3.5 text-sm sm:text-[15px] font-semibold transition-colors cursor-pointer ${
                  activeTab === 'detalles'
                    ? "text-brand font-bold after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2.5px] after:bg-brand after:rounded-full"
                    : 'text-sage hover:text-brand'
                }`}
              >
                Detalles Cita
              </button>
            </div>
          </div>

          {/* TAB 1: RESUMEN GENERAL (Estadísticas y Gráficos) */}
          {activeTab === 'resumen' && (
            <div className="flex-1 flex flex-col gap-6 sm:gap-7 animate-view-popup">
              {/* Tarjetas de Estadísticas (3 Columnas) */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 animate-pop-in stagger-2">
                {/* Total Citas */}
                <div className="bg-white border border-border-tan rounded-2xl p-5 shadow-[0_4px_20px_rgba(35,78,70,0.02)] flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] sm:text-xs font-bold text-sage uppercase tracking-wider">
                      Total Citas
                    </span>
                    <p className="text-3xl font-black text-brand tracking-tight">1,248</p>
                    <p className="text-[10px] sm:text-xs text-brand font-bold flex items-center gap-1">
                      <span>↗ +12% vs mes anterior</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sage-soft text-brand flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* % de Asistencia */}
                <div className="bg-white border border-border-tan rounded-2xl p-5 shadow-[0_4px_20px_rgba(35,78,70,0.02)] flex items-start justify-between">
                  <div className="space-y-1.5 w-full pr-4">
                    <span className="text-[11px] sm:text-xs font-bold text-sage uppercase tracking-wider">
                      % de Asistencia
                    </span>
                    <p className="text-3xl font-black text-brand tracking-tight">92%</p>
                    <div className="w-full h-1.5 bg-[#F1EFEA] rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sage-soft text-brand flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                {/* Servicio + Rentable */}
                <div className="bg-white border border-border-tan rounded-2xl p-5 shadow-[0_4px_20px_rgba(35,78,70,0.02)] flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] sm:text-xs font-bold text-sage uppercase tracking-wider">
                      Servicio +Rentable
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-[#A66D5B] tracking-tight truncate max-w-[200px]" title="Cirugía General">
                      Cirugía General
                    </p>
                    <p className="text-[10px] sm:text-xs text-sage font-semibold">
                      35% de los ingresos
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-terracotta-soft text-[#A66D5B] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Gráficos Horizontales (2 Columnas) */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pop-in stagger-3">
                {/* Citas por Estado */}
                <div className="bg-white border border-border-tan rounded-2xl p-5 shadow-[0_4px_20px_rgba(35,78,70,0.03)] space-y-4">
                  <div className="flex items-center justify-between border-b border-border-tan/50 pb-2">
                    <h3 className="text-sm sm:text-base font-bold text-brand">
                      Citas por Estado
                    </h3>
                    <button type="button" className="text-sage hover:text-charcoal transition text-lg" aria-label="Opciones">
                      ⋮
                    </button>
                  </div>
                  <div className="space-y-4 text-xs sm:text-sm">
                    {/* Atendido */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-charcoal/80">Atendido</span>
                        <span className="font-extrabold text-charcoal">811</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#F1EFEA] rounded-full overflow-hidden">
                        <div className="h-full bg-terracotta rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>

                    {/* Agendado */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-charcoal/80">Agendado</span>
                        <span className="font-extrabold text-charcoal">250</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#F1EFEA] rounded-full overflow-hidden">
                        <div className="h-full bg-brand/60 rounded-full" style={{ width: '20%' }} />
                      </div>
                    </div>

                    {/* Cancelado */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-charcoal/80">Cancelado</span>
                        <span className="font-extrabold text-charcoal">187</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#F1EFEA] rounded-full overflow-hidden">
                        <div className="h-full bg-[#B24C3D] rounded-full" style={{ width: '15%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Citas por Profesional */}
                <div className="bg-white border border-border-tan rounded-2xl p-5 shadow-[0_4px_20px_rgba(35,78,70,0.03)] space-y-4">
                  <div className="flex items-center justify-between border-b border-border-tan/50 pb-2">
                    <h3 className="text-sm sm:text-base font-bold text-brand">
                      Citas por Profesional
                    </h3>
                    <button type="button" className="text-sage hover:text-charcoal transition text-lg" aria-label="Opciones">
                      ⋮
                    </button>
                  </div>
                  <div className="space-y-3.5 text-xs sm:text-sm">
                    {/* Dr. Martínez */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-charcoal/85">Dr. Martínez (Cirugía)</span>
                        <span className="font-extrabold text-charcoal">420</span>
                      </div>
                      <div className="w-full h-2 bg-[#F1EFEA] rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>

                    {/* Dra. Silva */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-charcoal/85">Dra. Silva (General)</span>
                        <span className="font-extrabold text-charcoal">315</span>
                      </div>
                      <div className="w-full h-2 bg-[#F1EFEA] rounded-full overflow-hidden">
                        <div className="h-full bg-brand/70 rounded-full" style={{ width: '52%' }} />
                      </div>
                    </div>

                    {/* Dr. Gómez */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-charcoal/85">Dr. Gómez (Derma)</span>
                        <span className="font-extrabold text-charcoal">210</span>
                      </div>
                      <div className="w-full h-2 bg-[#F1EFEA] rounded-full overflow-hidden">
                        <div className="h-full bg-[#7C9A94] rounded-full" style={{ width: '35%' }} />
                      </div>
                    </div>

                    {/* Dra. Ruiz */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-charcoal/85">Dra. Ruiz (Odonto)</span>
                        <span className="font-extrabold text-charcoal">145</span>
                      </div>
                      <div className="w-full h-2 bg-[#F1EFEA] rounded-full overflow-hidden">
                        <div className="h-full bg-border-tan rounded-full" style={{ width: '24%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETALLES CITA (Listado Detalle de Citas Recientes) */}
          {activeTab === 'detalles' && (
            <div className="relative z-10 bg-white border border-border-tan rounded-2xl shadow-[0_4px_20px_rgba(35,78,70,0.04)] overflow-hidden animate-view-popup flex-1 flex flex-col">
              {/* Header de la Tabla */}
              <div className="p-4 border-b border-border-tan/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
                <h3 className="text-base font-bold text-brand">
                  Detalle de Citas Recientes
                </h3>

                {/* Buscador */}
                <div className="relative w-full sm:w-[280px]">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-sage w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar profesional o servicio..."
                    className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-border-tan bg-bone/30 focus:bg-white text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage hover:text-charcoal cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-bone/80 border-b border-border-tan/60 text-sage text-[0.72rem] font-bold tracking-wider uppercase">
                      <th className="py-3 px-6 w-1/4">Fecha & Hora</th>
                      <th className="py-3 px-4 w-1/4">Profesional</th>
                      <th className="py-3 px-4 w-1/4">Servicio</th>
                      <th className="py-3 px-4 w-1/4">Paciente</th>
                      <th className="py-3 px-6 text-center w-24">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-tan/30 text-xs sm:text-sm">
                    {filteredCitas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-sage font-medium">
                          No se encontraron registros de citas recientes.
                        </td>
                      </tr>
                    ) : (
                      filteredCitas.map((c) => (
                        <tr key={c.id} className="hover:bg-bone/40 transition">
                          {/* Fecha y Hora */}
                          <td className="py-3.5 px-6 font-medium text-charcoal">
                            <p className="font-semibold text-charcoal">{c.dateStr}</p>
                            <p className="text-[11px] text-sage mt-0.5">{c.timeStr}</p>
                          </td>

                          {/* Profesional */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-sage-soft text-brand font-bold text-xs flex items-center justify-center">
                                {c.professionalName.split(' ')[1]?.charAt(0) || 'M'}
                              </div>
                              <span className="font-bold text-charcoal">{c.professionalName}</span>
                            </div>
                          </td>

                          {/* Servicio */}
                          <td className="py-3.5 px-4 text-charcoal/80 font-medium">
                            {c.service}
                          </td>

                          {/* Paciente */}
                          <td className="py-3.5 px-4 text-charcoal/85">
                            <p className="font-semibold text-charcoal">{c.petName}</p>
                            <p className="text-[11px] text-sage">{c.petBreed}</p>
                          </td>

                          {/* Estado */}
                          <td className="py-3.5 px-6 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                                c.status === 'Atendido'
                                  ? 'bg-terracotta-soft text-[#A66D5B]'
                                  : c.status === 'Agendado'
                                  ? 'bg-[#E8F2EF] text-brand'
                                  : 'bg-[#FBF1E6] text-ochre'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer de Paginación */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-border-tan/50 bg-white text-xs text-sage">
                <span>
                  Mostrando {filteredCitas.length} de {filteredCitas.length} registros
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-3 py-1.5 rounded-lg bg-brand text-white font-bold text-xs shadow-2xs">
                    1
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}
