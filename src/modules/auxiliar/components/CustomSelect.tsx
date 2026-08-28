import { useState, useRef, useEffect, type ReactNode } from 'react'

export interface SelectOption {
  value: string
  label: string
  subtitle?: string
  icon?: ReactNode
}

export interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: (string | SelectOption)[]
  placeholder?: string
  className?: string
  menuClassName?: string
  label?: string
  required?: boolean
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  className = '',
  menuClassName = '',
  label,
  required = false,
  disabled = false,
  size = 'md',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Normalizar opciones
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt }
    }
    return opt
  })

  const selectedOption = normalizedOptions.find((opt) => opt.value === value)

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
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
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
  }

  const pyClass = size === 'sm' ? 'py-2 px-3.5 text-xs' : 'py-2.5 px-4 text-xs sm:text-sm'

  return (
    <div className={`relative w-full ${isOpen ? 'z-40' : 'z-10'}`} ref={containerRef}>
      {label && (
        <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
          {label} {required && <span className="text-terracotta">*</span>}
        </label>
      )}

      {/* Botón Trigger del Select */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 bg-white border border-border-tan rounded-xl sm:rounded-2xl font-semibold text-charcoal shadow-2xs hover:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20 transition cursor-pointer select-none ${pyClass} ${
          isOpen ? 'border-brand ring-2 ring-brand/20 shadow-xs' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-bone/30' : ''} ${className}`}
      >
        <div className="flex items-center gap-2 truncate text-left">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Flecha Chevron con animación de rotación */}
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
          className={`absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto bg-white border border-border-tan/90 rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(35,78,70,0.12)] view-popup min-w-[200px] ${menuClassName}`}
        >
          <div className="flex flex-col gap-0.5">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#e8f3ef] text-brand font-bold'
                      : 'text-charcoal/90 hover:bg-[#f8faf9] hover:text-brand'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {opt.icon && <span className="shrink-0 text-sage">{opt.icon}</span>}
                    <div className="flex flex-col truncate">
                      <span className="truncate">{opt.label}</span>
                      {opt.subtitle && (
                        <span className="text-[11px] font-normal text-sage truncate">
                          {opt.subtitle}
                        </span>
                      )}
                    </div>
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
          </div>
        </div>
      )}
    </div>
  )
}
