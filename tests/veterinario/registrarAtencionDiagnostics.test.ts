import assert from 'node:assert/strict'
import test from 'node:test'

import {
  canSubmitWithDiagnosticsCatalog,
  getMissingDiagnosticError,
  pickDefaultDiagnosticId,
} from '../../src/modules/veterinario/utils/registrarAtencionDiagnostics.ts'

// Regresión S11: catálogo vacío bloqueaba RegistrarAtencionModal.

test('catálogo vacío: no se puede enviar (bug original)', () => {
  assert.equal(canSubmitWithDiagnosticsCatalog([], ''), false)
  assert.equal(
    getMissingDiagnosticError(''),
    'Debes seleccionar un diagnóstico del catálogo.',
  )
})

test('catálogo con al menos un elemento: se puede enviar al auto-seleccionar', () => {
  const diagnostics = [
    { id: '8b000000-0000-0000-0000-000000000001', isActive: true },
    { id: '8b000000-0000-0000-0000-000000000002', isActive: true },
  ]

  const selected = pickDefaultDiagnosticId(diagnostics, '')
  assert.equal(selected, diagnostics[0].id)
  assert.equal(getMissingDiagnosticError(selected), null)
  assert.equal(canSubmitWithDiagnosticsCatalog(diagnostics, ''), true)
  assert.equal(canSubmitWithDiagnosticsCatalog(diagnostics, selected), true)
})

test('conserva el diagnóstico ya elegido si el catálogo recarga', () => {
  const diagnostics = [
    { id: 'diag-a', isActive: true },
    { id: 'diag-b', isActive: true },
  ]
  assert.equal(pickDefaultDiagnosticId(diagnostics, 'diag-b'), 'diag-b')
})
