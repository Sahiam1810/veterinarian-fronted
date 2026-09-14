// Tipos y contratos para la bandeja de conversaciones escaladas y detalle de chat (Recepción / Asesor)

// ==========================================
// Contrato §4 — GUIDs verificados directamente contra Oracle (VET_APP.SENDER_TYPES,
// .ESCALATIONS_STATUSES, .PRIORITY, .MESSAGE_TYPES, .CONVERSATIONS_STATUSES),
// no contra el documento de contrato. Nombres literales tal como están en BD.
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

export const ESCALATION_PRIORITY_GUIDS = {
  LOW: '84000000-0000-0000-0000-000000000001',
  MEDIUM: '84000000-0000-0000-0000-000000000002',
  HIGH: '84000000-0000-0000-0000-000000000003',
  URGENT: '84000000-0000-0000-0000-000000000004',
} as const

export const ESCALATION_PRIORITY_NAMES: Record<string, string> = {
  [ESCALATION_PRIORITY_GUIDS.LOW]: 'Baja',
  [ESCALATION_PRIORITY_GUIDS.MEDIUM]: 'Media',
  [ESCALATION_PRIORITY_GUIDS.HIGH]: 'Alta',
  [ESCALATION_PRIORITY_GUIDS.URGENT]: 'Urgente',
}

export const MESSAGE_TYPE_GUIDS = {
  TEXT: '83000000-0000-0000-0000-000000000001',
  IMAGE: '83000000-0000-0000-0000-000000000002',
  AUDIO: '83000000-0000-0000-0000-000000000003',
  DOCUMENT: '83000000-0000-0000-0000-000000000004',
  SYSTEM: '83000000-0000-0000-0000-000000000005',
} as const

export const MESSAGE_TYPE_NAMES: Record<string, string> = {
  [MESSAGE_TYPE_GUIDS.TEXT]: 'Texto',
  [MESSAGE_TYPE_GUIDS.IMAGE]: 'Imagen',
  [MESSAGE_TYPE_GUIDS.AUDIO]: 'Audio',
  [MESSAGE_TYPE_GUIDS.DOCUMENT]: 'Documento',
  [MESSAGE_TYPE_GUIDS.SYSTEM]: 'Sistema',
}

// Solo por si la bandeja llega a necesitarlos (hoy la UI de Recepcionista usa
// ESCALATION_STATUS_GUIDS, no estos).
export const CONVERSATION_STATUS_GUIDS = {
  OPEN: '81000000-0000-0000-0000-000000000001',
  IN_PROGRESS: '81000000-0000-0000-0000-000000000002',
  ESCALATED: '81000000-0000-0000-0000-000000000003',
  CLOSED: '81000000-0000-0000-0000-000000000004',
} as const

export const CONVERSATION_STATUS_NAMES: Record<string, string> = {
  [CONVERSATION_STATUS_GUIDS.OPEN]: 'Abierta',
  [CONVERSATION_STATUS_GUIDS.IN_PROGRESS]: 'En atención',
  [CONVERSATION_STATUS_GUIDS.ESCALATED]: 'Escalada',
  [CONVERSATION_STATUS_GUIDS.CLOSED]: 'Cerrada',
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
  conversationId: string
  reason?: string | null
  priorityId?: string | null
  priority?: string | null
  statusId?: string | null
  status?: string | null
  assignedToId?: string | null
  createdAt: string
  resolvedAt?: string | null
  notes?: string | null
}

export interface ChatMessageResponseDto {
  id: string
  conversationId: string
  senderTypeId: string
  senderType?: string | null
  senderRole?: string | null
  senderName?: string | null
  participantId?: string | null
  messageTypeId?: string | null
  content: string
  createdAt: string
  isRead?: boolean
}

export interface CreateChatMessageRequestDto {
  conversationId: string
  participantId: string
  senderTypeId: string
  messageTypeId: string
  content: string
}

export interface AgentHumanResponseDto {
  id: string
  userId?: string | null
  name: string
  email?: string | null
  isActive: boolean
}

export interface CreateAgentHumanRequestDto {
  userId: string
  name: string
  email: string
}

export interface ChatParticipantResponseDto {
  id: string
  conversationId: string
  agentHumanId?: string | null
  clientId?: string | null
  role?: string | null
  joinedAt?: string
}

export interface CreateChatParticipantRequestDto {
  conversationId: string
  agentHumanId: string
  role: string
}

export interface CreateEscalationResolutionRequestDto {
  escalationId: string
  resolvedById?: string | null
  notes?: string | null
  statusId?: string
}

export interface EscalationResolutionResponseDto {
  id: string
  escalationId: string
  resolvedById?: string | null
  notes?: string | null
  resolvedAt: string
}

// ==========================================
// Tipos de presentación en la UI
// ==========================================

export type EscalationPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente' | 'Normal'
export type EscalationStatus = 'Pendiente' | 'Asignada' | 'En atención' | 'Resuelta' | 'Cancelada'
export type EscalationChannel = 'Telegram' | 'Web' | 'WhatsApp' | 'Otro'

export type EscalationStatusFilter = 'todos' | 'pendientes' | 'en_atencion' | 'urgentes'

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
  escalationId: string
  clientName: string
  clientPhone?: string | null
  channel: EscalationChannel
  channelRaw: string
  lastMessage: string
  lastMessageAt: string | null
  lastMessageTimeLabel: string
  waitingTimeLabel: string
  waitingMinutes: number
  priority: EscalationPriority
  priorityId?: string | null
  status: EscalationStatus
  statusId?: string | null
  reason?: string | null
  createdAt: string
  assignedToId?: string | null
}

export interface EscalacionesDirectoryPayload {
  items: EscalatedConversationListItem[]
  totalCount: number
  pendingCount: number
  inProgressCount: number
  urgentCount: number
  pageStart: number
  pageEnd: number
}
