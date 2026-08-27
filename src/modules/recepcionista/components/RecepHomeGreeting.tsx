import { CalendarIcon } from '@/global/components'

interface RecepHomeGreetingProps {
  title?: string
  formattedDate: string
  workstationLabel: string
}

export function RecepHomeGreeting({
  title = 'Resumen de Hoy',
  formattedDate,
  workstationLabel,
}: RecepHomeGreetingProps) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-charcoal tracking-tight leading-tight">
        {title}
      </h1>
      <p className="flex items-center gap-2 text-sm sm:text-[0.95rem] text-sage font-medium">
        <CalendarIcon className="w-4 h-4 shrink-0 text-sage" />
        <span>
          {formattedDate} - {workstationLabel}
        </span>
      </p>
    </header>
  )
}
