import { ServiciosSuperAdmin } from '@/modules/superadmin/pages/serviciosSuperAdmin/ServiciosSuperAdmin'
import type { RecepModuleId } from '../../utils/recepModulePermissions'

interface ServiciosPageProps {
  onNotice?: (message: string) => void
  canCreateModule?: (moduleId: RecepModuleId) => boolean
  canEditModule?: (moduleId: RecepModuleId) => boolean
  canDeleteModule?: (moduleId: RecepModuleId) => boolean
}

export function ServiciosPage({
  onNotice,
  canCreateModule,
  canEditModule,
  canDeleteModule,
}: ServiciosPageProps) {
  return (
    <ServiciosSuperAdmin
      embedded
      onNotice={onNotice}
      canCreateModule={canCreateModule ? (mod) => canCreateModule(mod as RecepModuleId) : undefined}
      canEditModule={canEditModule ? (mod) => canEditModule(mod as RecepModuleId) : undefined}
      canDeleteModule={canDeleteModule ? (mod) => canDeleteModule(mod as RecepModuleId) : undefined}
    />
  )
}

