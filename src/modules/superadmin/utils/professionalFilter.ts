export interface ProfessionalFilterOption {
  id: string
  name: string
  subtitle?: string
}

/**
 * Normaliza un string para comparaciones: minúsculas, sin espacios extras
 * y sin acentos ni diacríticos.
 */
export function normalizeFilterText(text: string): string {
  if (!text) return ''
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Filtra una lista de opciones de profesionales según el texto de búsqueda.
 * Insensible a mayúsculas, minúsculas y tildes/acentos.
 */
export function filterProfessionals<T extends ProfessionalFilterOption>(
  options: T[],
  query: string,
): T[] {
  const normalizedQuery = normalizeFilterText(query)
  if (!normalizedQuery) {
    return options
  }

  return options.filter((option) => {
    const normalizedName = normalizeFilterText(option.name)
    const normalizedSubtitle = option.subtitle ? normalizeFilterText(option.subtitle) : ''
    return normalizedName.includes(normalizedQuery) || normalizedSubtitle.includes(normalizedQuery)
  })
}

/**
 * Resuelve la etiqueta visible a mostrar en el trigger según el valor seleccionado.
 */
export function resolveProfessionalLabel(
  options: ProfessionalFilterOption[],
  selectedValue: string,
  allLabel = 'Todos los Profesionales',
  allValue = 'all',
  hasAllOption = true,
): string {
  if (hasAllOption) {
    if (!selectedValue || selectedValue === allValue) {
      return allLabel
    }
    const found = options.find((p) => p.id === selectedValue)
    return found ? found.name : allLabel
  }

  if (!selectedValue) {
    return ''
  }
  const found = options.find((p) => p.id === selectedValue)
  return found ? found.name : ''
}
