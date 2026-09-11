import { useState, useRef, useEffect, useMemo } from 'react'
import {
  filterProfessionals,
  normalizeFilterText,
  resolveProfessionalLabel,
  type ProfessionalFilterOption,
} from '../utils/professionalFilter'

export interface ProfessionalComboboxProps {
  value: string
  onChange: (value: string) => void
  options: ProfessionalFilterOption[]
  hasAllOption?: boolean
  allOptionLabel?: string
  allOptionValue?: string
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  menuClassName?: string
  disabled?: boolean
  id?: string
}

export function ProfessionalCombobox({
  value,
  onChange,
  options,
  hasAllOption = true,
  allOptionLabel = 'Todos los Profesionales',
  allOptionValue = 'all',
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar por nombre...',
  className = '',
  menuClassName = '',
  disabled = false,
  id,
}: ProfessionalComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Enfocar el input de búsqueda automáticamente al abrir el combobox
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Filtrado de opciones según el texto buscado
  const filteredOptions = useMemo(() => {
    return filterProfessionals(options, searchQuery)
  }, [options, searchQuery])

  // Determinar si se muestra la opción "Todos los Profesionales"
  const showAllOption = useMemo(() => {
    if (!hasAllOption) return false
    const normalizedQuery = normalizeFilterText(searchQuery)
    if (!normalizedQuery) return true
    return normalizeFilterText(allOptionLabel).includes(normalizedQuery)
  }, [hasAllOption, searchQuery, allOptionLabel])

  const selectedLabel = resolveProfessionalLabel(
    options,
    value,
    allOptionLabel,
    allOptionValue,
    hasAllOption,
  )

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
    setSearchQuery('')
  }

  const toggleDropdown = () => {
    if (disabled) return
    if (isOpen) {
      setIsOpen(false)
      setSearchQuery('')
    } else {
      setIsOpen(true)
    }
  }

  const hasNoResults = !showAllOption && filteredOptions.length === 0
  const isFullWidth = className.includes('w-full')

  return (
    <div
      className={`relative ${isFullWidth ? 'w-full' : 'inline-block'} ${isOpen ? 'z-50' : 'z-10'}`}
      ref={containerRef}
      id={id}
    >
      {/* Botón Trigger del Combobox */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl border border-border-tan bg-bone/35 text-xs sm:text-sm text-charcoal font-semibold cursor-pointer hover:border-brand/50 focus:outline-none transition select-none ${
          isFullWidth ? 'w-full' : 'min-w-[200px] sm:min-w-[220px]'
        } ${
          isOpen ? 'border-brand ring-2 ring-brand/20 bg-white shadow-xs' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-bone/20' : ''} ${className}`}
      >
        <span
          className={`truncate text-left font-semibold ${
            !selectedLabel ? 'text-text-placeholder font-normal' : ''
          }`}
        >
          {selectedLabel || placeholder}
        </span>

        {/* Chevron Icon */}
        <svg
          className={`w-4 h-4 text-sage shrink-0 transition-transform duration-200 ease-out ${
            isOpen ? 'rotate-180 text-brand' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 w-full min-w-[240px] sm:min-w-[270px] bg-white border border-border-tan/90 rounded-2xl p-2 shadow-[0_8px_30px_rgba(35,78,70,0.12)] view-popup z-50 ${menuClassName}`}
          role="listbox"
        >
          {/* Buscador Integrado con Autofocus */}
          <div className="relative mb-1.5">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sage w-3.5 h-3.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-border-tan/80 bg-bone/25 focus:bg-white text-xs text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  searchInputRef.current?.focus()
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-sage hover:text-charcoal cursor-pointer p-0.5"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Lista de Opciones Filtradas */}
          <div className="max-h-60 overflow-y-auto flex flex-col gap-0.5 pr-0.5">
            {/* Opción 'Todos los Profesionales' */}
            {showAllOption && (
              <button
                type="button"
                role="option"
                aria-selected={value === allOptionValue}
                onClick={() => handleSelect(allOptionValue)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  value === allOptionValue
                    ? 'bg-[#e8f3ef] text-brand font-bold'
                    : 'text-charcoal/90 hover:bg-[#f8faf9] hover:text-brand'
                }`}
              >
                <span className="truncate">{allOptionLabel}</span>
                {value === allOptionValue && (
                  <svg
                    className="w-4 h-4 text-brand shrink-0 animate-in fade-in zoom-in-75 duration-150"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            )}

            {/* Opciones individuales */}
            {filteredOptions.map((opt) => {
              const isSelected = opt.id === value
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#e8f3ef] text-brand font-bold'
                      : 'text-charcoal/90 hover:bg-[#f8faf9] hover:text-brand'
                  }`}
                >
                  <div className="flex flex-col truncate">
                    <span className="truncate">{opt.name}</span>
                    {opt.subtitle && (
                      <span className="text-[11px] font-normal text-sage truncate">
                        {opt.subtitle}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-brand shrink-0 animate-in fade-in zoom-in-75 duration-150"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              )
            })}

            {/* Estado Vacío */}
            {hasNoResults && (
              <div className="py-5 px-3 text-center flex flex-col items-center justify-center gap-1 text-sage">
                <svg
                  className="w-6 h-6 text-sage/70 stroke-[1.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                <span className="text-xs font-semibold text-charcoal/80">Sin resultados</span>
                <span className="text-[11px] text-sage">
                  No se encontraron coincidencias para "{searchQuery}"
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { ProfessionalCombobox as SearchableCombobox }
