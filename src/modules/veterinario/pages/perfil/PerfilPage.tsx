import { useEffect } from 'react'
import { VetPerfilView, VetChangePasswordModal } from '../../components'
import { useVetPerfil } from '../../hooks'

// Página Perfil del veterinario (datos reales de la API).
export function PerfilPage({ onNotice }: { onNotice?: (message: string) => void } = {}) {
  const {
    profile,
    isLoading,
    error,
    notice,
    isPasswordModalOpen,
    isChangingPassword,
    passwordError,
    openPasswordModal,
    closePasswordModal,
    changePassword,
    handleChangePhoto,
  } = useVetPerfil(true)

  useEffect(() => {
    if (notice && onNotice) {
      onNotice(notice)
    }
  }, [notice, onNotice])

  if (isLoading && !profile) {
    return (
      <div className="flex items-center gap-2 text-sage p-6">
        <div className="w-4 h-4 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
        <p className="text-sm font-medium">Cargando perfil del veterinario…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs sm:text-sm" role="alert">
        {error}
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-w-0 overflow-x-hidden">
      <VetPerfilView
        profile={profile}
        onChangePhoto={handleChangePhoto}
        onChangePassword={openPasswordModal}
      />

      <VetChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
        onSubmit={changePassword}
        isSubmitting={isChangingPassword}
        error={passwordError}
      />
    </div>
  )
}
