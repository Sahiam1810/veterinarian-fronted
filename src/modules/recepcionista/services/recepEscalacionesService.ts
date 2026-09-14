import { apiClient } from '../../../services/apiClient.ts'
import type {
  ChatConversationResponseDto,
  ChatEscalationResponseDto,
  EscalatedConversationListItem,
  EscalacionesDirectoryPayload,
  EscalationChannel,
  EscalationPriority,
  EscalationStatus,
} from '../types/index.ts'
import {
  ESCALATION_PRIORITY_GUIDS,
  ESCALATION_PRIORITY_NAMES,
  ESCALATION_STATUS_GUIDS,
  ESCALATION_STATUS_NAMES,
} from '../types/index.ts'

/**
 * Flag para alternar entre datos mock (para pruebas mientras el backend responda 403 al Recepcionista)
 * y el endpoint real del backend.
 * 
 * Cambiar a false cuando el backend autorice el rol Recepcionista en /api/chat/*.
 */
export const USE_MOCK_ESCALATIONS = true

// =========================================================================
// Mappers y Helpers de tiempo y catálogos
// =========================================================================

export function resolveChannel(rawChannel?: string | null): EscalationChannel {
  const norm = (rawChannel || '').toLowerCase()
  if (norm.includes('telegram')) return 'Telegram'
  if (norm.includes('web')) return 'Web'
  if (norm.includes('whatsapp')) return 'WhatsApp'
  return 'Otro'
}

export function resolvePriority(
  priorityId?: string | null,
  rawPriorityName?: string | null,
): EscalationPriority {
  if (priorityId && ESCALATION_PRIORITY_NAMES[priorityId]) {
    return ESCALATION_PRIORITY_NAMES[priorityId] as EscalationPriority
  }
  const norm = (rawPriorityName || '').toLowerCase()
  if (norm.includes('urgente') || norm.includes('urgent')) return 'Urgente'
  if (norm.includes('alta') || norm.includes('high')) return 'Alta'
  if (norm.includes('media') || norm.includes('medium')) return 'Media'
  if (norm.includes('baja') || norm.includes('low')) return 'Baja'
  return 'Normal'
}

export function resolveStatus(
  statusId?: string | null,
  rawStatusName?: string | null,
): EscalationStatus {
  if (statusId && ESCALATION_STATUS_NAMES[statusId]) {
    return ESCALATION_STATUS_NAMES[statusId] as EscalationStatus
  }
  const norm = (rawStatusName || '').toLowerCase()
  if (norm.includes('progreso') || norm.includes('atencion') || norm.includes('in_progress')) {
    return 'En atención'
  }
  if (norm.includes('resuelto') || norm.includes('resolved')) {
    return 'Resuelto'
  }
  if (norm.includes('cancelado') || norm.includes('cancelled')) {
    return 'Cancelado'
  }
  return 'Pendiente'
}

export function formatWaitingTime(dateIso: string, now: Date = new Date()): { label: string; minutes: number } {
  try {
    const createdDate = new Date(dateIso)
    if (isNaN(createdDate.getTime())) {
      return { label: 'Hace un momento', minutes: 0 }
    }

    const diffMs = Math.max(0, now.getTime() - createdDate.getTime())
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) {
      return { label: 'Hace un momento', minutes: 0 }
    }
    if (diffMinutes < 60) {
      return { label: `Hace ${diffMinutes} min`, minutes: diffMinutes }
    }
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) {
      return { label: `Hace ${diffHours} h`, minutes: diffMinutes }
    }
    const diffDays = Math.floor(diffHours / 24)
    return { label: `Hace ${diffDays} d`, minutes: diffMinutes }
  } catch {
    return { label: 'Hace un momento', minutes: 0 }
  }
}

export function formatTimeLabel(dateIso?: string | null): string {
  if (!dateIso) return '--:--'
  try {
    const d = new Date(dateIso)
    if (isNaN(d.getTime())) return '--:--'
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch {
    return '--:--'
  }
}

// =========================================================================
// Transformación y Cruce de Conversaciones + Escalamientos
// =========================================================================

export function buildEscalatedDirectory(
  conversations: ChatConversationResponseDto[],
  escalations: ChatEscalationResponseDto[],
  now: Date = new Date(),
): EscalacionesDirectoryPayload {
  const convMap = new Map<string, ChatConversationResponseDto>()
  for (const conv of conversations) {
    convMap.set(conv.id, conv)
  }

  // Una conversación está en la bandeja si tiene un escalamiento sin resolución (§8)
  const activeEscalations = escalations.filter((esc) => {
    // Si ya está resuelto o cancelado, no está activa en la bandeja
    if (esc.resolvedAt) return false
    if (esc.statusId === ESCALATION_STATUS_GUIDS.RESOLVED || esc.statusId === ESCALATION_STATUS_GUIDS.CANCELLED) {
      return false
    }
    const statusNorm = (esc.status || '').toLowerCase()
    if (statusNorm === 'resuelto' || statusNorm === 'resolved' || statusNorm === 'cancelado') {
      return false
    }
    return true
  })

  const items: EscalatedConversationListItem[] = activeEscalations.map((esc) => {
    const conv = convMap.get(esc.conversationId)
    const clientName = conv?.clientName || conv?.fullName || 'Cliente sin nombre'
    const clientPhone = conv?.clientPhone || conv?.phoneNumber || null
    const channel = resolveChannel(conv?.channel)
    const priority = resolvePriority(esc.priorityId, esc.priority)
    const status = resolveStatus(esc.statusId, esc.status)
    const waiting = formatWaitingTime(esc.createdAt, now)
    const lastMessage = conv?.lastMessage || esc.reason || 'Solicita atención con un asesor.'
    const lastMessageAt = conv?.lastMessageAt || conv?.updatedAt || esc.createdAt
    const lastMessageTimeLabel = formatTimeLabel(lastMessageAt)

    return {
      id: esc.id,
      conversationId: esc.conversationId,
      escalationId: esc.id,
      clientName,
      clientPhone,
      channel,
      channelRaw: conv?.channel || 'web',
      lastMessage,
      lastMessageAt,
      lastMessageTimeLabel,
      waitingTimeLabel: waiting.label,
      waitingMinutes: waiting.minutes,
      priority,
      priorityId: esc.priorityId,
      status,
      statusId: esc.statusId,
      reason: esc.reason || null,
      createdAt: esc.createdAt,
      assignedToId: esc.assignedToId,
    }
  })

  // Ordenar por prioridad primero (Urgente > Alta > Media > Baja) o por tiempo de espera más largo (más urgente)
  items.sort((a, b) => {
    const priorityWeight: Record<EscalationPriority, number> = {
      Urgente: 4,
      Alta: 3,
      Media: 2,
      Normal: 1,
      Baja: 0,
    }
    const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority]
    if (weightDiff !== 0) return weightDiff
    return b.waitingMinutes - a.waitingMinutes
  })

  const pendingCount = items.filter((i) => i.status === 'Pendiente').length
  const inProgressCount = items.filter((i) => i.status === 'En atención').length
  const urgentCount = items.filter((i) => i.priority === 'Urgente' || i.priority === 'Alta').length

  return {
    items,
    totalCount: items.length,
    pendingCount,
    inProgressCount,
    urgentCount,
    pageStart: items.length > 0 ? 1 : 0,
    pageEnd: items.length,
  }
}

// =========================================================================
// Datos Mock (§6 y §8)
// =========================================================================

export function getMockEscalatedDirectory(now: Date = new Date()): EscalacionesDirectoryPayload {
  const m5 = new Date(now.getTime() - 5 * 60 * 1000).toISOString()
  const m18 = new Date(now.getTime() - 18 * 60 * 1000).toISOString()
  const m42 = new Date(now.getTime() - 42 * 60 * 1000).toISOString()
  const h2 = new Date(now.getTime() - 130 * 60 * 1000).toISOString()
  const h5 = new Date(now.getTime() - 310 * 60 * 1000).toISOString()

  const mockConversations: ChatConversationResponseDto[] = [
    {
      id: 'conv-001',
      clientId: 'cli-001',
      clientName: 'Carolina Martínez',
      clientPhone: '+57 312 456 7890',
      channel: 'telegram',
      status: 'Escalated',
      createdAt: m42,
      updatedAt: m5,
      lastMessageAt: m5,
      lastMessage: 'Mi perro Max está vomitando espuma blanca, necesito ayuda urgente por favor.',
    },
    {
      id: 'conv-002',
      clientId: 'cli-002',
      clientName: 'Andrés Felipe Gómez',
      clientPhone: '+57 300 987 6543',
      channel: 'web',
      status: 'Escalated',
      createdAt: m18,
      updatedAt: m18,
      lastMessageAt: m18,
      lastMessage: 'Hola, quiero reagendar la cirugía de mi gata para el viernes pero el bot no me da opción.',
    },
    {
      id: 'conv-003',
      clientId: null,
      clientName: null, // Prueba de "Cliente sin nombre"
      clientPhone: '+57 315 222 3344',
      channel: 'telegram',
      status: 'Escalated',
      createdAt: m42,
      updatedAt: m42,
      lastMessageAt: m42,
      lastMessage: 'Quiero saber los precios del plan de vacunación completa para cachorro.',
    },
    {
      id: 'conv-004',
      clientId: 'cli-004',
      clientName: 'Valentina Restrepo',
      clientPhone: '+57 318 765 4321',
      channel: 'web',
      status: 'Escalated',
      createdAt: h2,
      updatedAt: h2,
      lastMessageAt: h2,
      lastMessage: 'El medicamento recetado ayer le dio alergia a Toby. ¿Puedo suspenderlo?',
    },
    {
      id: 'conv-005',
      clientId: 'cli-005',
      clientName: 'Santiago Morales',
      clientPhone: '+57 311 555 6677',
      channel: 'telegram',
      status: 'Escalated',
      createdAt: h5,
      updatedAt: h5,
      lastMessageAt: h5,
      lastMessage: 'Buenas tardes, necesito copia de la historia clínica de Luna para viaje.',
    },
  ]

  const mockEscalations: ChatEscalationResponseDto[] = [
    {
      id: 'esc-001',
      conversationId: 'conv-001',
      reason: 'Urgencia médica - Paciente con síntomas agudos',
      priorityId: ESCALATION_PRIORITY_GUIDS.URGENT,
      statusId: ESCALATION_STATUS_GUIDS.PENDING,
      assignedToId: null,
      createdAt: m5,
      resolvedAt: null,
    },
    {
      id: 'esc-002',
      conversationId: 'conv-002',
      reason: 'Solicitud de reprogramación de cirugía',
      priorityId: ESCALATION_PRIORITY_GUIDS.HIGH,
      statusId: ESCALATION_STATUS_GUIDS.PENDING,
      assignedToId: null,
      createdAt: m18,
      resolvedAt: null,
    },
    {
      id: 'esc-003',
      conversationId: 'conv-003',
      reason: 'Consulta de tarifas y planes de vacunación',
      priorityId: ESCALATION_PRIORITY_GUIDS.LOW,
      statusId: ESCALATION_STATUS_GUIDS.PENDING,
      assignedToId: null,
      createdAt: m42,
      resolvedAt: null,
    },
    {
      id: 'esc-004',
      conversationId: 'conv-004',
      reason: 'Reacción adversa a medicamento prescrito',
      priorityId: ESCALATION_PRIORITY_GUIDS.HIGH,
      statusId: ESCALATION_STATUS_GUIDS.IN_PROGRESS,
      assignedToId: 'usr-recep-1',
      createdAt: h2,
      resolvedAt: null,
    },
    {
      id: 'esc-005',
      conversationId: 'conv-005',
      reason: 'Solicitud de copia de historia clínica',
      priorityId: ESCALATION_PRIORITY_GUIDS.MEDIUM,
      statusId: ESCALATION_STATUS_GUIDS.PENDING,
      assignedToId: null,
      createdAt: h5,
      resolvedAt: null,
    },
  ]

  return buildEscalatedDirectory(mockConversations, mockEscalations, now)
}

// =========================================================================
// Servicio Principal
// =========================================================================

export async function fetchEscalatedConversations(): Promise<EscalacionesDirectoryPayload> {
  if (USE_MOCK_ESCALATIONS) {
    // Simular leve latencia de red para UX natural
    await new Promise((resolve) => setTimeout(resolve, 200))
    return getMockEscalatedDirectory()
  }

  // Llamada al backend real
  const [convsRes, escalationsRes] = await Promise.all([
    apiClient.get<ChatConversationResponseDto[]>('/api/chat/conversations'),
    apiClient.get<ChatEscalationResponseDto[]>('/api/chat/escalations'),
  ])

  return buildEscalatedDirectory(convsRes || [], escalationsRes || [])
}
