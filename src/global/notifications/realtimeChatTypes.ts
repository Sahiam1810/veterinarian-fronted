/**
 * Tipos y validadores de eventos en tiempo real para Chat y Escalamiento
 * según el Contrato de API (§16).
 */

// 1. ChatEscalationCreated: Notifica a los agentes que una conversación requiere atención humana
export interface ChatEscalationCreatedPayload {
  escalationId: string
  conversationId: string
  clientId?: string | null
  clientName?: string | null
  clientPhone?: string | null
  reason?: string | null
  priority?: string | null
  status?: string | null
  channel?: string | null
  createdAt: string
  lastMessage?: string | null
}

// 2. ChatMessageReceived: Notifica la llegada de un nuevo mensaje en una conversación
export interface ChatMessageReceivedPayload {
  messageId: string
  conversationId: string
  senderType: string
  senderName?: string | null
  content: string
  sentAt: string
  messageType?: string | null
}

// 3. ChatEscalationResolved: Notifica que una conversación escalada ha sido resuelta
export interface ChatEscalationResolvedPayload {
  escalationId: string
  conversationId?: string | null
  resolvedBy?: string | null
  resolvedAt: string
  resolutionNotes?: string | null
}

/**
 * Validador y normalizador de payload para ChatEscalationCreated
 */
export function mapRealtimeChatEscalationCreated(raw: unknown): ChatEscalationCreatedPayload | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  const escalationId = typeof r.escalationId === 'string' ? r.escalationId.trim() : ''
  const conversationId = typeof r.conversationId === 'string' ? r.conversationId.trim() : ''

  if (!escalationId || !conversationId) return null

  return {
    escalationId,
    conversationId,
    clientId: typeof r.clientId === 'string' ? r.clientId : null,
    clientName: typeof r.clientName === 'string' ? r.clientName : null,
    clientPhone: typeof r.clientPhone === 'string' ? r.clientPhone : null,
    reason: typeof r.reason === 'string' ? r.reason : null,
    priority: typeof r.priority === 'string' ? r.priority : null,
    status: typeof r.status === 'string' ? r.status : null,
    channel: typeof r.channel === 'string' ? r.channel : null,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString(),
    lastMessage: typeof r.lastMessage === 'string' ? r.lastMessage : null,
  }
}

/**
 * Validador y normalizador de payload para ChatMessageReceived
 */
export function mapRealtimeChatMessageReceived(raw: unknown): ChatMessageReceivedPayload | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  const messageId = typeof r.messageId === 'string' ? r.messageId.trim() : ''
  const conversationId = typeof r.conversationId === 'string' ? r.conversationId.trim() : ''
  const content = typeof r.content === 'string' ? r.content : ''

  if (!messageId || !conversationId || !content.trim()) return null

  return {
    messageId,
    conversationId,
    senderType: typeof r.senderType === 'string' ? r.senderType : 'CLIENT',
    senderName: typeof r.senderName === 'string' ? r.senderName : null,
    content,
    sentAt: typeof r.sentAt === 'string' ? r.sentAt : new Date().toISOString(),
    messageType: typeof r.messageType === 'string' ? r.messageType : 'TEXT',
  }
}

/**
 * Validador y normalizador de payload para ChatEscalationResolved
 */
export function mapRealtimeChatEscalationResolved(raw: unknown): ChatEscalationResolvedPayload | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  const escalationId = typeof r.escalationId === 'string' ? r.escalationId.trim() : ''
  if (!escalationId) return null

  return {
    escalationId,
    conversationId: typeof r.conversationId === 'string' ? r.conversationId : null,
    resolvedBy: typeof r.resolvedBy === 'string' ? r.resolvedBy : null,
    resolvedAt: typeof r.resolvedAt === 'string' ? r.resolvedAt : new Date().toISOString(),
    resolutionNotes: typeof r.resolutionNotes === 'string' ? r.resolutionNotes : null,
  }
}
