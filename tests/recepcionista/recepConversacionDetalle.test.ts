import test from 'node:test'
import assert from 'node:assert/strict'
import {
  resolveSenderRole,
  resolveSenderLabel,
  buildChatMessageItem,
  fetchConversationThread,
  sendAgentMessage,
  resolveConversation,
  fetchEscalatedConversations,
  USE_MOCK_ESCALATIONS,
} from '../../src/modules/recepcionista/services/recepEscalacionesService.ts'
import {
  SENDER_TYPE_GUIDS,
  type ChatMessageResponseDto,
} from '../../src/modules/recepcionista/types/escalaciones.types.ts'

test('resolveSenderRole mapea GUIDs oficiales y fallbacks de texto', () => {
  assert.equal(resolveSenderRole(SENDER_TYPE_GUIDS.CLIENT), 'client')
  assert.equal(resolveSenderRole(SENDER_TYPE_GUIDS.AI_AGENT), 'ai_agent')
  assert.equal(resolveSenderRole(SENDER_TYPE_GUIDS.HUMAN_AGENT), 'human_agent')
  assert.equal(resolveSenderRole(SENDER_TYPE_GUIDS.SYSTEM), 'system')

  assert.equal(resolveSenderRole(null, 'cliente'), 'client')
  assert.equal(resolveSenderRole(null, 'bot'), 'ai_agent')
  assert.equal(resolveSenderRole(null, 'asesor'), 'human_agent')
  assert.equal(resolveSenderRole(null, 'sistema'), 'system')
})

test('resolveSenderLabel retorna etiquetas legibles para la interfaz', () => {
  assert.equal(resolveSenderLabel('client', 'Carolina Martínez'), 'Carolina Martínez')
  assert.equal(resolveSenderLabel('client', null), 'Cliente')
  assert.equal(resolveSenderLabel('ai_agent'), 'Asistente IA')
  assert.equal(resolveSenderLabel('human_agent'), 'Asesor (Tú)')
  assert.equal(resolveSenderLabel('human_agent', 'Carlos Méndez (Recepción)'), 'Carlos Méndez (Recepción)')
  assert.equal(resolveSenderLabel('system'), 'Sistema')
})

test('buildChatMessageItem transforma un ChatMessageResponseDto al modelo de presentación', () => {
  const dto: ChatMessageResponseDto = {
    id: 'msg-test-1',
    conversationId: 'conv-test',
    senderTypeId: SENDER_TYPE_GUIDS.CLIENT,
    senderName: 'Valentina',
    content: 'Hola, tengo una duda con las vacunas.',
    createdAt: '2026-09-14T15:30:00.000Z',
  }

  const item = buildChatMessageItem(dto)

  assert.equal(item.id, 'msg-test-1')
  assert.equal(item.conversationId, 'conv-test')
  assert.equal(item.senderRole, 'client')
  assert.equal(item.senderLabel, 'Valentina')
  assert.equal(item.content, 'Hola, tengo una duda con las vacunas.')
  assert.equal(item.status, 'sent')
  assert.ok(item.timeLabel.length > 0)
})

test('fetchConversationThread devuelve el hilo ordenado cronológicamente (modo mock)', async () => {
  if (USE_MOCK_ESCALATIONS) {
    const thread = await fetchConversationThread('conv-001')
    assert.ok(thread.length >= 4)
    
    // Verificar orden cronológico
    for (let i = 0; i < thread.length - 1; i++) {
      const current = new Date(thread[i]!.createdAt).getTime()
      const next = new Date(thread[i + 1]!.createdAt).getTime()
      assert.ok(current <= next, 'Los mensajes deben estar ordenados cronológicamente')
    }

    // Verificar distinción de remitentes
    assert.ok(thread.some((m) => m.senderRole === 'client'))
    assert.ok(thread.some((m) => m.senderRole === 'ai_agent'))
    assert.ok(thread.some((m) => m.senderRole === 'system'))
  }
})

test('fetchConversationThread devuelve lista vacía si la conversación no tiene mensajes', async () => {
  if (USE_MOCK_ESCALATIONS) {
    const thread = await fetchConversationThread('conv-003')
    assert.deepEqual(thread, [])
  }
})

test('sendAgentMessage rechaza mensajes vacíos con error descriptivo', async () => {
  await assert.rejects(
    async () => {
      await sendAgentMessage('conv-001', '   ')
    },
    {
      name: 'Error',
      message: 'El mensaje no puede estar vacío.',
    },
  )
})

test('sendAgentMessage agrega el mensaje al hilo de la conversación (modo mock)', async () => {
  if (USE_MOCK_ESCALATIONS) {
    const newMessage = await sendAgentMessage('conv-001', 'Hola Carolina, ya estamos atendiendo tu caso.')
    
    assert.equal(newMessage.senderRole, 'human_agent')
    assert.equal(newMessage.senderTypeId, SENDER_TYPE_GUIDS.HUMAN_AGENT)
    assert.equal(newMessage.content, 'Hola Carolina, ya estamos atendiendo tu caso.')
    assert.equal(newMessage.status, 'sent')

    // Verificar que el mensaje ahora forma parte del hilo
    const thread = await fetchConversationThread('conv-001')
    const lastMsg = thread[thread.length - 1]
    assert.equal(lastMsg?.content, 'Hola Carolina, ya estamos atendiendo tu caso.')
  }
})

test('resolveConversation marca el escalamiento como resuelto y lo remueve de la bandeja (modo mock)', async () => {
  if (USE_MOCK_ESCALATIONS) {
    const beforeDirectory = await fetchEscalatedConversations()
    const targetEsc = beforeDirectory.items.find((i) => i.id === 'esc-005')
    assert.ok(targetEsc, 'El escalamiento esc-005 debe existir antes de resolverlo')

    const res = await resolveConversation('esc-005', 'Se envió copia de la historia clínica al correo.')
    assert.equal(res.escalationId, 'esc-005')
    assert.equal(res.notes, 'Se envió copia de la historia clínica al correo.')
    assert.ok(res.resolvedAt)

    // Verificar que esc-005 ya no aparece en la bandeja activa
    const afterDirectory = await fetchEscalatedConversations()
    const foundAfter = afterDirectory.items.find((i) => i.id === 'esc-005')
    assert.equal(foundAfter, undefined, 'El escalamiento resuelto no debe aparecer en la bandeja activa')
  }
})
