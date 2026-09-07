import type { VetProfilePayload } from '../types'
import { PerfilSummaryCard } from './PerfilSummaryCard'
import { PerfilDetailsPanel } from './PerfilDetailsPanel'
import { ViewPopup } from './ViewPopup'

interface VetPerfilViewProps {
  profile: VetProfilePayload
  onChangePhoto?: () => void
  onChangePassword?: () => void
}

// Vista Perfil conectada a datos reales (solo lectura).
export function VetPerfilView({
  profile,
  onChangePhoto,
  onChangePassword,
}: VetPerfilViewProps) {
  return (
    <ViewPopup
      animationKey="perfil"
      className="min-w-0 overflow-x-hidden flex flex-col lg:flex-row lg:items-stretch gap-3 sm:gap-4"
    >
      <ViewPopup delayMs={40} className="w-full lg:w-[260px] xl:w-[280px] shrink-0 flex">
        <PerfilSummaryCard
          profile={profile}
          onChangePhoto={onChangePhoto}
          onChangePassword={onChangePassword}
        />
      </ViewPopup>

      <ViewPopup delayMs={100} className="flex-1 min-w-0">
        <PerfilDetailsPanel profile={profile} />
      </ViewPopup>
    </ViewPopup>
  )
}
