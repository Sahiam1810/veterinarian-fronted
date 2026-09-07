export interface HeaderBackgroundTextureProps {
  className?: string
}

export function HeaderBackgroundTexture({ className = '' }: HeaderBackgroundTextureProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Base Warm Gradient Wash */}
      <div className="absolute inset-0 bg-gradient-to-r from-bone via-[#f4ebe0] to-bone opacity-95" />

      {/* 2. Ambient Color Glows (Warmth & Depth) */}
      <div className="absolute -top-6 left-12 w-72 h-20 rounded-full bg-ochre/14 blur-xl" />
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-96 h-20 rounded-full bg-sage/12 blur-2xl" />
      <div className="absolute -bottom-6 right-20 w-80 h-20 rounded-full bg-terracotta/10 blur-xl" />
      <div className="absolute top-0 right-1/4 w-60 h-16 rounded-full bg-brand/8 blur-xl" />

      {/* 3. High-Definition Seamless Micro-Texture Pattern (Paw & Cross Grid) */}
      <svg
        className="absolute inset-0 w-full h-full text-brand opacity-[0.045]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="header-subtle-pattern"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
          >
            {/* Micro Paw Print 1 */}
            <g transform="translate(12, 10) scale(0.65) rotate(12)">
              <ellipse cx="6.2" cy="7.2" rx="1.8" ry="2.2" fill="currentColor" />
              <ellipse cx="11.5" cy="5.2" rx="1.8" ry="2.2" fill="currentColor" />
              <ellipse cx="16.8" cy="7.2" rx="1.8" ry="2.2" fill="currentColor" />
              <path
                d="M11.5 9.2c-3.1 0-5.3 2-5.3 4.6 0 1.9 1.6 3.1 3.5 3.1.9 0 1.4-.3 1.8-.3s.9.3 1.8.3c1.9 0 3.5-1.2 3.5-3.1 0-2.6-2.2-4.6-5.3-4.6Z"
                fill="currentColor"
              />
            </g>

            {/* Micro Veterinary Cross */}
            <path
              d="M40 14v6M37 17h6"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Micro Paw Print 2 (offset & tilted) */}
            <g transform="translate(38, 36) scale(0.55) rotate(-20)">
              <ellipse cx="6.2" cy="7.2" rx="1.8" ry="2.2" fill="currentColor" />
              <ellipse cx="11.5" cy="5.2" rx="1.8" ry="2.2" fill="currentColor" />
              <ellipse cx="16.8" cy="7.2" rx="1.8" ry="2.2" fill="currentColor" />
              <path
                d="M11.5 9.2c-3.1 0-5.3 2-5.3 4.6 0 1.9 1.6 3.1 3.5 3.1.9 0 1.4-.3 1.8-.3s.9.3 1.8.3c1.9 0 3.5-1.2 3.5-3.1 0-2.6-2.2-4.6-5.3-4.6Z"
                fill="currentColor"
              />
            </g>

            {/* Micro Delicate Dot & Diamond Accents */}
            <circle cx="14" cy="44" r="1" fill="currentColor" />
            <circle cx="48" cy="46" r="0.75" fill="currentColor" />
            <circle cx="28" cy="28" r="0.8" fill="currentColor" />
            <polygon points="28,26.5 29.5,28 28,29.5 26.5,28" fill="currentColor" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#header-subtle-pattern)" />
      </svg>

      {/* 4. Center-Span Decorative Watermarks (Spanning the empty header space) */}
      {/* Walking Paw Track 1 (Left-Center) */}
      <svg
        className="absolute top-2 left-[28%] w-10 h-10 text-brand opacity-[0.05] transform -rotate-12 hidden md:block"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
        <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
        <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
        <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
      </svg>

      {/* Walking Paw Track 2 (Mid-Center) */}
      <svg
        className="absolute bottom-1 left-[40%] w-11 h-11 text-sage opacity-[0.055] transform rotate-18 hidden lg:block"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
        <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
        <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
        <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
      </svg>

      {/* Walking Paw Track 3 (Mid-Right) */}
      <svg
        className="absolute top-1 left-[54%] w-10 h-10 text-terracotta opacity-[0.045] transform -rotate-8 hidden md:block"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
        <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
        <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
        <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
      </svg>

      {/* Walking Paw Track 4 (Right-Center) */}
      <svg
        className="absolute bottom-2 left-[68%] w-9 h-9 text-brand opacity-[0.05] transform rotate-15 hidden xl:block"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
        <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
        <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
        <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
      </svg>

      {/* Subtle Botanical Leaf Tendril in Center Header Background */}
      <svg
        className="absolute -top-3 left-[45%] w-36 h-20 text-sage opacity-[0.04] transform rotate-6 hidden lg:block"
        viewBox="0 0 100 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M5,35 Q50,5 95,20" />
        <path d="M30,22 Q22,12 32,8 Q40,18 30,22 Z" fill="currentColor" opacity="0.35" />
        <path d="M52,14 Q48,2 58,1 Q64,10 52,14 Z" fill="currentColor" opacity="0.35" />
        <path d="M72,16 Q78,6 88,8 Q84,18 72,16 Z" fill="currentColor" opacity="0.35" />
      </svg>

      {/* 5. Polished Top and Bottom Accent Borders */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-border-tan/30 via-brand/20 to-border-tan/30" />
    </div>
  )
}
