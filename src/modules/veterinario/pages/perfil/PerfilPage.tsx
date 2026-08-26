import { useEffect } from 'react'
import { VetPerfilView } from '../../components'
import { useVetPerfil } from '../../hooks'

interface PerfilPageProps {
  onNotice?: (message: string) => void
}

// Página Perfil del veterinario
export function PerfilPage({ onNotice }: PerfilPageProps) {
  const {
    profile,
    isLoading,
    error,
    notice,
    handleEditProfile,
    handleChangePassword,
    handleChangePhoto,
  } = useVetPerfil(true)

  useEffect(() => {
    if (!notice) return
    onNotice?.(notice)
  }, [notice, onNotice])

  if (isLoading) {
    return <p className="text-sm text-sage font-medium">Cargando perfil…</p>
  }

  if (error) {
    return (
      <p className="text-sm text-danger font-medium" role="alert">
        {error}
      </p>
    )
  }

  if (!profile) return null

  return (
    <div className="min-w-0 overflow-x-hidden">
      <VetPerfilView
        profile={profile}
        onEditProfile={handleEditProfile}
        onChangePassword={handleChangePassword}
        onChangePhoto={handleChangePhoto}
      />
    </div>
  )
}
