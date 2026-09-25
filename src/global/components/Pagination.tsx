import { ChevronLeftIcon, ChevronRightIcon } from './Icons'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  itemName?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = 'registros',
}: PaginationProps) {
  if (totalItems === 0 || totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = startPage + maxVisiblePages - 1

    if (endPage > totalPages) {
      endPage = totalPages
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 bg-bone/50 border-t border-border-tan text-xs">
      <div className="text-sage font-medium">
        Mostrando <span className="font-bold text-charcoal">{startItem}</span> -{' '}
        <span className="font-bold text-charcoal">{endItem}</span> de{' '}
        <span className="font-bold text-charcoal">{totalItems}</span> {itemName}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-border-tan bg-white text-charcoal hover:bg-brand hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-charcoal transition cursor-pointer disabled:cursor-not-allowed shadow-2xs"
          title="Página anterior"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              page === currentPage
                ? 'bg-brand text-white shadow-2xs'
                : 'bg-white border border-border-tan text-charcoal hover:bg-bone'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-border-tan bg-white text-charcoal hover:bg-brand hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-charcoal transition cursor-pointer disabled:cursor-not-allowed shadow-2xs"
          title="Página siguiente"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
