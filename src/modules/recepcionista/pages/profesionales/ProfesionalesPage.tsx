import { ProfesionalesSuperAdmin } from '@/modules/superadmin/pages/profesionalesSuperAdmin/ProfesionalesSuperAdmin'
import type { RecepModuleId } from '../../utils/recepModulePermissions'

interface ProfesionalesPageProps {
  onNotice?: (message: string) => void
  canCreateModule?: (moduleId: RecepModuleId) => boolean
  canEditModule?: (moduleId: RecepModuleId) => boolean
  canDeleteModule?: (moduleId: RecepModuleId) => boolean
}

export function ProfesionalesPage({
  onNotice,
  canCreateModule,
  canEditModule,
  canDeleteModule,
}: ProfesionalesPageProps) {
  return (
    <ProfesionalesSuperAdmin
      embedded
      onNotice={onNotice}
      canCreateModule={canCreateModule ? (mod) => canCreateModule(mod as RecepModuleId) : undefined}
      canEditModule={canEditModule ? (mod) => canEditModule(mod as RecepModuleId) : undefined}
      canDeleteModule={canDeleteModule ? (mod) => canDeleteModule(mod as RecepModuleId) : undefined}
    />
  )
}

