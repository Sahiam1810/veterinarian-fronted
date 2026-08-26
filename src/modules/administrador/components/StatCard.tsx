import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: number | string
  subValue?: string
  icon: ReactNode
  iconBgColor?: string
  iconColor?: string
  accentBorderColor?: string
}

export function StatCard({
  label,
  value,
  subValue,
  icon,
  iconBgColor = 'bg-bone',
  iconColor = 'text-sage',
  accentBorderColor = 'hover:border-brand/30',
}: StatCardProps) {
  return (
    <div
      className={`
        relative bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl p-4 sm:p-5
        border border-border-tan shadow-[0_4px_20px_rgba(35,78,70,0.035)]
        hover:shadow-[0_10px_28px_rgba(35,78,70,0.08)] hover:-translate-y-0.5
        transition-all duration-200 flex flex-col justify-between min-h-[110px] sm:min-h-[120px]
        group overflow-hidden ${accentBorderColor}
      `}
    >
      {/* Subtle top decorative highlight */}
      <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-brand/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between gap-2 relative z-10">
        <span className="text-xs sm:text-sm font-bold text-charcoal/85 tracking-tight">
          {label}
        </span>
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-xs`}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mt-2 relative z-10">
        <span className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight group-hover:text-brand transition-colors">
          {value}
        </span>
        {subValue && (
          <span className="text-xs sm:text-sm font-bold text-sage leading-none mb-1">
            {subValue}
          </span>
        )}
      </div>
    </div>
  )
}
