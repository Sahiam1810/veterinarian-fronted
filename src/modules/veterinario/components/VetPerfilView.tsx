import type { VetProfilePayload } from '../types'
import { PerfilSummaryCard } from './PerfilSummaryCard'
import { PerfilDetailsPanel } from './PerfilDetailsPanel'
import { ViewPopup } from './ViewPopup'

interface VetPerfilViewProps {
  profile: VetProfilePayload
  onEditProfile?: () => void
  onChangePassword?: () => void
  onChangePhoto?: () => void
}

// Vista Perfil: altura uniforme (tarjeta foto = alto del bloque derecho)
export function VetPerfilView({
  profile,
  onEditProfile,
  onChangePassword,
  onChangePhoto,
}: VetPerfilViewProps) {
  return (
    <ViewPopup
      animationKey="perfil"
      className="min-w-0 overflow-x-hidden flex flex-col lg:flex-row lg:items-stretch gap-3 sm:gap-4"
    >
      <ViewPopup delayMs={40} className="w-full lg:w-[240px] xl:w-[260px] shrink-0 flex">
        <PerfilSummaryCard
          profile={profile}
          onEditProfile={onEditProfile}
          onChangePassword={onChangePassword}
          onChangePhoto={onChangePhoto}
        />
      </ViewPopup>

      <ViewPopup delayMs={100} className="flex-1 min-w-0">
        <PerfilDetailsPanel profile={profile} />
      </ViewPopup>
    </ViewPopup>
  )
}
