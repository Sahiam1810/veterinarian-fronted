import { OrdenesMedicasPendientesPanel } from '@/modules/veterinario/components/OrdenesMedicasPendientesPanel'
import type { RecepModuleId } from '../../utils/recepModulePermissions'

interface OrdenesMedicasPageProps {
  canEditModule?: (moduleId: RecepModuleId) => boolean
}

export function OrdenesMedicasPage({ canEditModule }: OrdenesMedicasPageProps) {
  const canEdit = canEditModule ? canEditModule('ordenesMedicas') : true
  return <OrdenesMedicasPendientesPanel canEdit={canEdit} />
}
