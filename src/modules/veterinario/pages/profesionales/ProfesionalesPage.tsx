import { ProfesionalesSuperAdmin } from '@/modules/superadmin'
import type { ModuleId } from '@/modules/superadmin/types'

interface ProfesionalesPageProps {
  onNotice?: (message: string) => void
  canCreateModule?: (moduleId: any) => boolean
  canEditModule?: (moduleId: any) => boolean
  canDeleteModule?: (moduleId: any) => boolean
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
      canCreateModule={canCreateModule as ((moduleId: ModuleId) => boolean) | undefined}
      canEditModule={canEditModule as ((moduleId: ModuleId) => boolean) | undefined}
      canDeleteModule={canDeleteModule as ((moduleId: ModuleId) => boolean) | undefined}
    />
  )
}
