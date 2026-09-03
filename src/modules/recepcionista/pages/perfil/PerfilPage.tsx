import { useEffect } from 'react'
import { RecepPerfilView, RecepChangePasswordModal } from '../../components'
import { useRecepPerfil } from '../../hooks'

interface PerfilPageProps {
  onNotice?: (message: string) => void
}

export function PerfilPage({ onNotice }: PerfilPageProps) {
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
    reloadProfile,
    changePassword,
    handleEditProfile,
    handleChangePhoto,
  } = useRecepPerfil(true)

  useEffect(() => {
    if (!notice) return
    onNotice?.(notice)
  }, [notice, onNotice])

  if (isLoading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[300px]">
        <div className="w-8 h-8 border-3 border-brand/20 border-t-brand rounded-full animate-spin" />
        <p className="text-sm text-sage font-medium">Cargando perfil del recepcionista…</p>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex flex-col items-center gap-3 text-center my-4">
        <p className="text-sm font-semibold" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={() => void reloadProfile()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-w-0 overflow-x-hidden">
      <RecepPerfilView
        profile={profile}
        onEditProfile={handleEditProfile}
        onChangePassword={openPasswordModal}
        onChangePhoto={handleChangePhoto}
      />

      <RecepChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
        onSubmit={changePassword}
        isSubmitting={isChangingPassword}
        error={passwordError}
      />
    </div>
  )
}
