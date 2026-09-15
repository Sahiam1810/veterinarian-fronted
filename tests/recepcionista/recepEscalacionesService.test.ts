import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildEscalatedDirectory,
  formatWaitingTime,
  resolveChannel,
  resolvePriority,
  resolveStatus,
  sortEscalatedConversationItems,
  fetchEscalatedConversations,
  USE_MOCK_ESCALATIONS,
} from '../../src/modules/recepcionista/services/recepEscalacionesService.ts'
import {
  ESCALATION_PRIORITY_GUIDS,
  ESCALATION_STATUS_GUIDS,
  type ChatConversationResponseDto,
  type ChatEscalationResponseDto,
  type EscalatedConversationListItem,
} from '../../src/modules/recepcionista/types/escalaciones.types.ts'
import { RECEP_NAV_CATALOG } from '../../src/global/navigation/roles/recepcionista.ts'
import { resolveNavCatalog } from '../../src/global/navigation/resolveNav.ts'

test('resolveChannel identifica Telegram, Web y otros canales', () => {
  assert.equal(resolveChannel('telegram'), 'Telegram')
  assert.equal(resolveChannel('TELEGRAM'), 'Telegram')
  assert.equal(resolveChannel('web'), 'Web')
  assert.equal(resolveChannel('WEB_CHAT'), 'Web')
  assert.equal(resolveChannel('whatsapp'), 'WhatsApp')
  assert.equal(resolveChannel(null), 'Otro')
  assert.equal(resolveChannel(undefined), 'Otro')
})

test('resolvePriority resuelve GUIDs del contrato §4 y nombres fallback', () => {
  assert.equal(resolvePriority(ESCALATION_PRIORITY_GUIDS.URGENT), 'Urgente')
  assert.equal(resolvePriority(ESCALATION_PRIORITY_GUIDS.HIGH), 'Alta')
  assert.equal(resolvePriority(ESCALATION_PRIORITY_GUIDS.MEDIUM), 'Media')
  assert.equal(resolvePriority(ESCALATION_PRIORITY_GUIDS.LOW), 'Baja')
  assert.equal(resolvePriority(null, 'urgente'), 'Urgente')
  assert.equal(resolvePriority(null, 'alta'), 'Alta')
  assert.equal(resolvePriority(null, null), 'Normal')
})

test('resolveStatus resuelve GUIDs del contrato §4 y nombres fallback', () => {
  assert.equal(resolveStatus(ESCALATION_STATUS_GUIDS.PENDING), 'Pendiente')
  assert.equal(resolveStatus(ESCALATION_STATUS_GUIDS.ASSIGNED), 'Asignada')
  assert.equal(resolveStatus(ESCALATION_STATUS_GUIDS.IN_PROGRESS), 'En atención')
  assert.equal(resolveStatus(ESCALATION_STATUS_GUIDS.RESOLVED), 'Resuelta')
  assert.equal(resolveStatus(ESCALATION_STATUS_GUIDS.CANCELLED), 'Cancelada')
  assert.equal(resolveStatus(null, 'in_progress'), 'En atención')
  assert.equal(resolveStatus(null, null), 'Pendiente')
})

test('resolveStatus reconoce los nombres literales reales de BD, con o sin tilde', () => {
  // FE-4: "En atención" es el nombre literal que manda el backend real — antes
  // el fallback solo buscaba 'atencion' (sin tilde) y nunca hacía match.
  assert.equal(resolveStatus(null, 'En atención'), 'En atención')
  assert.equal(resolveStatus(null, 'en atencion'), 'En atención')
  assert.equal(resolveStatus(null, 'Asignada'), 'Asignada')
  assert.equal(resolveStatus(null, 'Resuelta'), 'Resuelta')
  assert.equal(resolveStatus(null, 'Cancelada'), 'Cancelada')
})

test('formatWaitingTime calcula correctamente minutos, horas y días', () => {
  const now = new Date('2026-09-14T12:00:00.000Z')
  
  // 3 minutos antes
  const m3 = new Date('2026-09-14T11:57:00.000Z').toISOString()
  assert.equal(formatWaitingTime(m3, now).label, 'Hace 3 min')
  assert.equal(formatWaitingTime(m3, now).minutes, 3)

  // Menos de 1 minuto
  const sec30 = new Date('2026-09-14T11:59:40.000Z').toISOString()
  assert.equal(formatWaitingTime(sec30, now).label, 'Hace un momento')

  // 2 horas antes
  const h2 = new Date('2026-09-14T10:00:00.000Z').toISOString()
  assert.equal(formatWaitingTime(h2, now).label, 'Hace 2 h')

  // 2 días antes
  const d2 = new Date('2026-09-12T12:00:00.000Z').toISOString()
  assert.equal(formatWaitingTime(d2, now).label, 'Hace 2 d')
})

test('sortEscalatedConversationItems ordena por prioridad y luego por tiempo de espera (Ticket FE-6, Opción A)', () => {
  const baseItem: EscalatedConversationListItem = {
    id: 'base',
    conversationId: 'conv-base',
    escalationId: 'esc-base',
    clientName: 'Cliente',
    clientPhone: null,
    channel: 'Telegram',
    channelRaw: 'telegram',
    lastMessage: 'Hola',
    lastMessageAt: new Date().toISOString(),
    lastMessageTimeLabel: '10:00',
    waitingTimeLabel: '',
    waitingMinutes: 0,
    priority: 'Normal',
    priorityId: null,
    status: 'Pendiente',
    statusId: null,
    reason: null,
    createdAt: new Date().toISOString(),
  }

  const items: EscalatedConversationListItem[] = [
    { ...baseItem, id: 'media-espera-larga', priority: 'Media', waitingMinutes: 120 },
    { ...baseItem, id: 'urgente-espera-corta', priority: 'Urgente', waitingMinutes: 1 },
    { ...baseItem, id: 'alta-espera-media', priority: 'Alta', waitingMinutes: 30 },
    { ...baseItem, id: 'urgente-espera-larga', priority: 'Urgente', waitingMinutes: 90 },
    { ...baseItem, id: 'baja-espera-larguisima', priority: 'Baja', waitingMinutes: 500 },
  ]

  const sorted = sortEscalatedConversationItems(items)

  assert.deepEqual(
    sorted.map((i) => i.id),
    [
      'urgente-espera-larga', // Urgente, y entre los dos Urgente, el que más espera
      'urgente-espera-corta',
      'alta-espera-media',
      'media-espera-larga',
      'baja-espera-larguisima', // Baja, aunque sea el que más lleva esperando de todos
    ],
  )

  // No muta el array original — buildEscalatedDirectory y el reducer de
  // tiempo real dependen de que devuelva una copia nueva.
  assert.equal(items[0]?.id, 'media-espera-larga')
})

test('buildEscalatedDirectory cruza conversaciones y escalamientos activos excluyendo resueltos', () => {
  const now = new Date('2026-09-14T12:00:00.000Z')
  
  const conversations: ChatConversationResponseDto[] = [
    {
      id: 'conv-1',
      clientName: 'María García',
      clientPhone: '3001234567',
      channel: 'telegram',
      createdAt: '2026-09-14T11:00:00.000Z',
      lastMessage: 'Necesito hablar con un veterinario urgente',
    },
    {
      id: 'conv-2',
      clientName: null, // Sin nombre -> fallback a "Cliente sin nombre"
      channel: 'web',
      createdAt: '2026-09-14T11:30:00.000Z',
      lastMessage: 'Información sobre precios',
    },
    {
      id: 'conv-3',
      clientName: 'Juan Pérez',
      channel: 'telegram',
      createdAt: '2026-09-14T09:00:00.000Z',
      lastMessage: 'Ya me atendieron, gracias',
    },
  ]

  const escalations: ChatEscalationResponseDto[] = [
    {
      id: 'esc-1',
      chatConversationId: 'conv-1',
      reason: 'Urgencia médica',
      priorityId: ESCALATION_PRIORITY_GUIDS.URGENT,
      escalationStatusId: ESCALATION_STATUS_GUIDS.PENDING,
      createdAt: '2026-09-14T11:00:00.000Z',
      resolvedAt: null,
    },
    {
      id: 'esc-2',
      chatConversationId: 'conv-2',
      reason: 'Consulta general',
      priorityId: ESCALATION_PRIORITY_GUIDS.LOW,
      escalationStatusId: ESCALATION_STATUS_GUIDS.IN_PROGRESS,
      createdAt: '2026-09-14T11:30:00.000Z',
      resolvedAt: null,
    },
    {
      id: 'esc-3',
      chatConversationId: 'conv-3',
      reason: 'Consulta resuelta',
      priorityId: ESCALATION_PRIORITY_GUIDS.LOW,
      escalationStatusId: ESCALATION_STATUS_GUIDS.RESOLVED,
      createdAt: '2026-09-14T09:00:00.000Z',
      resolvedAt: '2026-09-14T10:00:00.000Z', // Resuelto -> debe ser ignorado
    },
  ]

  const payload = buildEscalatedDirectory(conversations, escalations, now)

  assert.equal(payload.totalCount, 2)
  assert.equal(payload.items.length, 2)
  
  // La conversación con urgencia debe estar de primera
  assert.equal(payload.items[0]?.id, 'esc-1')
  assert.equal(payload.items[0]?.clientName, 'María García')
  assert.equal(payload.items[0]?.priority, 'Urgente')
  assert.equal(payload.items[0]?.status, 'Pendiente')
  assert.equal(payload.items[0]?.channel, 'Telegram')

  // La segunda conversación debe tener fallback "Cliente sin nombre"
  assert.equal(payload.items[1]?.id, 'esc-2')
  assert.equal(payload.items[1]?.clientName, 'Cliente sin nombre')
  assert.equal(payload.items[1]?.priority, 'Baja')
  assert.equal(payload.items[1]?.status, 'En atención')
  assert.equal(payload.items[1]?.channel, 'Web')

  assert.equal(payload.pendingCount, 1)
  assert.equal(payload.inProgressCount, 1)
  assert.equal(payload.urgentCount, 1)
})

test('buildEscalatedDirectory excluye "Resuelta"/"Cancelada" (nombre real, femenino) sin depender del GUID ni de resolvedAt', () => {
  // FE-4: antes el filtro comparaba texto exacto contra 'resuelto'/'cancelado'
  // (masculino) y nunca hacía match con los nombres reales de BD, femeninos —
  // una conversación resuelta se quedaba pegada en la bandeja de activos.
  const now = new Date('2026-09-14T12:00:00.000Z')

  const conversations: ChatConversationResponseDto[] = [
    { id: 'conv-r', clientName: 'Cliente Resuelto', channel: 'telegram', createdAt: now.toISOString() },
    { id: 'conv-c', clientName: 'Cliente Cancelado', channel: 'telegram', createdAt: now.toISOString() },
    { id: 'conv-p', clientName: 'Cliente Pendiente', channel: 'telegram', createdAt: now.toISOString() },
  ]

  const escalations: ChatEscalationResponseDto[] = [
    {
      id: 'esc-r',
      chatConversationId: 'conv-r',
      escalationStatusId: 'guid-desconocido-resuelta',
      status: 'Resuelta',
      createdAt: now.toISOString(),
      resolvedAt: null,
    },
    {
      id: 'esc-c',
      chatConversationId: 'conv-c',
      escalationStatusId: 'guid-desconocido-cancelada',
      status: 'Cancelada',
      createdAt: now.toISOString(),
      resolvedAt: null,
    },
    {
      id: 'esc-p',
      chatConversationId: 'conv-p',
      escalationStatusId: ESCALATION_STATUS_GUIDS.PENDING,
      status: 'Pendiente',
      createdAt: now.toISOString(),
      resolvedAt: null,
    },
  ]

  const payload = buildEscalatedDirectory(conversations, escalations, now)

  assert.equal(payload.totalCount, 1)
  assert.equal(payload.items[0]?.id, 'esc-p')
})

test('RECEP_NAV_CATALOG contiene la entrada Asesor / conversaciones para Recepcionista', () => {
  const item = RECEP_NAV_CATALOG.find((i) => i.id === 'conversaciones')
  assert.ok(item, 'Debe existir la entrada conversaciones en RECEP_NAV_CATALOG')
  assert.equal(item?.label, 'Asesor')
  assert.equal(item?.permissionKey, 'recep.conversaciones')
  assert.equal(item?.iconKey, 'chat')
  assert.equal(item?.kind, 'link')
  assert.equal(item?.placement, 'main')
})

test('resolveNavCatalog incluye conversaciones cuando tiene permisos asignados', () => {
  const defaultPerms = RECEP_NAV_CATALOG.map((i) => i.permissionKey)
  const visible = resolveNavCatalog(RECEP_NAV_CATALOG, defaultPerms, defaultPerms)
  const hasChat = visible.some((i) => i.id === 'conversaciones')
  assert.equal(hasChat, true)
})

test('fetchEscalatedConversations en modo mock devuelve datos completos de prueba', async () => {
  if (USE_MOCK_ESCALATIONS) {
    const data = await fetchEscalatedConversations()
    assert.ok(data.totalCount > 0)
    assert.ok(data.items.length > 0)
    assert.ok(data.items.some((i) => i.clientName === 'Carolina Martínez'))
    assert.ok(data.items.some((i) => i.clientName === 'Cliente sin nombre'))
  }
})
