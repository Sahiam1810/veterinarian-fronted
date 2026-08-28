import { useEffect } from 'react'
import { ClientePerfilView } from '../../components'
import { useClientePerfil } from '../../hooks'

interface PerfilPageProps {
  onNotice?: (message: string) => void
}

export function PerfilPage({ onNotice }: PerfilPageProps) {
  const {
    profile,
    isLoading,
    error,
    notice,
    handleEditProfile,
    handleChangePassword,
    handleViewAccountStatements,
  } = useClientePerfil(true)

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
    <div className="h-full min-h-0 min-w-0 overflow-hidden">
      <ClientePerfilView
        profile={profile}
        onEditProfile={handleEditProfile}
        onChangePassword={handleChangePassword}
        onViewAccountStatements={handleViewAccountStatements}
      />
    </div>
  )
}
