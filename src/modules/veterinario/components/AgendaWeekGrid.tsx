import type { AgendaCalendarEvent, AgendaDayColumn } from '../types'
import { AgendaEventCard } from './AgendaEventCard'

interface AgendaWeekGridProps {
  days: AgendaDayColumn[]
  events: AgendaCalendarEvent[]
  hourStart: number
  hourEnd: number
  currentTime: string
  currentDateKey: string
  onSelectEvent?: (event: AgendaCalendarEvent) => void
}

function parseMinutes(time: string): number {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function percentFromHourStart(time: string, hourStart: number, totalMinutes: number): number {
  const diff = parseMinutes(time) - hourStart * 60
  return Math.max(0, Math.min(100, (diff / totalMinutes) * 100))
}


// Grid semanal: en móvil hace scroll horizontal para no aplastar columnas.
export function AgendaWeekGrid({
  days,
  events,
  hourStart,
  hourEnd,
  currentTime,
  currentDateKey,
  onSelectEvent,
}: AgendaWeekGridProps) {
  const hours = Array.from({ length: Math.max(hourEnd - hourStart, 1) }, (_, i) => hourStart + i)
  const totalMinutes = Math.max((hourEnd - hourStart) * 60, 60)
  const nowPercent = percentFromHourStart(currentTime, hourStart, totalMinutes)
  const showNowLine = nowPercent >= 0 && nowPercent <= 100
  const isSingleDay = days.length === 1
  const timeCol = isSingleDay ? '2.75rem' : '2.5rem'
  const dayMin = isSingleDay ? 'minmax(0, 1fr)' : 'minmax(4.75rem, 1fr)'
  const gridTemplate = `${timeCol} repeat(${days.length}, ${dayMin})`
  const minWidthClass = isSingleDay ? 'min-w-0' : 'min-w-[36rem] sm:min-w-[44rem] lg:min-w-0'

  return (
    <div className="flex-1 min-h-0 min-w-0 rounded-2xl border border-border-tan bg-white overflow-hidden shadow-[0_2px_16px_rgba(35,78,70,0.04)] flex flex-col">
      <div className="flex-1 min-h-0 min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain">
        <div className={`h-full min-h-0 flex flex-col ${minWidthClass}`}>
          <div
            className="shrink-0 grid border-b border-border-tan bg-bone/50"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className="border-r border-border-tan/70" />
            {days.map((day) => (
              <div
                key={day.dateKey}
                className="py-1.5 sm:py-2.5 px-0.5 flex flex-col items-center justify-center gap-0.5 border-r border-border-tan/50 last:border-r-0 min-w-0"
              >
                <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wide text-sage truncate max-w-full">
                  {day.weekdayLabel}
                </span>
                <span
                  className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-[11px] sm:text-sm font-extrabold ${
                    day.isToday ? 'rounded-full bg-brand text-white' : 'text-charcoal'
                  }`}
                >
                  {day.dayNumber}
                </span>
              </div>
            ))}
          </div>

          <div
            className="relative flex-1 min-h-0 grid"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className="relative border-r border-border-tan/70 bg-white flex flex-col min-h-0">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="relative flex-1 min-h-0 border-b border-border-tan/40"
                >
                  <span className="absolute top-0 right-0.5 sm:right-1 -translate-y-1/2 text-[8px] sm:text-[10px] font-semibold text-sage tabular-nums">
                    {String(hour).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {days.map((day) => {
              const dayEvents = events.filter((event) => event.dateKey === day.dateKey)

              return (
                <div
                  key={day.dateKey}
                  className="relative border-r border-border-tan/50 last:border-r-0 min-w-0 overflow-hidden flex flex-col"
                >
                  {hours.map((hour) => (
                    <div
                      key={`${day.dateKey}-${hour}`}
                      className="flex-1 min-h-0 border-b border-border-tan/40"
                    />
                  ))}

                  {dayEvents.map((event) => {
                    const top = percentFromHourStart(event.startTime, hourStart, totalMinutes)
                    const bottom = percentFromHourStart(event.endTime, hourStart, totalMinutes)
                    const height = Math.max(bottom - top, 4)

                    return (
                      <AgendaEventCard
                        key={event.id}
                        event={event}
                        topPercent={top}
                        heightPercent={height}
                        onSelect={onSelectEvent}
                        compact={!isSingleDay}
                      />
                    )
                  })}
                </div>
              )
            })}

            {showNowLine && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: `${nowPercent}%` }}
                aria-hidden="true"
              >
                <div className="flex items-center">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-danger shrink-0 ml-8 sm:ml-10 -translate-x-1/2" />
                  <span className="flex-1 h-px bg-danger" />
                </div>
              </div>
            )}

            <span className="sr-only">{currentDateKey}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
