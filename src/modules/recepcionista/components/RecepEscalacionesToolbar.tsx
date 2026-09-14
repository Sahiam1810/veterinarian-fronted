import { useState } from 'react'
import { SearchIcon, ReloadIcon } from '@/global/components'
import type { EscalationStatusFilter } from '../types'
import { notificationsHubManager } from '@/global/notifications'
import { USE_MOCK_ESCALATIONS } from '../services/recepEscalacionesService.ts'

interface RecepEscalacionesToolbarProps {
  search: string
  statusFilter: EscalationStatusFilter
  isRefreshing?: boolean
  totalPending?: number
  totalUrgent?: number
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: EscalationStatusFilter) => void
  onRefresh?: () => void
}

const FILTERS: { id: EscalationStatusFilter; label: string }[] = [
  { id: 'todos', label: 'Todas' },
  { id: 'pendientes', label: 'Esperando Asesor' },
  { id: 'urgentes', label: 'Urgentes / Alta' },
  { id: 'en_atencion', label: 'En Atención' },
]

export function RecepEscalacionesToolbar({
  search,
  statusFilter,
  isRefreshing = false,
  totalPending,
  totalUrgent,
  onSearchChange,
  onStatusFilterChange,
  onRefresh,
}: RecepEscalacionesToolbarProps) {
  const [isSimMenuOpen, setIsSimMenuOpen] = useState(false)

  // Simulación de eventos SignalR para desarrollo y pruebas
  const showDevSim = import.meta.env.DEV || USE_MOCK_ESCALATIONS

  const handleSimulateNewEscalation = () => {
    const id = Date.now().toString()
    notificationsHubManager.simulateEscalationCreated({
      escalationId: `sim-esc-${id}`,
      conversationId: `sim-conv-${id}`,
      clientId: `sim-cli-${id}`,
      clientName: `Cliente Prueba (${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })})`,
      clientPhone: '+57 310 987 6543',
      reason: 'Consulta sobre urgencia veterinaria',
      priority: 'HIGH',
      status: 'PENDING',
      channel: 'TELEGRAM',
      createdAt: new Date().toISOString(),
      lastMessage: 'Por favor necesito ayuda con mi mascota',
    })
    setIsSimMenuOpen(false)
  }

  const handleSimulateIncomingMessage = () => {
    // Envía un mensaje simulado para la primera conversación o mock
    notificationsHubManager.simulateMessageReceived({
      messageId: `sim-msg-${Date.now()}`,
      conversationId: 'c-10000000-0000-0000-0000-000000000001',
      senderType: 'CLIENT',
      senderName: 'Carlos Mendoza',
      content: `Hola asesor, ¿pueden ayudarme? (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`,
      sentAt: new Date().toISOString(),
      messageType: 'TEXT',
    })
    setIsSimMenuOpen(false)
  }

  const handleSimulateResolution = () => {
    // Resuelve la conversación mock 1
    notificationsHubManager.simulateEscalationResolved({
      escalationId: 'e-10000000-0000-0000-0000-000000000001',
      conversationId: 'c-10000000-0000-0000-0000-000000000001',
      resolvedBy: 'otro-agente-id',
      resolvedAt: new Date().toISOString(),
      resolutionNotes: 'Resuelto por otro asesor en otra sesión',
    })
    setIsSimMenuOpen(false)
  }

  return (
    <div className="w-full min-w-0 flex flex-col gap-2.5 sm:gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {FILTERS.map((filter) => {
            const active = statusFilter === filter.id
            let badgeCount: number | undefined
            if (filter.id === 'pendientes' && typeof totalPending === 'number') {
              badgeCount = totalPending
            } else if (filter.id === 'urgentes' && typeof totalUrgent === 'number') {
              badgeCount = totalUrgent
            }

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onStatusFilterChange(filter.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer border ${
                  active
                    ? 'bg-cream text-charcoal border-border-tan shadow-xs'
                    : 'bg-white text-sage border-border-tan hover:text-brand hover:border-brand/30'
                }`}
              >
                <span>{filter.label}</span>
                {typeof badgeCount === 'number' && badgeCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[10px] font-extrabold ${
                      filter.id === 'urgentes'
                        ? 'bg-danger/15 text-danger'
                        : active
                        ? 'bg-brand text-white'
                        : 'bg-sage-soft text-brand'
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showDevSim && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSimMenuOpen((prev) => !prev)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 px-3 py-2 text-xs font-bold transition cursor-pointer"
                title="Simular eventos SignalR en tiempo real (desarrollo/QA)"
              >
                <span>⚡ Simular</span>
              </button>

              {isSimMenuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-30 cursor-default border-0 bg-transparent"
                    aria-label="Cerrar menú simulación"
                    onClick={() => setIsSimMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-40 w-64 bg-white rounded-xl shadow-lg border border-border-tan p-1.5 flex flex-col gap-1 text-xs">
                    <p className="px-2.5 py-1 text-[10px] font-bold text-sage uppercase tracking-wider">
                      Simulación SignalR §16
                    </p>
                    <button
                      type="button"
                      onClick={handleSimulateNewEscalation}
                      className="text-left px-2.5 py-2 rounded-lg hover:bg-bone text-charcoal font-medium transition cursor-pointer flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-terracotta shrink-0" />
                      <span>Nuevo escalamiento</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateIncomingMessage}
                      className="text-left px-2.5 py-2 rounded-lg hover:bg-bone text-charcoal font-medium transition cursor-pointer flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span>Mensaje entrante (hilo 1)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateResolution}
                      className="text-left px-2.5 py-2 rounded-lg hover:bg-bone text-charcoal font-medium transition cursor-pointer flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Escalamiento resuelto (1)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-border-tan text-brand hover:bg-sage-soft hover:border-brand/30 px-3.5 py-2 text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 disabled:opacity-50"
              title="Actualizar bandeja de escalamiento"
            >
              <ReloadIcon
                className={`w-4 h-4 text-brand ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>{isRefreshing ? 'Actualizando…' : 'Actualizar'}</span>
            </button>
          )}
        </div>
      </div>

      <label className="relative w-full min-w-0">
        <span className="sr-only">Buscar en conversaciones escaladas</span>
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por cliente, teléfono, motivo o último mensaje..."
          className="w-full rounded-xl border border-border-tan bg-white pl-10 pr-3 py-2.5 text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition shadow-[0_2px_12px_rgba(35,78,70,0.03)]"
        />
      </label>
    </div>
  )
}
