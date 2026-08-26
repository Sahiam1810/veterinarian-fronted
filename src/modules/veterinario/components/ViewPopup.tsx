import type { CSSProperties, ReactNode } from 'react'

interface ViewPopupProps {
  children: ReactNode
  // Reinicia la animación al cambiar de vista
  animationKey?: string | number
  className?: string
  // Retraso en ms para cascada de elementos
  delayMs?: number
}

// Efecto popup al montar / cambiar vista
export function ViewPopup({
  children,
  animationKey,
  className = '',
  delayMs = 0,
}: ViewPopupProps) {
  const style: CSSProperties | undefined =
    delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined

  return (
    <div
      key={animationKey}
      className={`view-popup ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  )
}
