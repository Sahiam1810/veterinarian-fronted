// Tipos y contratos para la bandeja de conversaciones escaladas y detalle de chat (Recepción / Asesor)

// ==========================================
// Contrato §4 — GUIDs verificados directamente contra Oracle (VET_APP.SENDER_TYPES,
// .ESCALATIONS_STATUSES), no contra el documento de contrato. Nombres literales tal como están en BD.
// ==========================================

export const SENDER_TYPE_GUIDS = {
  CLIENT: '82000000-0000-0000-0000-000000000001',
  AI_AGENT: '82000000-0000-0000-0000-000000000002',
  HUMAN_AGENT: '82000000-0000-0000-0000-000000000003',
  SYSTEM: '82000000-0000-0000-0000-000000000004',
} as const

export const SENDER_TYPE_NAMES: Record<string, string> = {
  [SENDER_TYPE_GUIDS.CLIENT]: 'Cliente',
  [SENDER_TYPE_GUIDS.AI_AGENT]: 'Agente IA',
  [SENDER_TYPE_GUIDS.HUMAN_AGENT]: 'Agente humano',
  [SENDER_TYPE_GUIDS.SYSTEM]: 'Sistema',
}

export const ESCALATION_STATUS_GUIDS = {
  PENDING: '85000000-0000-0000-0000-000000000001',
  ASSIGNED: '85000000-0000-0000-0000-000000000002',
  IN_PROGRESS: '85000000-0000-0000-0000-000000000003',
  RESOLVED: '85000000-0000-0000-0000-000000000004',
  CANCELLED: '85000000-0000-0000-0000-000000000005',
} as const

export const ESCALATION_STATUS_NAMES: Record<string, string> = {
  [ESCALATION_STATUS_GUIDS.PENDING]: 'Pendiente',
  [ESCALATION_STATUS_GUIDS.ASSIGNED]: 'Asignada',
  [ESCALATION_STATUS_GUIDS.IN_PROGRESS]: 'En atención',
  [ESCALATION_STATUS_GUIDS.RESOLVED]: 'Resuelta',
  [ESCALATION_STATUS_GUIDS.CANCELLED]: 'Cancelada',
}

// ==========================================
// Contrato §6, §7, §8, §9, §12, §13: DTOs crudos del backend
// ==========================================

export interface ChatConversationResponseDto {
  id: string
  clientId?: string | null
  userId?: string | null
  channel?: string | null
  status?: string | null
  createdAt: string
  updatedAt?: string | null
  lastMessageAt?: string | null
  lastMessage?: string | null
  clientName?: string | null
  fullName?: string | null
  clientPhone?: string | null
  phoneNumber?: string | null
}

export interface ChatEscalationResponseDto {
  id: string
  chatConversationId: string
  escalationStatusId: string
  fromAi?: boolean
  reason?: string | null
  createdAt: string
  updateAt?: string | null
  status?: string | null
  assignedToId?: string | null
  resolvedAt?: string | null
  notes?: string | null
}

export interface ChatMessageResponseDto {
  id: string
  chatConversationId: string
  senderTypesId: string
  chatParticipantId?: string | null
  content: string
  metadata?: string | null
  createdAt: string
  senderName?: string | null
}

export interface CreateChatMessageRequestDto {
  chatConversationId: string
  chatParticipantId: string
  senderTypesId: string
  content: string
  metadata?: string | null
}

export interface AgentHumanResponseDto {
  id: string
  userId: string
  isActive: boolean
}

export interface CreateAgentHumanRequestDto {
  userId: string
}

export interface ChatParticipantResponseDto {
  id: string
  chatConversationId: string
  participantTypeId: string
  clientId?: string | null
  agentHumanId?: string | null
}

export interface CreateChatParticipantRequestDto {
  chatConversationId: string
  participantTypeId: string
  clientId?: string | null
  agentHumanId?: string | null
}

export interface CreateEscalationResolutionRequestDto {
  chatEscalationId: string
  resolvedBy?: string | null
  resolutionNote?: string | null
  resolvedAt?: string | null
}

export interface EscalationResolutionResponseDto {
  id: string
  chatEscalationId: string
  resolvedBy?: string | null
  resolutionNote?: string | null
  resolvedAt?: string | null
}

// ==========================================
// Tipos de presentación en la UI
// ==========================================

export type EscalationStatus = 'Pendiente' | 'Asignada' | 'En atención' | 'Resuelta' | 'Cancelada'
export type EscalationChannel = 'Telegram' | 'Web' | 'WhatsApp' | 'Otro'

export type EscalationStatusFilter = 'todos' | 'pendientes' | 'en_atencion'

// Cola de asesor (solo escaladas) vs bandeja completa de chat
export type ConversationsListMode = 'escaladas' | 'todas'

// Decoración visual en la bandeja "Todas" (no filtra la lista)
export type ConversationInboxBadge = 'esperando_asesor' | 'escalada'

export type MessageSenderRole = 'client' | 'ai_agent' | 'human_agent' | 'system'
export type MessageDeliveryStatus = 'sent' | 'sending' | 'error'

export interface ChatMessageItem {
  id: string
  conversationId: string
  senderTypeId: string
  senderRole: MessageSenderRole
  senderLabel: string
  senderName?: string | null
  content: string
  createdAt: string
  timeLabel: string
  status: MessageDeliveryStatus
  errorMessage?: string | null
}

export interface EscalatedConversationListItem {
  id: string
  conversationId: string
  // Null cuando la conversación nunca se escaló (vista "Todas")
  escalationId: string | null
  clientName: string
  clientPhone?: string | null
  channel: EscalationChannel
  channelRaw: string
  lastMessage: string
  lastMessageAt: string | null
  lastMessageTimeLabel: string
  waitingTimeLabel: string
  waitingMinutes: number
  status: EscalationStatus
  statusId?: string | null
  reason?: string | null
  createdAt: string
  assignedToId?: string | null
  // Solo vista "Todas": insignia Escalada / Esperando asesor
  inboxBadge?: ConversationInboxBadge | null
  // Solo vista "Todas": ids de todas las conversaciones del mismo cliente (antigua → reciente)
  relatedConversationIds?: string[]
}

export interface EscalacionesDirectoryPayload {
  items: EscalatedConversationListItem[]
  totalCount: number
  pendingCount: number
  inProgressCount: number
  pageStart: number
  pageEnd: number
}
