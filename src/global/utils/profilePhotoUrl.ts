export const PROFILE_PHOTO_URL_ERROR =
  'Ingresa un enlace http o https válido de la imagen.'

// Acepta vacío (quitar foto) o un enlace http/https. Rechaza javascript: y otros.
export function normalizeProfilePhotoUrl(
  raw: string,
): { ok: true; url: string } | { ok: false; error: string } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: true, url: '' }
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, error: PROFILE_PHOTO_URL_ERROR }
    }
    return { ok: true, url: trimmed }
  } catch {
    return { ok: false, error: PROFILE_PHOTO_URL_ERROR }
  }
}
