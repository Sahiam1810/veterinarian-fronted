export function DashboardBackgroundDecoration() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* 1. Ambient Soft Warm Gradients */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-ochre/12 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-[32rem] h-[32rem] rounded-full bg-sage/8 blur-3xl" />
      <div className="absolute -bottom-32 right-1/4 w-[36rem] h-[36rem] rounded-full bg-terracotta/7 blur-3xl" />

      {/* 2. Floating Faint Paw Footprints Watermarks */}
      {/* Top right paw 1 */}
      <svg
        className="absolute top-6 right-16 w-20 h-20 text-sage opacity-[0.07] transform rotate-12"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
        <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
        <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
        <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
      </svg>

      {/* Center paw 2 */}
      <svg
        className="absolute top-1/2 right-1/3 w-28 h-28 text-brand opacity-[0.045] transform -rotate-25"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
        <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
        <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
        <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
      </svg>

      {/* Bottom left paw 3 */}
      <svg
        className="absolute bottom-12 left-10 w-24 h-24 text-terracotta opacity-[0.05] transform rotate-45"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
        <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
        <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
        <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
      </svg>

      {/* Bottom right paw 4 */}
      <svg
        className="absolute bottom-8 right-12 w-32 h-32 text-sage opacity-[0.05] transform -rotate-12"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <ellipse cx="6.2" cy="8.2" rx="2.1" ry="2.6" />
        <ellipse cx="12" cy="5.8" rx="2.1" ry="2.6" />
        <ellipse cx="17.8" cy="8.2" rx="2.1" ry="2.6" />
        <path d="M12 10.4c-3.6 0-6.2 2.4-6.2 5.4 0 2.2 1.9 3.6 4.1 3.6 1.1 0 1.6-.4 2.1-.4s1 .4 2.1.4c2.2 0 4.1-1.4 4.1-3.6 0-3-2.6-5.4-6.2-5.4Z" />
      </svg>

      {/* 3. Subtle Botanical Leaf Vectors */}
      {/* Top right botanical branch */}
      <svg
        className="absolute -top-6 right-1/4 w-44 h-44 text-brand opacity-[0.045] transform rotate-45"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M10,90 Q50,50 90,10" />
        <path d="M30,70 Q20,50 35,40 Q45,60 30,70 Z" fill="currentColor" opacity="0.4" />
        <path d="M50,50 Q40,30 55,20 Q65,40 50,50 Z" fill="currentColor" opacity="0.4" />
        <path d="M70,30 Q60,10 75,5 Q85,20 70,30 Z" fill="currentColor" opacity="0.4" />
        <path d="M50,50 Q70,60 65,40 Q55,45 50,50 Z" fill="currentColor" opacity="0.4" />
        <path d="M70,30 Q90,40 85,20 Q75,25 70,30 Z" fill="currentColor" opacity="0.4" />
      </svg>

      {/* Bottom right botanical branch */}
      <svg
        className="absolute bottom-0 right-2 w-48 h-48 text-sage opacity-[0.05] transform -rotate-15"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M10,90 Q50,60 80,10" />
        <path d="M25,75 Q10,60 25,50 Q38,65 25,75 Z" fill="currentColor" opacity="0.4" />
        <path d="M45,55 Q30,40 45,30 Q58,45 45,55 Z" fill="currentColor" opacity="0.4" />
        <path d="M65,35 Q50,20 65,10 Q78,25 65,35 Z" fill="currentColor" opacity="0.4" />
      </svg>

      {/* 4. Veterinary Medical Cross Accents */}
      <svg
        className="absolute top-28 left-1/3 w-8 h-8 text-terracotta opacity-[0.08]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>

      <svg
        className="absolute bottom-28 right-1/2 w-7 h-7 text-brand opacity-[0.07]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </div>
  )
}
