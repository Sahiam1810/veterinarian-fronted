import type { RecepProfilePayload } from '../types'
import { RecepPerfilDetailsPanel } from './RecepPerfilDetailsPanel'
import { RecepPerfilSummaryCard } from './RecepPerfilSummaryCard'
import { ViewPopup } from './ViewPopup'

interface RecepPerfilViewProps {
  profile: RecepProfilePayload
  onEditProfile?: () => void
  onChangePassword?: () => void
  onChangePhoto?: () => void
}

export function RecepPerfilView({
  profile,
  onEditProfile,
  onChangePassword,
  onChangePhoto,
}: RecepPerfilViewProps) {
  return (
    <ViewPopup
      animationKey="perfil"
      className="min-w-0 overflow-x-hidden flex flex-col lg:flex-row lg:items-stretch gap-3 sm:gap-4"
    >
      <ViewPopup delayMs={40} className="w-full lg:w-[260px] xl:w-[280px] shrink-0 flex">
        <RecepPerfilSummaryCard profile={profile} onChangePhoto={onChangePhoto} />
      </ViewPopup>

      <ViewPopup delayMs={100} className="flex-1 min-w-0">
        <RecepPerfilDetailsPanel
          profile={profile}
          onEditProfile={onEditProfile}
          onChangePassword={onChangePassword}
        />
      </ViewPopup>
    </ViewPopup>
  )
}
