export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end'

/**
 * Genera el array de páginas a mostrar con elipsis condicionales.
 * Si totalPages <= 5, no muestra puntos suspensivos.
 */
export function getPageItems(
  currentPage: number,
  totalPages: number
): PaginationItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1)
  }

  const items: PaginationItem[] = []

  if (currentPage <= 3) {
    for (let i = 1; i <= 4; i++) {
      items.push(i)
    }
    items.push('ellipsis-end')
    items.push(totalPages)
  } else if (currentPage >= totalPages - 2) {
    items.push(1)
    items.push('ellipsis-start')
    for (let i = totalPages - 3; i <= totalPages; i++) {
      items.push(i)
    }
  } else {
    items.push(1)
    items.push('ellipsis-start')
    items.push(currentPage - 1)
    items.push(currentPage)
    items.push(currentPage + 1)
    items.push('ellipsis-end')
    items.push(totalPages)
  }

  return items
}

export interface PaginationBounds {
  totalPages: number
  pageStart: number
  pageEnd: number
}

/**
 * Calcula los límites de paginación para una lista de elementos.
 */
export function calculatePaginationBounds(
  totalCount: number,
  currentPage: number,
  itemsPerPage: number
): PaginationBounds {
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage))
  const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const pageEnd = Math.min(currentPage * itemsPerPage, totalCount)

  return { totalPages, pageStart, pageEnd }
}
