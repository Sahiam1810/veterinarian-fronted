import { useState, useEffect, useCallback } from 'react'
import { getStoredUser, setStoredUser } from '@/modules/auth'
import {
  fetchCurrentProfile,
  changeMyPassword,
  updateUser,
  fetchUserById,
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

    // SuperAdmin de plataforma no tiene fila en Users: solo extras locales
    if (profile.isPlatformSuperAdmin) {
      setProfile((prev) => ({
        ...prev,
        phone: data.phone,
        // nombre/email vienen de .env vía /me — no se pueden persistir
      }))
      showToast(
        'Teléfono guardado localmente. Nombre y correo del SuperAdmin de plataforma se definen en el .env del backend.',
      )
      return { ok: true as const }
    }

    if (!profile.personId) {
      showToast('No se encontró el ID de usuario para actualizar.')
      return { ok: false as const, error: 'Sin personId' }
    }

    try {
      const current = await fetchUserById(profile.personId)
      await updateUser(profile.personId, {
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        roleId: current.roleId,
      })

      setProfile((prev) => ({
        ...prev,
        fullName: data.fullName.trim(),
        displayName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone,
      }))

      const auth = getStoredUser()
      if (auth) {
        setStoredUser(
          { ...auth, name: data.fullName.trim(), email: data.email.trim() },
          true,
        )
      }

      showToast('Perfil actualizado correctamente.')
      return { ok: true as const }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo actualizar el perfil.'
      showToast(message)
      return { ok: false as const, error: message }
    }
  }

  const savePassword = async (data: {
    currentPassword: string
    newPassword: string
  }) => {
    if (profile.isPlatformSuperAdmin) {
      showToast(
        'La contraseña del SuperAdmin de plataforma se cambia en el .env (SuperAdmin__PasswordHash), no vía API.',
      )
      return { ok: false as const }
    }

    try {
      await changeMyPassword(data)
      showToast('Contraseña cambiada exitosamente.')
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
    showToast('Foto actualizada (almacenamiento local del navegador).')
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
