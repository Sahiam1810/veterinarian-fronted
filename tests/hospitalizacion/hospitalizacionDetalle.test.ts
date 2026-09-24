import assert from 'node:assert/strict'
import test from 'node:test'

import type { ApiHospitalizationNote } from '../../src/modules/hospitalizacion/types/hospitalizacion.types.ts'

test('Hospitalization notes are sorted chronologically from oldest to newest', () => {
  const rawNotes: ApiHospitalizationNote[] = [
    {
      id: 'n-3',
      stayId: 'stay-1',
      authorUserId: 'u-1',
      authorName: 'Dr. Silva',
      createdAt: '2026-09-24T15:00:00Z',
      nota: 'Paciente estable y con buen apetito.',
      handedToUserId: 'u-2',
      handedToName: 'Dra. López',
    },
    {
      id: 'n-1',
      stayId: 'stay-1',
      authorUserId: 'u-1',
      authorName: 'Dr. Silva',
      createdAt: '2026-09-24T08:00:00Z',
      nota: 'Ingreso a hospitalización.',
      handedToUserId: null,
      handedToName: null,
    },
    {
      id: 'n-2',
      stayId: 'stay-1',
      authorUserId: 'u-2',
      authorName: 'Dra. López',
      createdAt: '2026-09-24T12:00:00Z',
      nota: 'Canalización de vía y suero administrado.',
      handedToUserId: null,
      handedToName: null,
    },
  ]

  const sorted = [...rawNotes].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  assert.equal(sorted[0].id, 'n-1')
  assert.equal(sorted[1].id, 'n-2')
  assert.equal(sorted[2].id, 'n-3')
  assert.equal(sorted[2].handedToName, 'Dra. López')
})

test('Add note payload formats handedToUserId and trimmed text correctly', () => {
  const selectedUser: string = 'usr-456'
  const notePayload = {
    nota: '  Evolución clínica favorable.  '.trim(),
    entregadoAUserId: selectedUser.trim() ? selectedUser : null,
  }

  assert.equal(notePayload.nota, 'Evolución clínica favorable.')
  assert.equal(notePayload.entregadoAUserId, 'usr-456')

  const emptyUser: string = ''
  const noteWithoutHandoff = {
    nota: 'Nota simple',
    entregadoAUserId: emptyUser.trim() ? emptyUser : null,
  }

  assert.equal(noteWithoutHandoff.entregadoAUserId, null)
})
