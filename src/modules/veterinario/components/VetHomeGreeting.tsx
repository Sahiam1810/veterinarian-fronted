import { CalendarIcon } from '@/global/components'
import type { VetHomeProfile } from '../types'

interface VetHomeGreetingProps {
  profile: VetHomeProfile
  formattedDate: string
}

// Saludo y fecha del punto de inicio
export function VetHomeGreeting({ profile, formattedDate }: VetHomeGreetingProps) {
  const greeting = `${profile.titlePrefix ?? 'Hola,'} ${profile.displayName}`

  return (
    <header className="flex flex-col gap-1.5">
      <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-brand tracking-tight leading-tight">
        {greeting}
      </h1>
      <p className="flex items-center gap-2 text-sm sm:text-[0.95rem] text-sage font-medium">
        <CalendarIcon className="w-4 h-4 sm:w-[1.05rem] sm:h-[1.05rem] shrink-0 text-sage" />
        <span>{formattedDate}</span>
      </p>
    </header>
  )
}
