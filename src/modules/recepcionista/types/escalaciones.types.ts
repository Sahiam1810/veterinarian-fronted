// Tipos y contratos para la bandeja de conversaciones escaladas (Recepción / Asesor)

// ==========================================
// Contrato §4: Catálogos de Escalamiento
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

// ==========================================
// Contrato §6 y §8: DTOs crudos del backend
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

// ==========================================
// Tipos de presentación en la UI
// ==========================================

export type EscalationPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente' | 'Normal'
export type EscalationStatus = 'Pendiente' | 'En atención' | 'Resuelto' | 'Cancelado'
export type EscalationChannel = 'Telegram' | 'Web' | 'WhatsApp' | 'Otro'

export type EscalationStatusFilter = 'todos' | 'pendientes' | 'en_atencion' | 'urgentes'

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
