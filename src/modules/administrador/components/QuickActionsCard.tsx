import {
  UserPlusIcon,
  UsersIcon,
  PetMedicalIcon,
  CalendarPlusIcon,
} from './DashboardIcons'

interface QuickActionsCardProps {
  onCreateUser?: () => void
  onRegisterOwner?: () => void
  onRegisterPet?: () => void
  onScheduleAppointment?: () => void
}

export function QuickActionsCard({
  onCreateUser,
  onRegisterOwner,
  onRegisterPet,
  onScheduleAppointment,
}: QuickActionsCardProps) {
  return (
    <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-4 sm:p-5 lg:p-6 border border-[#E8DCCF] shadow-[0_4px_24px_rgba(35,78,70,0.035)] flex flex-col relative overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between mb-3 sm:mb-3.5">
        <h2 className="text-lg sm:text-xl font-bold text-[#2C3A38] tracking-tight">
          Accesos Rápidos
        </h2>
        <span className="w-2 h-2 rounded-full bg-[#658E83]/40" />
      </div>

      {/* Action Buttons List */}
      <div className="flex flex-col gap-2.5 sm:gap-3">
        {/* 1. Crear Usuario */}
        <button
          type="button"
          onClick={onCreateUser}
          className="w-full text-left bg-[#F6EDE0]/90 hover:bg-[#F6EDE0] border border-[#E8DCCF] hover:border-[#C86D51]/40 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#C86D51] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <UserPlusIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-[#2C3A38] group-hover:text-[#234E46] transition-colors">
                Crear Usuario
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#2C3A38]/70">
                Personal clínico
              </span>
            </div>
          </div>
          <span className="text-xs text-[#658E83] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 pr-1">
            →
          </span>
        </button>

        {/* 2. Registrar Dueño */}
        <button
          type="button"
          onClick={onRegisterOwner}
          className="w-full text-left bg-[#F6EDE0]/90 hover:bg-[#F6EDE0] border border-[#E8DCCF] hover:border-[#234E46]/40 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#234E46] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-[#2C3A38] group-hover:text-[#234E46] transition-colors">
                Registrar Dueño
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#2C3A38]/70">
                Nuevo cliente
              </span>
            </div>
          </div>
          <span className="text-xs text-[#658E83] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 pr-1">
            →
          </span>
        </button>

        {/* 3. Registrar Mascota */}
        <button
          type="button"
          onClick={onRegisterPet}
          className="w-full text-left bg-[#F6EDE0]/90 hover:bg-[#F6EDE0] border border-[#E8DCCF] hover:border-[#234E46]/40 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#234E46] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <PetMedicalIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-[#2C3A38] group-hover:text-[#234E46] transition-colors">
                Registrar Mascota
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#2C3A38]/70">
                Añadir paciente
              </span>
            </div>
          </div>
          <span className="text-xs text-[#658E83] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 pr-1">
            →
          </span>
        </button>

        {/* 4. Agendar Cita (CTA Destacado) */}
        <button
          type="button"
          onClick={onScheduleAppointment}
          className="w-full text-left mt-0.5 bg-gradient-to-r from-[#234E46] to-[#1C413A] hover:from-[#1B3E37] hover:to-[#16332d] text-white rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:shadow-[#234E46]/20 group active:translate-y-0.5"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CalendarPlusIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs sm:text-sm md:text-base font-bold text-white tracking-wide">
            Agendar Cita
          </span>
        </button>
      </div>
    </div>
  )
}
