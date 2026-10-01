// Mensajes del PATCH /api/Appointments/{id}/vitals; se muestran dentro del modal
// de signos vitales y nunca como un error de carga de la Agenda.
function readErrorStatus(err: unknown): number {
  if (err && typeof err === 'object' && 'status' in err) {
    const status = (err as { status: unknown }).status
    if (typeof status === 'number') return status
  }
  return -1
}

function readErrorDetail(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null
  const violations = (err as { violations?: unknown }).violations
  if (Array.isArray(violations)) {
    const texts = violations.filter((v): v is string => typeof v === 'string' && v.trim() !== '')
    if (texts.length > 0) return texts.join(' ')
  }
  const message = (err as { message?: unknown }).message
  return typeof message === 'string' && message.trim() ? message : null
}

export function resolveVitalsSaveError(err: unknown): string {
  const status = readErrorStatus(err)
  if (status === 403) {
    return 'No tienes permiso para registrar signos vitales (requiere Signos Vitales · Editar). No se guardaron cambios.'
  }
  if (status === 401) {
    return 'Tu sesión expiró. Inicia sesión nuevamente para registrar los signos vitales.'
  }
  if (status === 404) {
    return 'No se encontró la cita para registrar los signos vitales.'
  }
  if (status === 400) {
    const detail = readErrorDetail(err)
    return detail
      ? `Signos vitales no válidos: ${detail}`
      : 'Los signos vitales enviados no son válidos.'
  }
  if (status === 0) {
    return 'No se pudo conectar con el servidor al guardar los signos vitales.'
  }
  return 'No se pudieron guardar los signos vitales. Intenta de nuevo.'
}
