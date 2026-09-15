import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PROFILE_PHOTO_URL_ERROR,
  normalizeProfilePhotoUrl,
} from '../../src/global/utils/profilePhotoUrl.ts'

test('normalizeProfilePhotoUrl acepta vacío para quitar la foto', () => {
  assert.deepEqual(normalizeProfilePhotoUrl('   '), { ok: true, url: '' })
})

test('normalizeProfilePhotoUrl acepta un enlace https', () => {
  const url = 'https://ejemplo.com/foto.jpg'
  assert.deepEqual(normalizeProfilePhotoUrl(`  ${url}  `), { ok: true, url })
})

test('normalizeProfilePhotoUrl rechaza un texto que no es URL', () => {
  const result = normalizeProfilePhotoUrl('no-es-un-enlace')
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.equal(result.error, PROFILE_PHOTO_URL_ERROR)
  }
})

test('normalizeProfilePhotoUrl rechaza protocolos que no son http(s)', () => {
  const result = normalizeProfilePhotoUrl('javascript:alert(1)')
  assert.equal(result.ok, false)
})
