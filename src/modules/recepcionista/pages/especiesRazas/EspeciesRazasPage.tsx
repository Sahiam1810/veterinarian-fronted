import { EspeciesRazasSuperAdmin } from '@/modules/superadmin/pages/especiesRazasSuperAdmin/EspeciesRazasSuperAdmin'
import type { RecepModuleId } from '../../utils/recepModulePermissions'

interface EspeciesRazasPageProps {
  onNotice?: (message: string) => void
  canCreateModule?: (moduleId: RecepModuleId) => boolean
  canEditModule?: (moduleId: RecepModuleId) => boolean
  canDeleteModule?: (moduleId: RecepModuleId) => boolean
}

export function EspeciesRazasPage({
  onNotice,
  canCreateModule,
  canEditModule,
  canDeleteModule,
}: EspeciesRazasPageProps) {
  return (
    <EspeciesRazasSuperAdmin
      embedded
      onNotice={onNotice}
      canCreateModule={canCreateModule ? (mod) => canCreateModule(mod as RecepModuleId) : undefined}
      canEditModule={canEditModule ? (mod) => canEditModule(mod as RecepModuleId) : undefined}
      canDeleteModule={canDeleteModule ? (mod) => canDeleteModule(mod as RecepModuleId) : undefined}
    />
  )
}

