import { UserAvatarIcon } from '@/global/components'

interface PerfilAuxPageProps {
  onNotice?: (msg: string) => void
}

export function PerfilAuxPage({ onNotice }: PerfilAuxPageProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 min-w-0 max-w-4xl">
      <header>
        <h1 className="text-2xl font-extrabold text-brand">Mi Perfil Profesional</h1>
        <p className="text-sm text-sage font-medium">Información de la cuenta, turno actual y puesto de trabajo</p>
      </header>

      <div className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_12px_rgba(35,78,70,0.04)] p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
        <div className="w-24 h-24 rounded-3xl bg-terracotta-soft text-terracotta flex items-center justify-center text-4xl font-extrabold shrink-0 border border-terracotta/20">
          LG
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-charcoal">Laura Gómez</h2>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-terracotta-soft text-terracotta">
                Auxiliar Veterinario
              </span>
            </div>
            <p className="text-xs text-sage mt-0.5">laura.gomez@vetclinic.com • auxiliar@huellitas.com</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="bg-bone p-3 rounded-2xl border border-border-tan space-y-1">
              <span className="text-sage font-medium">Área Asignada:</span>
              <p className="font-bold text-brand">Soporte Clínico, Triaje y Quirófanos</p>
            </div>

            <div className="bg-bone p-3 rounded-2xl border border-border-tan space-y-1">
              <span className="text-sage font-medium">Turno de Trabajo:</span>
              <p className="font-bold text-charcoal">Mañana (07:00 AM - 03:00 PM)</p>
            </div>

            <div className="bg-bone p-3 rounded-2xl border border-border-tan space-y-1">
              <span className="text-sage font-medium">Estado del Sistema:</span>
              <p className="font-bold text-emerald-700">● En Servicio Activo</p>
            </div>

            <div className="bg-bone p-3 rounded-2xl border border-border-tan space-y-1">
              <span className="text-sage font-medium">Supervisión Médica:</span>
              <p className="font-bold text-charcoal">Dr. Roberto Silva / Dra. Ana Silva</p>
            </div>
          </div>

          <div className="pt-3 border-t border-border-tan flex gap-3">
            <button
              type="button"
              onClick={() => onNotice?.('Actualización de contraseña disponible próximamente')}
              className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition cursor-pointer"
            >
              Cambiar Contraseña
            </button>
            <button
              type="button"
              onClick={() => onNotice?.('Reporte de turno generado')}
              className="px-4 py-2 rounded-xl border border-border-tan text-xs font-bold text-charcoal hover:bg-bone transition cursor-pointer"
            >
              Generar Resumen de Turno
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
