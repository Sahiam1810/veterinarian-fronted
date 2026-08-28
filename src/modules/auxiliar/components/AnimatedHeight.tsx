import { useEffect, useRef, useState, type ReactNode } from 'react'

interface AnimatedHeightProps {
  children: ReactNode
  className?: string
}

// Contenedor con animación fluida de altura (alargamiento y encogimiento)
export function AnimatedHeight({ children, className = '' }: AnimatedHeightProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!contentRef.current) return

    const updateHeight = () => {
      if (contentRef.current) {
        setHeight(contentRef.current.offsetHeight)
      }
    }

    updateHeight()

    // Observa cambios en el DOM interno para animar tamaño
    const resizeObserver = new ResizeObserver(() => {
      updateHeight()
    })

    resizeObserver.observe(contentRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div
      className={`overflow-hidden transition-[height] duration-350 ease-[cubic-bezier(0.25,1,0.5,1)] ${className}`.trim()}
      style={{ height: height !== undefined ? `${height}px` : 'auto' }}
    >
      <div ref={contentRef} className="w-full">
        {children}
      </div>
    </div>
  )
}
