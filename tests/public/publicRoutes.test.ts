import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isPublicPolicyRoute,
  normalizePathname,
  PUBLIC_POLICY_ROUTES,
} from '../../src/modules/public/routes.ts'

test('normalizePathname limpia espacios y plecas redundantes', () => {
  assert.equal(normalizePathname(''), '/')
  assert.equal(normalizePathname('/politica-tratamiento-datos'), '/politica-tratamiento-datos')
  assert.equal(normalizePathname('/politica-tratamiento-datos/'), '/politica-tratamiento-datos')
  assert.equal(normalizePathname('  /POLITICAS/  '), '/politicas')
  assert.equal(normalizePathname('/'), '/')
})

test('isPublicPolicyRoute detecta rutas públicas de política correctamente', () => {
  // Rutas principales configuradas
  for (const route of PUBLIC_POLICY_ROUTES) {
    assert.equal(isPublicPolicyRoute(route), true, `Debe reconocer la ruta exacta ${route}`)
    assert.equal(isPublicPolicyRoute(`${route}/`), true, `Debe reconocer la ruta con pleca ${route}/`)
    assert.equal(isPublicPolicyRoute(`${route.toUpperCase()}`), true, `Debe reconocer en mayúsculas ${route}`)
  }

  // Subrutas permitidas
  assert.equal(isPublicPolicyRoute('/politica-tratamiento-datos/seccion-1'), true)

  // Rutas privadas o que requieren login no deben coincidir
  assert.equal(isPublicPolicyRoute('/'), false)
  assert.equal(isPublicPolicyRoute('/login'), false)
  assert.equal(isPublicPolicyRoute('/inicio'), false)
  assert.equal(isPublicPolicyRoute('/usuarios'), false)
  assert.equal(isPublicPolicyRoute('/agenda'), false)
  assert.equal(isPublicPolicyRoute('/politica-otro-tema'), false)
})
