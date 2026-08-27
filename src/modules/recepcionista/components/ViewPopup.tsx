import type { CSSProperties, ReactNode } from 'react'

interface ViewPopupProps {
  children: ReactNode
  animationKey?: string | number
  className?: string
  delayMs?: number
}

export function ViewPopup({
  children,
  animationKey,
  className = '',
  delayMs = 0,
}: ViewPopupProps) {
  const style: CSSProperties | undefined =
    delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined

  return (
    <div key={animationKey} className={`view-popup ${className}`.trim()} style={style}>
      {children}
    </div>
  )
}
