// Tipos y contratos para la bandeja de conversaciones escaladas y detalle de chat (Recepción / Asesor)

// ==========================================
// Contrato §4: Catálogos de Escalamiento y Chat
// ==========================================

export const ESCALATION_STATUS_GUIDS = {
  PENDING: 'd1a10001-0000-0000-0000-000000000001',
  IN_PROGRESS: 'd1a10001-0000-0000-0000-000000000002',
  RESOLVED: 'd1a10001-0000-0000-0000-000000000003',
  CANCELLED: 'd1a10001-0000-0000-0000-000000000004',
} as const

export const ESCALATION_STATUS_NAMES: Record<string, string> = {
  [ESCALATION_STATUS_GUIDS.PENDING]: 'Pendiente',
  [ESCALATION_STATUS_GUIDS.IN_PROGRESS]: 'En atención',
  [ESCALATION_STATUS_GUIDS.RESOLVED]: 'Resuelto',
  [ESCALATION_STATUS_GUIDS.CANCELLED]: 'Cancelado',
}

export const ESCALATION_PRIORITY_GUIDS = {
  LOW: 'd2b20002-0000-0000-0000-000000000001',
  MEDIUM: 'd2b20002-0000-0000-0000-000000000002',
  HIGH: 'd2b20002-0000-0000-0000-000000000003',
  URGENT: 'd2b20002-0000-0000-0000-000000000004',
} as const

export const ESCALATION_PRIORITY_NAMES: Record<string, string> = {
  [ESCALATION_PRIORITY_GUIDS.LOW]: 'Baja',
  [ESCALATION_PRIORITY_GUIDS.MEDIUM]: 'Media',
  [ESCALATION_PRIORITY_GUIDS.HIGH]: 'Alta',
  [ESCALATION_PRIORITY_GUIDS.URGENT]: 'Urgente',
}

export const SENDER_TYPE_GUIDS = {
  CLIENT: 'd3c30003-0000-0000-0000-000000000001',
  AI_AGENT: 'd3c30003-0000-0000-0000-000000000002',
  HUMAN_AGENT: 'd3c30003-0000-0000-0000-000000000003',
  SYSTEM: 'd3c30003-0000-0000-0000-000000000004',
} as const

export const SENDER_TYPE_NAMES: Record<string, string> = {
  [SENDER_TYPE_GUIDS.CLIENT]: 'Cliente',
  [SENDER_TYPE_GUIDS.AI_AGENT]: 'Agente IA',
  [SENDER_TYPE_GUIDS.HUMAN_AGENT]: 'Agente humano',
  [SENDER_TYPE_GUIDS.SYSTEM]: 'Sistema',
}

export const MESSAGE_TYPE_GUIDS = {
  TEXT: 'd4d40004-0000-0000-0000-000000000001',
} as const

export const MESSAGE_TYPE_NAMES: Record<string, string> = {
  [MESSAGE_TYPE_GUIDS.TEXT]: 'Texto',
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
export type EscalationStatus = 'Pendiente' | 'En atención' | 'Resuelto' | 'Cancelado'
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
