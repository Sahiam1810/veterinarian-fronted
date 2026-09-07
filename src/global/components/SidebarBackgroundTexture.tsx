export interface SidebarBackgroundTextureProps {
  className?: string
}

export function SidebarBackgroundTexture({ className = '' }: SidebarBackgroundTextureProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Base Warm Vertical Gradient Wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-[#f5ebe0] to-cream opacity-95" />

      {/* 2. Ambient Atmosphere Glows */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-ochre/15 blur-2xl" />
      <div className="absolute top-1/3 -right-12 w-52 h-52 rounded-full bg-sage/12 blur-2xl" />
      <div className="absolute bottom-16 -left-10 w-48 h-48 rounded-full bg-terracotta/10 blur-2xl" />
      <div className="absolute -bottom-10 right-0 w-40 h-40 rounded-full bg-brand/8 blur-xl" />

      {/* 3. Seamless Micro-Pattern (Paw & Cross Grid) */}
      <svg
        className="absolute inset-0 w-full h-full text-brand opacity-[0.045]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="sidebar-subtle-pattern"
            width="52"
            height="52"
            patternUnits="userSpaceOnUse"
          >
            {/* Micro Paw Print 1 */}
            <g transform="translate(10, 8) scale(0.6) rotate(10)">
              <ellipse cx="6.2" cy="7.2" rx="1.8" ry="2.2" fill="currentColor" />
              <ellipse cx="11.5" cy="5.2" rx="1.8" ry="2.2" fill="currentColor" />
              <ellipse cx="16.8" cy="7.2" rx="1.8" ry="2.2" fill="currentColor" />
              <path
                d="M11.5 9.2c-3.1 0-5.3 2-5.3 4.6 0 1.9 1.6 3.1 3.5 3.1.9 0 1.4-.3 1.8-.3s.9.3 1.8.3c1.9 0 3.5-1.2 3.5-3.1 0-2.6-2.2-4.6-5.3-4.6Z"
                fill="currentColor"
              />
            </g>

            {/* Micro Cross */}
            <path
              d="M38 12v5M35.5 14.5h5"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
            />

            {/* Micro Paw Print 2 */}
            <g transform="translate(34, 32) scale(0.5) rotate(-15)">
              <ellipse cx="6.2" cy="7.2" rx="1.8" ry="2.2" fill="currentColor" />
              <ellipse cx="11.5" cy="5.2" rx="1.8" ry="2.2" fill="currentColor" />
              <ellipse cx="16.8" cy="7.2" rx="1.8" ry="2.2" fill="currentColor" />
              <path
                d="M11.5 9.2c-3.1 0-5.3 2-5.3 4.6 0 1.9 1.6 3.1 3.5 3.1.9 0 1.4-.3 1.8-.3s.9.3 1.8.3c1.9 0 3.5-1.2 3.5-3.1 0-2.6-2.2-4.6-5.3-4.6Z"
                fill="currentColor"
              />
            </g>

            {/* Micro Dot Stipples */}
            <circle cx="12" cy="40" r="0.9" fill="currentColor" />
            <circle cx="44" cy="42" r="0.75" fill="currentColor" />
            <circle cx="26" cy="24" r="0.8" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sidebar-subtle-pattern)" />
      </svg>

      {/* 4. Vertical Decorative Watermarks */}
      {/* Upper Paw Watermark */}
      <svg
        className="absolute top-16 right-3 w-16 h-16 text-sage opacity-[0.045] transform rotate-12"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
        <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
        <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
        <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
      </svg>

      {/* Mid Paw Watermark */}
      <svg
        className="absolute top-1/2 left-2 w-14 h-14 text-brand opacity-[0.04] transform -rotate-18"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
        <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
        <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
        <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
      </svg>

      {/* Bottom Botanical Tendril Flourish */}
      <svg
        className="absolute bottom-16 right-1 w-28 h-28 text-sage opacity-[0.05] transform -rotate-10"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <path d="M10,90 Q50,60 80,15" />
        <path d="M25,75 Q10,60 25,50 Q38,65 25,75 Z" fill="currentColor" opacity="0.35" />
        <path d="M45,55 Q30,40 45,30 Q58,45 45,55 Z" fill="currentColor" opacity="0.35" />
        <path d="M65,35 Q50,20 65,10 Q78,25 65,35 Z" fill="currentColor" opacity="0.35" />
      </svg>

      {/* 5. Edge Border Highlights */}
      <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-white/60 via-brand/15 to-white/40" />
    </div>
  )
}
