import type { ReactNode } from 'react'
import type { VetProfilePayload } from '../types'
import { BriefcaseMedicalIcon, IdCardIcon, MailIcon } from './PerfilIcons'
import { PhoneIcon } from './MascotasIcons'

interface PerfilDetailsPanelProps {
  profile: VetProfilePayload
}

// Panel derecho compacto: define la altura que comparte la tarjeta de foto
export function PerfilDetailsPanel({ profile }: PerfilDetailsPanelProps) {
  return (
    <div className="min-w-0 flex flex-col gap-3 h-full">
      <section className="rounded-2xl border border-border-tan bg-white p-4 shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
        <header className="flex items-center gap-2 pb-2 mb-3 border-b border-brand/25">
          <IdCardIcon className="w-4.5 h-4.5 text-brand shrink-0" />
          <h3 className="text-sm font-bold text-brand">Información Personal</h3>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Field label="Nombre Completo" value={profile.fullName} />
          <Field label="Rol en Sistema" value={profile.systemRole} />
          <Field
            label="Correo Electrónico"
            value={profile.email}
            icon={<MailIcon className="w-3.5 h-3.5 text-sage shrink-0" />}
          />
          <Field
            label="Teléfono de Contacto"
            value={profile.phone}
            icon={<PhoneIcon className="w-3.5 h-3.5 text-sage shrink-0" />}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border-tan bg-white p-4 shadow-[0_2px_16px_rgba(35,78,70,0.04)] flex-1">
        <header className="flex items-center gap-2 pb-2 mb-3 border-b border-brand/25">
          <BriefcaseMedicalIcon className="w-4.5 h-4.5 text-brand shrink-0" />
          <h3 className="text-sm font-bold text-brand">Información Profesional</h3>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <TagField label="Especialidad Principal" value={profile.mainSpecialty} />
          <TagField label="Sub-especialidad" value={profile.subSpecialty} />
          <TagField label="Número de Colegiatura (CMV)" value={profile.licenseNumber} />
        </div>
      </section>
    </div>
  )
}

function Field({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-xl bg-bone/70 border border-border-tan/80 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-sage">{label}</p>
      <p className="mt-1 text-sm font-bold text-charcoal flex items-center gap-1.5 min-w-0">
        {icon}
        <span className="truncate" title={value}>
          {value}
        </span>
      </p>
    </div>
  )
}

function TagField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-sage mb-1.5">{label}</p>
      <div className="rounded-xl bg-bone border border-border-tan px-3 py-2">
        <p className="text-sm font-bold text-charcoal truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}
