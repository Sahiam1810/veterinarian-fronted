import type { ReactNode } from 'react'
import type { VetProfilePayload } from '../types'
import { BriefcaseMedicalIcon, IdCardIcon, MailIcon } from './PerfilIcons'
import { PhoneIcon } from './MascotasIcons'

interface PerfilDetailsPanelProps {
  profile: VetProfilePayload
}

// Panel derecho: datos personales y profesionales del API.
export function PerfilDetailsPanel({ profile }: PerfilDetailsPanelProps) {
  return (
    <div className="min-w-0 flex flex-col gap-3 h-full">
      <section className="rounded-2xl border border-border-tan bg-white p-4 shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
        <header className="flex items-center justify-between pb-2 mb-3 border-b border-brand/25">
          <div className="flex items-center gap-2">
            <IdCardIcon className="w-4.5 h-4.5 text-brand shrink-0" />
            <h3 className="text-sm font-bold text-brand">Información Personal</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
            GET /api/auth/me
          </span>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Field label="Nombre Completo" value={profile.fullName} persistence="server" />
          <Field label="Rol en Sistema" value={profile.systemRole} persistence="server" />
          <Field
            label="Correo Electrónico"
            value={profile.email}
            persistence="server"
            icon={<MailIcon className="w-3.5 h-3.5 text-sage shrink-0" />}
          />
          <Field
            label="Teléfono de Contacto"
            value={profile.phone}
            persistence="local"
            icon={<PhoneIcon className="w-3.5 h-3.5 text-sage shrink-0" />}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border-tan bg-white p-4 shadow-[0_2px_16px_rgba(35,78,70,0.04)] flex-1">
        <header className="flex items-center justify-between pb-2 mb-3 border-b border-brand/25">
          <div className="flex items-center gap-2">
            <BriefcaseMedicalIcon className="w-4.5 h-4.5 text-brand shrink-0" />
            <h3 className="text-sm font-bold text-brand">Información Profesional</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
            GET /api/veterinarians
          </span>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <TagField label="Especialidad Principal" value={profile.mainSpecialty} persistence="server" />
          <TagField label="Detalle / descripción" value={profile.subSpecialty} persistence="server" />
          <TagField label="Número de Colegiatura (CMV)" value={profile.licenseNumber} persistence="server" />
        </div>
      </section>
    </div>
  )
}

function Field({
  label,
  value,
  icon,
  persistence = 'server',
}: {
  label: string
  value: string
  icon?: ReactNode
  persistence?: 'server' | 'local'
}) {
  return (
    <div className="min-w-0 rounded-xl bg-bone/70 border border-border-tan/80 px-3 py-2">
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-sage truncate">{label}</p>
        <span
          className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
            persistence === 'server'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
              : 'bg-amber-50 text-amber-800 border border-amber-200/60'
          }`}
        >
          {persistence === 'server' ? 'Servidor' : 'No en backend'}
        </span>
      </div>
      <p className="mt-1 text-sm font-bold text-charcoal flex items-center gap-1.5 min-w-0">
        {icon}
        <span className="truncate" title={value}>
          {value}
        </span>
      </p>
    </div>
  )
}

function TagField({
  label,
  value,
  persistence = 'server',
}: {
  label: string
  value: string
  persistence?: 'server' | 'local'
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-sage truncate">{label}</p>
        <span
          className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
            persistence === 'server'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
              : 'bg-amber-50 text-amber-800 border border-amber-200/60'
          }`}
        >
          {persistence === 'server' ? 'Servidor' : 'Navegador'}
        </span>
      </div>
      <div className="rounded-xl bg-bone border border-border-tan px-3 py-2">
        <p className="text-sm font-bold text-charcoal truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}
