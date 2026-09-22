import { apiClient } from '../../../services/apiClient.ts'
import { getStoredUser } from '../../auth/services/authService.ts'
import type {
  AgentHumanResponseDto,
  ChatConversationResponseDto,
  ChatEscalationResponseDto,
  ChatMessageItem,
  ChatMessageResponseDto,
  ChatParticipantResponseDto,
  CreateAgentHumanRequestDto,
  CreateChatMessageRequestDto,
  CreateChatParticipantRequestDto,
  CreateEscalationResolutionRequestDto,
  EscalatedConversationListItem,
  EscalacionesDirectoryPayload,
  EscalationChannel,
  EscalationPriority,
  ConversationInboxBadge,
  EscalationResolutionResponseDto,
  EscalationStatus,
  MessageDeliveryStatus,
  MessageSenderRole,
} from '../types/index.ts'
import {
  ESCALATION_PRIORITY_GUIDS,
  ESCALATION_PRIORITY_NAMES,
  ESCALATION_STATUS_GUIDS,
  ESCALATION_STATUS_NAMES,
  MESSAGE_TYPE_GUIDS,
  SENDER_TYPE_GUIDS,
} from '../types/index.ts'

/**
 * Flag para alternar entre datos mock (para pruebas mientras el backend responda 403 al Recepcionista)
 * y el endpoint real del backend.
 * 
 * Cambiar a false cuando el backend autorice el rol Recepcionista en /api/chat/*.
 */
export const USE_MOCK_ESCALATIONS = false

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
  const norm = `${priorityId || ''} ${rawPriorityName || ''}`.toLowerCase()
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
  const norm = `${statusId || ''} ${rawStatusName || ''}`.toLowerCase()
  if (norm.includes('asignada') || norm.includes('assigned')) {
    return 'Asignada'
  }
  // 'atenci' (sin tilde) hace match tanto contra "atención" como "atencion" —
  // evita depender de que el backend mande el tilde exacto.
  if (norm.includes('progreso') || norm.includes('atenci') || norm.includes('in_progress')) {
    return 'En atención'
  }
  // 'resuel'/'cancel' cubren las formas femenina y masculina ("Resuelta"/
  // "Resuelto", "Cancelada"/"Cancelado") con el mismo radical.
  if (norm.includes('resuel') || norm.includes('resolved')) {
    return 'Resuelta'
  }
  if (norm.includes('cancel')) {
    return 'Cancelada'
  }
  return 'Pendiente'
}

export function resolveSenderRole(
  senderTypeId?: string | null,
  rawSenderType?: string | null,
): MessageSenderRole {
  if (senderTypeId === SENDER_TYPE_GUIDS.CLIENT) return 'client'
  if (senderTypeId === SENDER_TYPE_GUIDS.AI_AGENT) return 'ai_agent'
  if (senderTypeId === SENDER_TYPE_GUIDS.HUMAN_AGENT) return 'human_agent'
  if (senderTypeId === SENDER_TYPE_GUIDS.SYSTEM) return 'system'

  const norm = (rawSenderType || '').toLowerCase()
  if (norm.includes('client') || norm.includes('cliente') || norm.includes('user')) return 'client'
  if (norm.includes('ai') || norm.includes('bot') || norm.includes('ia')) return 'ai_agent'
  if (norm.includes('human') || norm.includes('agent') || norm.includes('staff') || norm.includes('recep') || norm.includes('asesor')) {
    return 'human_agent'
  }
  if (norm.includes('system') || norm.includes('sistema')) return 'system'
  return 'client'
}

export function resolveSenderLabel(
  senderRole: MessageSenderRole,
  senderName?: string | null,
): string {
  if (senderName && senderName.trim()) return senderName.trim()
  if (senderRole === 'client') return 'Cliente'
  if (senderRole === 'ai_agent') return 'Asistente IA'
  if (senderRole === 'human_agent') return 'Asesor (Tú)'
  if (senderRole === 'system') return 'Sistema'
  return 'Remitente'
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

export function buildChatMessageItem(
  dto: ChatMessageResponseDto,
  status: MessageDeliveryStatus = 'sent',
): ChatMessageItem {
  const senderRole = resolveSenderRole(dto.senderTypesId, dto.senderName)
  const senderLabel = resolveSenderLabel(senderRole, dto.senderName)

  return {
    id: dto.id,
    conversationId: dto.chatConversationId,
    senderTypeId: dto.senderTypesId,
    senderRole,
    senderLabel,
    senderName: dto.senderName || null,
    content: dto.content,
    createdAt: dto.createdAt,
    timeLabel: formatTimeLabel(dto.createdAt),
    status,
  }
}

// =========================================================================
// Transformación y Cruce de Conversaciones + Escalamientos
// =========================================================================

// Ticket FE-6: criterio de orden de la bandeja confirmado como Opción A —
// prioridad primero (Urgente > Alta > Media > Baja/Normal), y dentro de la
// misma prioridad, el que lleva más tiempo esperando. Es el comportamiento
// típico de una cola de soporte: lo urgente y lo más viejo suben primero,
// sin importar cuándo llegó. Se usa tanto en la carga inicial (REST, vía
// buildEscalatedDirectory) como al insertar una fila nueva por SignalR
// (useRecepEscalaciones.ts) para que el orden no cambie según la fuente.
export function sortEscalatedConversationItems(
  items: EscalatedConversationListItem[],
): EscalatedConversationListItem[] {
  const priorityWeight: Record<EscalationPriority, number> = {
    Urgente: 4,
    Alta: 3,
    Media: 2,
    Normal: 1,
    Baja: 0,
  }

  return [...items].sort((a, b) => {
    const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority]
    if (weightDiff !== 0) return weightDiff
    return b.waitingMinutes - a.waitingMinutes
  })
}

// Escalamiento activo = sin resolución (cola de asesor)
export function isActiveEscalation(esc: ChatEscalationResponseDto): boolean {
  if (esc.resolvedAt) return false
  if (
    esc.escalationStatusId === ESCALATION_STATUS_GUIDS.RESOLVED ||
    esc.escalationStatusId === ESCALATION_STATUS_GUIDS.CANCELLED
  ) {
    return false
  }
  // Formas femenina ("Resuelta"/"Cancelada", como las manda el backend real)
  // y masculina, por si algún origen de datos las manda distinto.
  const statusNorm = (esc.status || '').toLowerCase()
  if (statusNorm.includes('resuel') || statusNorm === 'resolved' || statusNorm.includes('cancel')) {
    return false
  }
  return true
}

function mapEscalationRow(
  esc: ChatEscalationResponseDto,
  conv: ChatConversationResponseDto | undefined,
  now: Date,
): EscalatedConversationListItem {
  const clientName = conv?.clientName || conv?.fullName || 'Cliente sin nombre'
  const clientPhone = conv?.clientPhone || conv?.phoneNumber || null
  const channel = resolveChannel(conv?.channel)
  const priority = resolvePriority(esc.priorityId, esc.priority)
  const status = resolveStatus(esc.escalationStatusId, esc.status)
  const waiting = formatWaitingTime(esc.createdAt, now)
  const lastMessage = conv?.lastMessage || esc.reason || 'Solicita atención con un asesor.'
  const lastMessageAt = conv?.lastMessageAt || conv?.updatedAt || esc.createdAt
  const lastMessageTimeLabel = formatTimeLabel(lastMessageAt)
  const inboxBadge: ConversationInboxBadge =
    status === 'Pendiente' || status === 'Asignada' ? 'esperando_asesor' : 'escalada'

  return {
    id: esc.id,
    conversationId: esc.chatConversationId,
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
    statusId: esc.escalationStatusId,
    reason: esc.reason || null,
    createdAt: esc.createdAt,
    assignedToId: esc.assignedToId,
    inboxBadge,
  }
}

export function buildEscalatedDirectory(
  conversations: ChatConversationResponseDto[],
  escalations: ChatEscalationResponseDto[],
  now: Date = new Date(),
): EscalacionesDirectoryPayload {
  const convMap = new Map<string, ChatConversationResponseDto>()
  for (const conv of conversations) {
    convMap.set(conv.id, conv)
  }

  const activeEscalations = escalations.filter(isActiveEscalation)
  const items: EscalatedConversationListItem[] = activeEscalations.map((esc) =>
    mapEscalationRow(esc, convMap.get(esc.chatConversationId), now),
  )

  const sortedItems = sortEscalatedConversationItems(items)

  const pendingCount = sortedItems.filter((i) => i.status === 'Pendiente').length
  const inProgressCount = sortedItems.filter((i) => i.status === 'En atención').length
  const urgentCount = sortedItems.filter((i) => i.priority === 'Urgente' || i.priority === 'Alta').length

  return {
    items: sortedItems,
    totalCount: sortedItems.length,
    pendingCount,
    inProgressCount,
    urgentCount,
    pageStart: sortedItems.length > 0 ? 1 : 0,
    pageEnd: sortedItems.length,
  }
}

// Vista "Todas": una fila por conversación; escalations solo decoran la insignia
export function buildAllConversationsDirectory(
  conversations: ChatConversationResponseDto[],
  escalations: ChatEscalationResponseDto[],
  now: Date = new Date(),
): EscalacionesDirectoryPayload {
  const activeByConv = new Map<string, ChatEscalationResponseDto>()
  for (const esc of escalations) {
    if (!isActiveEscalation(esc)) continue
    const prev = activeByConv.get(esc.chatConversationId)
    if (!prev || new Date(esc.createdAt).getTime() > new Date(prev.createdAt).getTime()) {
      activeByConv.set(esc.chatConversationId, esc)
    }
  }

  const items: EscalatedConversationListItem[] = conversations.map((conv) => {
    const esc = activeByConv.get(conv.id)
    if (esc) {
      const row = mapEscalationRow(esc, conv, now)
      // En bandeja completa el id estable es la conversación (abrir hilo)
      return { ...row, id: conv.id }
    }

    const clientName = conv.clientName || conv.fullName || 'Cliente sin nombre'
    const clientPhone = conv.clientPhone || conv.phoneNumber || null
    const channel = resolveChannel(conv.channel)
    const activityAt = conv.lastMessageAt || conv.updatedAt || conv.createdAt
    const waiting = formatWaitingTime(activityAt, now)

    return {
      id: conv.id,
      conversationId: conv.id,
      escalationId: null,
      clientName,
      clientPhone,
      channel,
      channelRaw: conv.channel || 'web',
      lastMessage: conv.lastMessage || 'Sin mensajes aún.',
      lastMessageAt: activityAt,
      lastMessageTimeLabel: formatTimeLabel(activityAt),
      waitingTimeLabel: waiting.label,
      waitingMinutes: waiting.minutes,
      priority: 'Normal',
      priorityId: null,
      status: 'Pendiente',
      statusId: null,
      reason: null,
      createdAt: conv.createdAt,
      assignedToId: null,
      inboxBadge: null,
    }
  })

  // Más recientes primero (bandeja de chat, no cola de prioridad)
  const sortedItems = [...items].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return bTime - aTime
  })

  const escalatedOnly = sortedItems.filter((i) => Boolean(i.escalationId))
  const pendingCount = escalatedOnly.filter((i) => i.status === 'Pendiente').length
  const inProgressCount = escalatedOnly.filter((i) => i.status === 'En atención').length
  const urgentCount = escalatedOnly.filter(
    (i) => i.priority === 'Urgente' || i.priority === 'Alta',
  ).length

  return {
    items: sortedItems,
    totalCount: sortedItems.length,
    pendingCount,
    inProgressCount,
    urgentCount,
    pageStart: sortedItems.length > 0 ? 1 : 0,
    pageEnd: sortedItems.length,
  }
}

// =========================================================================
// Estado y Almacenamiento Mock en Memoria
// =========================================================================

const mockResolvedEscalationIds = new Set<string>()

const initialMockThreads: Record<string, ChatMessageResponseDto[]> = {
  'conv-001': [
    {
      id: 'msg-101',
      chatConversationId: 'conv-001',
      senderTypesId: SENDER_TYPE_GUIDS.CLIENT,
      senderName: 'Carolina Martínez',
      content: 'Hola buenas tardes, mi perro Max empezó a vomitar espuma blanca hace 20 minutos.',
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-102',
      chatConversationId: 'conv-001',
      senderTypesId: SENDER_TYPE_GUIDS.AI_AGENT,
      senderName: 'Huellitas Bot',
      content: 'Hola Carolina. Lamento escuchar eso. ¿Max ha ingerido algún objeto extraño, planta o medicamento?',
      createdAt: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-103',
      chatConversationId: 'conv-001',
      senderTypesId: SENDER_TYPE_GUIDS.CLIENT,
      senderName: 'Carolina Martínez',
      content: 'No estoy segura, pero está muy decaído y tiembla. Necesito hablar con un asesor o doctor ya por favor.',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-104',
      chatConversationId: 'conv-001',
      senderTypesId: SENDER_TYPE_GUIDS.SYSTEM,
      content: 'Conversación escalada a atención humana prioritaria por urgencia médica.',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
  'conv-002': [
    {
      id: 'msg-201',
      chatConversationId: 'conv-002',
      senderTypesId: SENDER_TYPE_GUIDS.CLIENT,
      senderName: 'Andrés Gómez',
      content: 'Hola, tengo una cirugía programada para mi gata Misi este miércoles.',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-202',
      chatConversationId: 'conv-002',
      senderTypesId: SENDER_TYPE_GUIDS.AI_AGENT,
      senderName: 'Huellitas Bot',
      content: 'Hola Andrés. Veo tu cita de esterilización el Miércoles 16 a las 09:00 AM. ¿En qué te puedo ayudar?',
      createdAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    },
    {
      id: 'conv-203',
      chatConversationId: 'conv-002',
      senderTypesId: SENDER_TYPE_GUIDS.CLIENT,
      senderName: 'Andrés Gómez',
      content: 'Quiero reagendarla para el viernes pero el bot no me da cupo en esa fecha. Asesor por favor.',
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
    {
      id: 'conv-204',
      chatConversationId: 'conv-002',
      senderTypesId: SENDER_TYPE_GUIDS.SYSTEM,
      content: 'Conversación transferida a Recepción.',
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
  ],
  'conv-004': [
    {
      id: 'msg-401',
      chatConversationId: 'conv-004',
      senderTypesId: SENDER_TYPE_GUIDS.CLIENT,
      senderName: 'Valentina Restrepo',
      content: 'El medicamento recetado ayer le dio alergia a Toby. ¿Puedo suspenderlo?',
      createdAt: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-402',
      chatConversationId: 'conv-004',
      senderTypesId: SENDER_TYPE_GUIDS.HUMAN_AGENT,
      senderName: 'Carlos Méndez (Recepción)',
      content: 'Hola Valentina, por seguridad suspende la dosis mientras contacto al Dr. Silva.',
      createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    },
  ],
  'conv-005': [
    {
      id: 'msg-501',
      chatConversationId: 'conv-005',
      senderTypesId: SENDER_TYPE_GUIDS.CLIENT,
      senderName: 'Santiago Morales',
      content: 'Buenas tardes, necesito copia de la historia clínica de Luna para viaje.',
      createdAt: new Date(Date.now() - 310 * 60 * 1000).toISOString(),
    },
  ],
}

const mockThreadStore = new Map<string, ChatMessageResponseDto[]>(
  Object.entries(initialMockThreads),
)

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
      clientName: null,
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
      chatConversationId: 'conv-001',
      reason: 'Urgencia médica - Paciente con síntomas agudos',
      priorityId: ESCALATION_PRIORITY_GUIDS.URGENT,
      escalationStatusId: ESCALATION_STATUS_GUIDS.PENDING,
      assignedToId: null,
      createdAt: m5,
      resolvedAt: null,
    },
    {
      id: 'esc-002',
      chatConversationId: 'conv-002',
      reason: 'Solicitud de reprogramación de cirugía',
      priorityId: ESCALATION_PRIORITY_GUIDS.HIGH,
      escalationStatusId: ESCALATION_STATUS_GUIDS.PENDING,
      assignedToId: null,
      createdAt: m18,
      resolvedAt: null,
    },
    {
      id: 'esc-003',
      chatConversationId: 'conv-003',
      reason: 'Consulta de tarifas y planes de vacunación',
      priorityId: ESCALATION_PRIORITY_GUIDS.LOW,
      escalationStatusId: ESCALATION_STATUS_GUIDS.PENDING,
      assignedToId: null,
      createdAt: m42,
      resolvedAt: null,
    },
    {
      id: 'esc-004',
      chatConversationId: 'conv-004',
      reason: 'Reacción adversa a medicamento prescrito',
      priorityId: ESCALATION_PRIORITY_GUIDS.HIGH,
      escalationStatusId: ESCALATION_STATUS_GUIDS.IN_PROGRESS,
      assignedToId: 'usr-recep-1',
      createdAt: h2,
      resolvedAt: null,
    },
    {
      id: 'esc-005',
      chatConversationId: 'conv-005',
      reason: 'Solicitud de copia de historia clínica',
      priorityId: ESCALATION_PRIORITY_GUIDS.MEDIUM,
      escalationStatusId: ESCALATION_STATUS_GUIDS.PENDING,
      assignedToId: null,
      createdAt: h5,
      resolvedAt: null,
    },
  ].filter((esc) => !mockResolvedEscalationIds.has(esc.id))

  return buildEscalatedDirectory(mockConversations, mockEscalations, now)
}

export function getMockAllConversationsDirectory(now: Date = new Date()): EscalacionesDirectoryPayload {
  const escalated = getMockEscalatedDirectory(now)
  const m10 = new Date(now.getTime() - 10 * 60 * 1000).toISOString()
  // Conversación solo con el bot: nunca pedió asesor
  const botOnly: EscalatedConversationListItem = {
    id: 'conv-bot-001',
    conversationId: 'conv-bot-001',
    escalationId: null,
    clientName: 'Laura BotDemo',
    clientPhone: '+57 300 111 2233',
    channel: 'Telegram',
    channelRaw: 'telegram',
    lastMessage: '¿Cuál es el horario de vacunación los sábados?',
    lastMessageAt: m10,
    lastMessageTimeLabel: formatTimeLabel(m10),
    waitingTimeLabel: formatWaitingTime(m10, now).label,
    waitingMinutes: formatWaitingTime(m10, now).minutes,
    priority: 'Normal',
    priorityId: null,
    status: 'Pendiente',
    statusId: null,
    reason: null,
    createdAt: m10,
    assignedToId: null,
    inboxBadge: null,
  }

  return buildAllConversationsDirectory(
    [
      ...escalated.items.map((item) => ({
        id: item.conversationId,
        clientName: item.clientName,
        clientPhone: item.clientPhone,
        channel: item.channelRaw,
        createdAt: item.createdAt,
        lastMessageAt: item.lastMessageAt,
        lastMessage: item.lastMessage,
      })),
      {
        id: botOnly.conversationId,
        clientName: botOnly.clientName,
        clientPhone: botOnly.clientPhone,
        channel: botOnly.channelRaw,
        createdAt: botOnly.createdAt,
        lastMessageAt: botOnly.lastMessageAt,
        lastMessage: botOnly.lastMessage,
      },
    ],
    escalated.items
      .filter((i) => i.escalationId)
      .map((i) => ({
        id: i.escalationId!,
        chatConversationId: i.conversationId,
        reason: i.reason,
        priorityId: i.priorityId || ESCALATION_PRIORITY_GUIDS.MEDIUM,
        escalationStatusId: i.statusId || ESCALATION_STATUS_GUIDS.PENDING,
        assignedToId: i.assignedToId,
        createdAt: i.createdAt,
        resolvedAt: null,
        status: i.status,
      })),
    now,
  )
}

// =========================================================================
// Caché en Memoria para Flujo de 3 Pasos (§14)
// =========================================================================

let cachedAgentHumanId: string | null = null
const cachedParticipantByConv = new Map<string, string>()

export function clearAgentHumanCache(): void {
  cachedAgentHumanId = null
  cachedParticipantByConv.clear()
}

/**
 * Paso 1 (§14): Obtener o registrar AgentHuman para el usuario en sesión
 */
async function resolveAgentHumanId(): Promise<string> {
  if (cachedAgentHumanId) return cachedAgentHumanId

  const user = getStoredUser()
  const userId = user?.id || user?.personId || user?.userAccountId || 'unknown-user'

  try {
    // Ticket FE-7: lookup directo por usuario — la lista completa
    // (GET /api/chat/agent-humans) ni siquiera trae email, así que el match
    // por email nunca podía funcionar contra el backend real.
    const existing = await apiClient.get<AgentHumanResponseDto[]>(
      `/api/chat/agent-humans/by-user/${userId}`,
    )
    const match = existing?.[0]
    if (match?.id) {
      cachedAgentHumanId = match.id
      return match.id
    }
  } catch {
    // Si falla la consulta, procedemos al POST
  }

  const created = await apiClient.post<AgentHumanResponseDto>('/api/chat/agent-humans', {
    userId,
  } satisfies CreateAgentHumanRequestDto)

  cachedAgentHumanId = created.id
  return created.id
}

/**
 * Paso 2 (§14): Obtener o registrar ChatParticipant para la conversación
 */
async function resolveChatParticipantId(
  conversationId: string,
  agentHumanId: string,
): Promise<string> {
  if (cachedParticipantByConv.has(conversationId)) {
    return cachedParticipantByConv.get(conversationId)!
  }

  try {
    // Ticket FE-7: la ruta real es /conversation/{chatConversationId} (path
    // param) — no existe un GET base con ?conversationId= como query string.
    const existing = await apiClient.get<ChatParticipantResponseDto[]>(
      `/api/chat/participants/conversation/${conversationId}`,
    )
    const match = existing?.find((p) => p.agentHumanId === agentHumanId)
    if (match?.id) {
      cachedParticipantByConv.set(conversationId, match.id)
      return match.id
    }
  } catch {
    // Proceder a crear si no existe
  }

  const created = await apiClient.post<ChatParticipantResponseDto>('/api/chat/participants', {
    chatConversationId: conversationId,
    participantTypeId: SENDER_TYPE_GUIDS.HUMAN_AGENT,
    agentHumanId,
  } satisfies CreateChatParticipantRequestDto)

  cachedParticipantByConv.set(conversationId, created.id)
  return created.id
}

// =========================================================================
// Servicios Principales
// =========================================================================

/**
 * Obtiene la lista de conversaciones escaladas activas
 */
export async function fetchEscalatedConversations(): Promise<EscalacionesDirectoryPayload> {
  if (USE_MOCK_ESCALATIONS) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return getMockEscalatedDirectory()
  }

  const [convsRes, escalationsRes] = await Promise.all([
    apiClient.get<ChatConversationResponseDto[]>('/api/chat/conversations'),
    apiClient.get<ChatEscalationResponseDto[]>('/api/chat/escalations'),
  ])

  return buildEscalatedDirectory(convsRes || [], escalationsRes || [])
}

/**
 * Todas las conversaciones del chat (sin filtrar por escalamiento).
 * /api/chat/escalations solo decora la insignia Escalada / Esperando asesor.
 */
export async function fetchAllConversations(): Promise<EscalacionesDirectoryPayload> {
  if (USE_MOCK_ESCALATIONS) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return getMockAllConversationsDirectory()
  }

  const [convsRes, escalationsRes] = await Promise.all([
    apiClient.get<ChatConversationResponseDto[]>('/api/chat/conversations'),
    apiClient.get<ChatEscalationResponseDto[]>('/api/chat/escalations'),
  ])

  return buildAllConversationsDirectory(convsRes || [], escalationsRes || [])
}

/**
 * Obtiene el hilo de mensajes de una conversación (§7)
 */
export async function fetchConversationThread(
  conversationId: string,
): Promise<ChatMessageItem[]> {
  if (!conversationId) return []

  if (USE_MOCK_ESCALATIONS) {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const rawList = mockThreadStore.get(conversationId) || []
    return rawList
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((m) => buildChatMessageItem(m))
  }

  // Llamada al backend real
  const messagesDto = await apiClient.get<ChatMessageResponseDto[]>(
    `/api/chat/messages/conversation/${conversationId}`,
  )

  if (!Array.isArray(messagesDto)) return []

  return messagesDto
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((m) => buildChatMessageItem(m))
}

/**
 * Envía una respuesta de agente humano siguiendo el flujo de 3 pasos (§14)
 */
export async function sendAgentMessage(
  conversationId: string,
  content: string,
): Promise<ChatMessageItem> {
  const cleanContent = (content || '').trim()
  if (!cleanContent) {
    throw new Error('El mensaje no puede estar vacío.')
  }

  if (USE_MOCK_ESCALATIONS) {
    await new Promise((resolve) => setTimeout(resolve, 250))
    const user = getStoredUser()
    const senderName = user?.name ? `${user.name} (Asesor)` : 'Asesor (Tú)'

    const newDto: ChatMessageResponseDto = {
      id: `msg-mock-${Date.now()}`,
      chatConversationId: conversationId,
      senderTypesId: SENDER_TYPE_GUIDS.HUMAN_AGENT,
      senderName,
      messageTypeId: MESSAGE_TYPE_GUIDS.TEXT,
      content: cleanContent,
      createdAt: new Date().toISOString(),
    }

    const currentThread = mockThreadStore.get(conversationId) || []
    mockThreadStore.set(conversationId, [...currentThread, newDto])

    return buildChatMessageItem(newDto, 'sent')
  }

  // Flujo real de 3 pasos (§14)
  const agentHumanId = await resolveAgentHumanId()
  const participantId = await resolveChatParticipantId(conversationId, agentHumanId)

  const createdDto = await apiClient.post<ChatMessageResponseDto>('/api/chat/messages', {
    chatConversationId: conversationId,
    chatParticipantId: participantId,
    senderTypesId: SENDER_TYPE_GUIDS.HUMAN_AGENT,
    messageTypeId: MESSAGE_TYPE_GUIDS.TEXT,
    content: cleanContent,
  } satisfies CreateChatMessageRequestDto)

  return buildChatMessageItem(createdDto, 'sent')
}

/**
 * Resuelve una conversación escalada (§9 y §15)
 */
export async function resolveConversation(
  escalationId: string,
  notes?: string,
): Promise<EscalationResolutionResponseDto> {
  if (!escalationId) {
    throw new Error('Identificador de escalamiento no válido.')
  }

  if (USE_MOCK_ESCALATIONS) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    mockResolvedEscalationIds.add(escalationId)

    const user = getStoredUser()
    return {
      id: `res-${Date.now()}`,
      chatEscalationId: escalationId,
      resolvedBy: user?.id || 'usr-recep-1',
      resolutionNote: notes?.trim() || null,
      resolvedAt: new Date().toISOString(),
    }
  }

  const user = getStoredUser()
  // Ticket FE-7: el backend real no tiene un campo de estado en este POST —
  // resolver es crear la fila de resolución, no mandar un statusId.
  return apiClient.post<EscalationResolutionResponseDto>(
    '/api/chat/escalation-resolutions',
    {
      chatEscalationId: escalationId,
      resolvedBy: user?.id,
      resolutionNote: notes?.trim() || null,
    } satisfies CreateEscalationResolutionRequestDto,
  )
}
