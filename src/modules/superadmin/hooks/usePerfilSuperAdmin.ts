import { useState, useEffect, useCallback } from 'react'
import { getStoredUser } from '@/modules/auth'
import {
  fetchCurrentProfile,
  changeMyPassword,
} from '../services'
import { ApiError } from '@/services'

export interface SuperAdminProfileData {
  fullName: string
  displayName: string
  email: string
  phone: string
  photoUrl: string
  jobTitle: string
  systemRole: string
  clinicName: string
  clinicBranch: string
  workHours: string
  accountStatus: 'activa' | 'inactiva'
  personId?: string
  isPlatformSuperAdmin: boolean
}

const LOCAL_EXTRAS_KEY = 'huellitas_perfil_extras'

type LocalExtras = {
  phone?: string
  photoUrl?: string
  clinicName?: string
  clinicBranch?: string
  workHours?: string
  jobTitle?: string
}

function readExtras(email: string): LocalExtras {
  try {
    const raw = localStorage.getItem(LOCAL_EXTRAS_KEY)
    if (!raw) return {}
    const all = JSON.parse(raw) as Record<string, LocalExtras>
    return all[email.toLowerCase()] ?? {}
  } catch {
    return {}
  }
}

function writeExtras(email: string, extras: LocalExtras) {
  try {
    const raw = localStorage.getItem(LOCAL_EXTRAS_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, LocalExtras>) : {}
    all[email.toLowerCase()] = { ...all[email.toLowerCase()], ...extras }
    localStorage.setItem(LOCAL_EXTRAS_KEY, JSON.stringify(all))
  } catch {
    // ignore storage errors
  }
}

export function usePerfilSuperAdmin(fallbackName?: string, fallbackRole?: string) {
  const stored = getStoredUser()
  const [profile, setProfile] = useState<SuperAdminProfileData>({
    fullName: fallbackName || stored?.name || 'Usuario',
    displayName: fallbackName || stored?.name || 'Usuario',
    email: stored?.email || '',
    phone: '',
    photoUrl: '',
    jobTitle: 'Administración de la Clínica',
    systemRole: fallbackRole || stored?.roleName || 'Administrador',
    clinicName: 'Veterinaria Huellitas',
    clinicBranch: 'Sede Central',
    workHours: 'Lun - Sáb, 08:00 - 18:00',
    accountStatus: 'activa',
    personId: stored?.personId,
    isPlatformSuperAdmin: Boolean(stored?.isPlatformSuperAdmin),
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeNotification, setActiveNotification] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setActiveNotification(message)
    setTimeout(() => setActiveNotification(null), 3200)
  }, [])

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const me = await fetchCurrentProfile()
      const extras = readExtras(me.email)
      const auth = getStoredUser()
      setProfile({
        fullName: me.fullName,
        displayName: me.fullName,
        email: me.email,
        phone: extras.phone || '',
        photoUrl: extras.photoUrl || '',
        jobTitle: extras.jobTitle || 'Administración de la Clínica',
        systemRole: auth?.isPlatformSuperAdmin
          ? 'SuperAdministrador'
          : me.role || auth?.roleName || 'Usuario',
        clinicName: extras.clinicName || 'Veterinaria Huellitas',
        clinicBranch: extras.clinicBranch || 'Sede Central',
        workHours: extras.workHours || 'Lun - Sáb, 08:00 - 18:00',
        accountStatus: me.accountStatus?.toLowerCase().includes('inactiv')
          ? 'inactiva'
          : 'activa',
        personId: me.personId,
        isPlatformSuperAdmin: Boolean(auth?.isPlatformSuperAdmin),
      })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo cargar el perfil.'
      showToast(message)
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const saveProfile = async (data: { fullName: string; email: string; phone: string }) => {
    writeExtras(data.email || profile.email, { phone: data.phone })

    setProfile((prev) => ({
      ...prev,
      phone: data.phone,
    }))

    showToast(
      'Teléfono guardado únicamente en este navegador. El nombre, correo y rol son gestionados por el servidor.',
    )
    return { ok: true as const }
  }

  const savePassword = async (data: {
    currentPassword: string
    newPassword: string
  }) => {
    try {
      await changeMyPassword(data)
      showToast('Contraseña cambiada exitosamente en el servidor.')
      return { ok: true as const }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo cambiar la contraseña.'
      showToast(message)
      return { ok: false as const, error: message }
    }
  }

  const savePhoto = (photoUrl: string) => {
    writeExtras(profile.email, { photoUrl })
    setProfile((prev) => ({ ...prev, photoUrl }))
    showToast('Foto actualizada (almacenada únicamente en este navegador).')
  }

  return {
    profile,
    isLoading,
    activeNotification,
    showToast,
    saveProfile,
    savePassword,
    savePhoto,
    reload: loadProfile,
  }
}
