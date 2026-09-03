import { VetPerfilView } from '../../components'
import { useVetPerfil } from '../../hooks'

// Página Perfil del veterinario (datos reales de la API).
export function PerfilPage(_props: { onNotice?: (message: string) => void } = {}) {
  const { profile, isLoading, error } = useVetPerfil(true)

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
      <VetPerfilView profile={profile} />
    </div>
  )
}
