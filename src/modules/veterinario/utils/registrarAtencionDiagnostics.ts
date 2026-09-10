// Lógica pura del catálogo de diagnósticos en RegistrarAtencionModal (testeable sin React).

export interface DiagnosticOption {
  id: string
  isActive?: boolean
}

// Elige el diagnóstico por defecto al abrir el modal con catálogo cargado.
export function pickDefaultDiagnosticId(
  diagnostics: DiagnosticOption[],
  currentId = '',
): string {
  if (currentId) return currentId
  const preferred = diagnostics.find((d) => d.isActive !== false) ?? diagnostics[0]
  return preferred?.id ?? ''
}

// Mensaje de bloqueo si falta diagnóstico; null si el envío puede continuar.
export function getMissingDiagnosticError(selectedDiagnosticId: string): string | null {
  if (!selectedDiagnosticId.trim()) {
    return 'Debes seleccionar un diagnóstico del catálogo.'
  }
  return null
}

// True cuando hay al menos un diagnóstico y ya hay uno seleccionado (camino feliz del bug S11).
export function canSubmitWithDiagnosticsCatalog(
  diagnostics: DiagnosticOption[],
  selectedDiagnosticId: string,
): boolean {
  if (diagnostics.length === 0) return false
  const resolved = pickDefaultDiagnosticId(diagnostics, selectedDiagnosticId)
  return getMissingDiagnosticError(resolved) === null
}
