import { useState, useEffect, useMemo, type FormEvent } from 'react'
import {
  SuperAdminHeader,
  SuperAdminSidebar,
  DashboardBackgroundDecoration,
  HistoriaClinicaSuperAdminModal,
} from '../../components'
import { useMascotasSuperAdmin } from '../../hooks'
import type {
  SuperAdminMascota,
  SuperAdminDueno,
  MascotaFormData,
  DuenoFormData,
  EspecieMascota,
  EstadoMascota,
  SexoMascota,
} from '../../types'
import type { ModuleId, NotificacionSuperAdmin } from '../../types'
import {
  filterRacesBySpecies,
  isValidAgeYearsInput,
  isValidWeightKgInput,
  parseAgeToInt,
  parseWeightToDecimal,
  mapSpeciesNameToEspecie,
} from '../../utils/superAdminApiMappers'
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  PawIcon,
  OwnersIcon,
  MedicalHistoryIcon,
  PageToast,
} from '@/global/components'

// Estilo base de botones de acción en la tabla
const actionBtnClass =
  'inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-border-tan bg-white text-sage hover:text-brand hover:bg-bone hover:border-brand/30 text-[11px] font-semibold transition cursor-pointer shadow-2xs'
const actionDangerBtnClass =
  'inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-terracotta/25 bg-terracotta-soft text-terracotta hover:bg-[#F8E8E2] text-[11px] font-semibold transition cursor-pointer shadow-2xs'


export interface MascotasSuperAdminProps {
  onNavigate?: (routeId: string) => void
  activeRoute?: string
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  onCloseSidebar?: () => void
  userName?: string
  userRole?: string
  onLogout?: () => void
  canViewModule?: (moduleId: ModuleId) => boolean
  notifications?: NotificacionSuperAdmin[]
  isLoadingNotifications?: boolean
  notificationsError?: string | null
  onMarkNotificationRead?: (id: string) => void
  onMarkAllNotificationsRead?: () => void
  onReloadNotifications?: () => void
}

/* ============================================================================
   1. DRAWER / MODAL: REGISTRAR / EDITAR MASCOTA
   ============================================================================ */
interface MascotaDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: MascotaFormData) => void
  editingMascota: SuperAdminMascota | null
  duenos: SuperAdminDueno[]
  speciesOptions: { id: string; name: string }[]
  raceOptions: { id: string; name: string; speciesId: string }[]
}

function MascotaDrawer({
  isOpen,
  onClose,
  onSave,
  editingMascota,
  duenos,
  speciesOptions,
  raceOptions,
}: MascotaDrawerProps) {
  const defaultSpecies = (speciesOptions[0]?.name || 'Canino') as EspecieMascota

  const [name, setName] = useState(editingMascota?.name || '')
  const [species, setSpecies] = useState<EspecieMascota>(editingMascota?.species || defaultSpecies)
  const [breed, setBreed] = useState(editingMascota?.breed || '')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<SexoMascota>(editingMascota?.sex || 'Macho')
  const [weight, setWeight] = useState('')
  const [ownerId, setOwnerId] = useState(editingMascota?.ownerId || duenos[0]?.id || '')
  const [status, setStatus] = useState<EstadoMascota>(editingMascota?.status || 'Activo')
  const [photoUrl, setPhotoUrl] = useState(editingMascota?.photoUrl || '')
  const [notes, setNotes] = useState(editingMascota?.notes || '')
  const [formError, setFormError] = useState<string | null>(null)

  // Razas válidas solo para la especie elegida (por speciesId de API)
  const racesForSpecies = useMemo(
    () => filterRacesBySpecies(species, raceOptions, speciesOptions),
    [species, raceOptions, speciesOptions],
  )

  // Sincroniza el formulario al abrir o cambiar la mascota editada
  useEffect(() => {
    if (!isOpen) return
    if (editingMascota) {
      // Alinea el nombre de especie con el catálogo API (Perro/Canino, etc.)
      const speciesFromCatalog =
        speciesOptions.find(
          (s) =>
            s.name === editingMascota.species ||
            mapSpeciesNameToEspecie(s.name) === mapSpeciesNameToEspecie(editingMascota.species),
        )?.name || editingMascota.species

      setName(editingMascota.name)
      setSpecies(speciesFromCatalog as EspecieMascota)
      setBreed(editingMascota.breed)
      // Solo número: el estándar UI es años / kg
      setAge(String(parseAgeToInt(editingMascota.age)))
      setSex(editingMascota.sex)
      setWeight(String(parseWeightToDecimal(editingMascota.weight)))
      setOwnerId(editingMascota.ownerId)
      setStatus(editingMascota.status)
      setPhotoUrl(editingMascota.photoUrl || '')
      setNotes(editingMascota.notes || '')
    } else {
      const firstSpecies = (speciesOptions[0]?.name || 'Canino') as EspecieMascota
      const firstRaces = filterRacesBySpecies(firstSpecies, raceOptions, speciesOptions)
      setName('')
      setSpecies(firstSpecies)
      setBreed(firstRaces[0]?.name || '')
      setAge('')
      setSex('Macho')
      setWeight('')
      setOwnerId(duenos[0]?.id || '')
      setStatus('Activo')
      setPhotoUrl('')
      setNotes('')
    }
    setFormError(null)
  }, [isOpen, editingMascota, duenos, speciesOptions, raceOptions])

  // Si cambia la especie, alinea o limpia la raza
  useEffect(() => {
    if (!isOpen) return
    if (racesForSpecies.length === 0) {
      if (breed) setBreed('')
      return
    }
    if (!racesForSpecies.some((r) => r.name === breed)) {
      setBreed(racesForSpecies[0].name)
    }
  }, [isOpen, racesForSpecies, breed])

  if (!isOpen) return null

  const handleSpeciesChange = (nextSpecies: EspecieMascota) => {
    setSpecies(nextSpecies)
    const nextRaces = filterRacesBySpecies(nextSpecies, raceOptions, speciesOptions)
    setBreed(nextRaces[0]?.name || '')
    setFormError(null)
  }

  const handleAgeChange = (raw: string) => {
    if (!isValidAgeYearsInput(raw)) {
      setFormError('La edad solo admite números (años). No uses letras ni unidades.')
      return
    }
    setAge(raw)
    setFormError(null)
  }

  const handleWeightChange = (raw: string) => {
    if (!isValidWeightKgInput(raw)) {
      setFormError('El peso solo admite números (kg). No uses letras ni unidades.')
      return
    }
    setWeight(raw.replace(',', '.'))
    setFormError(null)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setFormError('Por favor ingresa el nombre de la mascota.')
      return
    }
    if (racesForSpecies.length === 0) {
      setFormError('No hay razas disponibles para la especie.')
      return
    }
    if (!breed.trim()) {
      setFormError('Por favor selecciona la raza de la mascota.')
      return
    }
    if (!racesForSpecies.some((r) => r.name === breed)) {
      setFormError('La raza no corresponde a la especie seleccionada.')
      return
    }
    if (!ownerId) {
      setFormError('Por favor selecciona el dueño responsable.')
      return
    }
    if (speciesOptions.length === 0) {
      setFormError('No hay especies configuradas en el sistema.')
      return
    }
    if (age.trim() && !isValidAgeYearsInput(age)) {
      setFormError('La edad solo admite números (años).')
      return
    }
    if (weight.trim() && !isValidWeightKgInput(weight)) {
      setFormError('El peso solo admite números (kg).')
      return
    }

    onSave({
      name: name.trim(),
      species,
      breed: breed.trim(),
      age: age.trim() || '0',
      sex,
      weight: weight.trim() || '0',
      ownerId,
      status,
      photoUrl: photoUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end modal-backdrop-animate"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full sm:w-[460px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden drawer-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white">
          <h2 className="text-xl font-bold text-brand tracking-tight flex items-center gap-2">
            <PawIcon className="w-5 h-5 text-terracotta" />
            <span>{editingMascota ? 'Editar Mascota' : 'Registrar Mascota'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form
          id="mascota-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {formError && (
            <div className="p-3 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">
              Nombre de la mascota <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Max, Luna, Toby"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Especie <span className="text-terracotta">*</span>
              </label>
              <select
                value={species}
                onChange={(e) => handleSpeciesChange(e.target.value as EspecieMascota)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              >
                {speciesOptions.length === 0 ? (
                  <option value="">Sin especies en API</option>
                ) : (
                  speciesOptions.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Raza <span className="text-terracotta">*</span>
              </label>
              {racesForSpecies.length > 0 ? (
                <>
                  <select
                    required
                    value={breed}
                    onChange={(e) => {
                      setBreed(e.target.value)
                      setFormError(null)
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                  >
                    {racesForSpecies.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-sage mt-1">
                    Solo razas de la especie elegida.
                  </p>
                </>
              ) : (
                <div className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan/80 bg-bone text-sm text-sage">
                  No hay razas disponibles para la especie
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Edad <span className="text-sage font-semibold">(años)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={age}
                onChange={(e) => handleAgeChange(e.target.value)}
                placeholder="Ej: 3"
                className="w-full px-3 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">Sexo</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as SexoMascota)}
                className="w-full px-3 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              >
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Peso <span className="text-sage font-semibold">(kg)</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                placeholder="Ej: 32"
                className="w-full px-3 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">
              Dueño responsable <span className="text-terracotta">*</span>
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            >
              {duenos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.phone} - {d.documentId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EstadoMascota)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">Foto URL (Opcional)</label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">
              Observaciones clínicas / Notas
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Vacunas, alergias, comportamiento o recomendaciones especiales..."
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-none"
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-tan/70 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:bg-bone transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="mascota-form"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#B85D43] hover:bg-[#A34E35] text-white transition shadow-xs cursor-pointer active:translate-y-0.5"
          >
            {editingMascota ? 'Guardar Cambios' : 'Registrar Mascota'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   2. DRAWER / MODAL: REGISTRAR / EDITAR DUEÑO
   ============================================================================ */
interface DuenoDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: DuenoFormData) => void
  editingDueno: SuperAdminDueno | null
}

function DuenoDrawer({
  isOpen,
  onClose,
  onSave,
  editingDueno,
}: DuenoDrawerProps) {
  const [name, setName] = useState(editingDueno?.name || '')
  const [documentId, setDocumentId] = useState(editingDueno?.documentId || '')
  const [email, setEmail] = useState(editingDueno?.email || '')
  const [phone, setPhone] = useState(editingDueno?.phone || '')
  const [address, setAddress] = useState(editingDueno?.address || '')
  const [city, setCity] = useState(editingDueno?.city || 'Bogotá')
  const [status, setStatus] = useState<EstadoMascota>(editingDueno?.status || 'Activo')
  const [formError, setFormError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setFormError('Por favor ingresa el nombre completo del dueño.')
      return
    }
    if (!documentId.trim()) {
      setFormError('Por favor ingresa la cédula / documento de identidad.')
      return
    }
    if (!phone.trim()) {
      setFormError('Por favor ingresa el teléfono de contacto.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('El correo es obligatorio: se usa para el código de verificación en el chatbot.')
      return
    }

    onSave({
      name: name.trim(),
      documentId: documentId.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      status,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end modal-backdrop-animate"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full sm:w-[460px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden drawer-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white">
          <h2 className="text-xl font-bold text-brand tracking-tight flex items-center gap-2">
            <OwnersIcon className="w-5 h-5 text-terracotta" />
            <span>{editingDueno ? 'Editar Dueño' : 'Registrar Dueño'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form
          id="dueno-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {formError && (
            <div className="p-3 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">
              Nombre Completo <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Carlos Ruiz"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Cédula / Documento <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                required
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="1098765432"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Teléfono <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 3001234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">
              Correo electrónico <span className="text-terracotta">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
            <p className="text-[11px] text-sage mt-1">
              Si inicia desde otro teléfono, se envía un código a este correo para ingresarlo en el chatbot.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">Dirección</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle 123 #45-67"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">Ciudad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bogotá"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EstadoMascota)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            >
              <option value="Activo">Activo (Habilitado)</option>
              <option value="Inactivo">Inactivo (Suspendido)</option>
            </select>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-tan/70 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:bg-bone transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="dueno-form"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#B85D43] hover:bg-[#A34E35] text-white transition shadow-xs cursor-pointer active:translate-y-0.5"
          >
            {editingDueno ? 'Guardar Cambios' : 'Registrar Dueño'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   3. MODAL: DETALLES DE MASCOTA O DUEÑO
   ============================================================================ */
function DetailModal({
  item,
  onClose,
}: {
  item: { type: 'mascota' | 'dueno'; data: SuperAdminMascota | SuperAdminDueno } | null
  onClose: () => void
}) {
  if (!item) return null

  const isMascota = item.type === 'mascota'
  const mascota = isMascota ? (item.data as SuperAdminMascota) : null
  const dueno = !isMascota ? (item.data as SuperAdminDueno) : null

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex items-center justify-center p-4 modal-backdrop-animate"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-border-tan overflow-hidden modal-content-animate"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-tan/70 bg-bone">
          <h3 className="text-base font-bold text-brand flex items-center gap-2">
            {isMascota ? 'Ficha de Mascota' : 'Ficha del Dueño'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sage hover:text-charcoal p-1 rounded-lg hover:bg-border-tan/50 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isMascota && mascota && (
            <>
              <div className="flex items-center gap-4">
                {mascota.photoUrl ? (
                  <img
                    src={mascota.photoUrl}
                    alt={mascota.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-border-tan"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-mint-soft text-brand font-bold text-2xl flex items-center justify-center border border-brand/15">
                    {mascota.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-charcoal">{mascota.name}</h4>
                  <p className="text-xs text-sage font-medium">
                    {mascota.species} • {mascota.breed}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      mascota.status === 'Activo'
                        ? 'bg-[#E8F2EF] text-brand border border-brand/15'
                        : 'bg-[#F1EFEA] text-sage border border-border-tan'
                    }`}
                  >
                    {mascota.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Edad</span>
                  <span className="font-bold text-charcoal">{mascota.age}</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Sexo / Peso</span>
                  <span className="font-bold text-charcoal">{mascota.sex} ({mascota.weight})</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Dueño</span>
                  <span className="font-bold text-[#234E46]">{mascota.ownerName}</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Teléfono</span>
                  <span className="font-bold text-charcoal">{mascota.ownerPhone}</span>
                </div>
              </div>

              {mascota.notes && (
                <div className="p-3.5 rounded-xl bg-mint-soft/50 border border-brand/10 text-xs">
                  <span className="font-bold text-brand block mb-1">Observaciones:</span>
                  <p className="text-charcoal/80 leading-relaxed">{mascota.notes}</p>
                </div>
              )}
            </>
          )}

          {!isMascota && dueno && (
            <>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-terracotta-soft text-terracotta font-bold text-2xl flex items-center justify-center border border-terracotta/20">
                  {dueno.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-charcoal">{dueno.name}</h4>
                  <p className="text-xs text-sage font-medium">{dueno.documentId}</p>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      dueno.status === 'Activo'
                        ? 'bg-[#E8F2EF] text-brand border border-brand/15'
                        : 'bg-[#F1EFEA] text-sage border border-border-tan'
                    }`}
                  >
                    {dueno.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Teléfono</span>
                  <span className="font-bold text-charcoal">{dueno.phone}</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60">
                  <span className="text-[10px] text-sage font-bold uppercase block">Correo</span>
                  <span className="font-bold text-charcoal truncate block">{dueno.email}</span>
                </div>
                <div className="p-3 rounded-xl bg-bone border border-border-tan/60 col-span-2">
                  <span className="text-[10px] text-sage font-bold uppercase block">Ubicación</span>
                  <span className="font-bold text-charcoal">{dueno.address}, {dueno.city}</span>
                </div>
              </div>

              {dueno.mascotasSummary && dueno.mascotasSummary.length > 0 && (
                <div className="p-3.5 rounded-xl bg-bone border border-border-tan text-xs">
                  <span className="font-bold text-brand block mb-2">Mascotas Registradas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {dueno.mascotasSummary.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-border-tan font-semibold text-charcoal"
                      >
                        {m}
                      </span>
                    ))}

                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-border-tan/70 bg-bone">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-hover transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   4. COMPONENTE PRINCIPAL: MASCOTAS & DUEÑOS ADMIN
   ============================================================================ */
export function MascotasSuperAdmin({
  onNavigate,
  activeRoute = 'mascotas',
  isSidebarOpen: externalIsSidebarOpen,
  onToggleSidebar: externalOnToggleSidebar,
  onCloseSidebar: externalOnCloseSidebar,
  userName = 'SuperAdmin Veterinario',
  userRole = 'SuperAdministrador',
  onLogout,
  canViewModule,
  notifications,
  isLoadingNotifications,
  notificationsError,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onReloadNotifications,
}: MascotasSuperAdminProps) {
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false)
  const [selectedHistoriaPet, setSelectedHistoriaPet] = useState<SuperAdminMascota | null>(null)
  // Confirmación de borrado (modal propio, no window.confirm)
  const [pendingDeleteMascota, setPendingDeleteMascota] = useState<SuperAdminMascota | null>(null)
  const [pendingDeleteDueno, setPendingDeleteDueno] = useState<SuperAdminDueno | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)


  const {
    activeTab,
    setActiveTab,
    duenos,
    speciesOptions,
    raceOptions,
    paginatedMascotas,
    paginatedDuenos,
    mascotaPage,
    setMascotaPage,
    totalMascotaPages,
    totalMascotas,
    duenoPage,
    setDuenoPage,
    totalDuenoPages,
    totalDuenos,
    itemsPerPage,
    mascotaFilters,
    setMascotaFilters,
    duenoFilters,
    setDuenoFilters,
    isMascotaModalOpen,
    setIsMascotaModalOpen,
    editingMascota,
    isDuenoModalOpen,
    setIsDuenoModalOpen,
    editingDueno,
    detailItem,
    setDetailItem,
    createMascota,
    updateMascota,
    deleteMascota,
    openCreateMascota,
    openEditMascota,
    createDueno,
    updateDueno,
    deleteDueno,
    toggleDuenoStatus,
    openCreateDueno,
    openEditDueno,
    activeNotification,
    showToast,
  } = useMascotasSuperAdmin()

  const isSidebarOpen =
    externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : internalIsSidebarOpen
  const toggleSidebar =
    externalOnToggleSidebar || (() => setInternalIsSidebarOpen((prev) => !prev))
  const closeSidebar =
    externalOnCloseSidebar || (() => setInternalIsSidebarOpen(false))

  const handleSidebarNavigate = (routeId: string) => {
    if (onNavigate) {
      onNavigate(routeId)
    } else {
      showToast(`Navegando a: ${routeId}`)
    }
  }

  const confirmDeleteMascota = async () => {
    if (!pendingDeleteMascota) return
    setIsDeleting(true)
    try {
      await deleteMascota(pendingDeleteMascota.id)
      setPendingDeleteMascota(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDeleteDueno = async () => {
    if (!pendingDeleteDueno) return
    setIsDeleting(true)
    try {
      await deleteDueno(pendingDeleteDueno.id)
      setPendingDeleteDueno(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-bone relative text-charcoal">
      {/* 1. Header Fijo */}
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        userName={userName}
        userRole={userRole}
        notifications={notifications}
        isLoadingNotifications={isLoadingNotifications}
        notificationsError={notificationsError}
        onMarkNotificationRead={onMarkNotificationRead}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
        onReloadNotifications={onReloadNotifications}
        onProfileClick={() => showToast('Abriendo panel de perfil de superadministrador')}
      />

      {/* 2. Cuerpo Principal con Sidebar y Área de Trabajo */}
      <div className="flex-1 flex overflow-hidden relative">
        <SuperAdminSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleSidebarNavigate}
          canViewModule={canViewModule}
          onLogout={onLogout}
        />

        <main
          key={activeRoute}
          className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 animate-view-popup"
        >
          <DashboardBackgroundDecoration />

          {activeNotification && <PageToast message={activeNotification} />}

          {/* Barra de Pestañas Superiores (Mascotas / Dueños) */}
          <div className="relative z-10 border-b border-border-tan/70 flex items-center justify-between gap-4 animate-pop-in stagger-1">
            <div className="flex items-center gap-6 sm:gap-8">
              <button
                type="button"
                onClick={() => setActiveTab('mascotas')}
                className={`relative px-5 pt-3 pb-3.5 text-sm sm:text-[15px] font-semibold transition-colors cursor-pointer ${
                  activeTab === 'mascotas'
                    ? 'text-brand font-bold after:content-[\'\'] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2.5px] after:bg-brand after:rounded-full'
                    : 'text-sage hover:text-brand'
                }`}
              >
                Mascotas
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('duenos')}
                className={`relative px-5 pt-3 pb-3.5 text-sm sm:text-[15px] font-semibold transition-colors cursor-pointer ${
                  activeTab === 'duenos'
                    ? 'text-brand font-bold after:content-[\'\'] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2.5px] after:bg-brand after:rounded-full'
                    : 'text-sage hover:text-brand'
                }`}
              >
                Dueños
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* TAB 1: MASCOTAS                                                   */}
          {/* ================================================================= */}
          {activeTab === 'mascotas' && (
            <div className="flex-1 flex flex-col gap-4 sm:gap-5 relative z-10 animate-view-popup">
              {/* Barra de Filtros y Botón Registrar */}
              <div
                className="bg-white border border-border-tan rounded-2xl sm:rounded-[1.25rem] p-4 sm:p-5 shadow-[0_2px_12px_rgba(35,78,70,0.03)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1">
                  <span className="text-[11px] sm:text-xs font-bold text-charcoal/70 tracking-wider shrink-0 uppercase">
                    Filtros:
                  </span>

                  {/* Dropdown Especies */}
                  <select
                    value={mascotaFilters.speciesFilter}
                    onChange={(e) => {
                      setMascotaFilters({ ...mascotaFilters, speciesFilter: e.target.value })
                      setMascotaPage(1)
                    }}
                    className="px-3.5 py-2 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer min-w-[150px]"
                  >
                    <option value="all">Todas las Especies</option>
                    {speciesOptions.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  {/* Dropdown Estados */}
                  <select
                    value={mascotaFilters.statusFilter}
                    onChange={(e) => {
                      setMascotaFilters({ ...mascotaFilters, statusFilter: e.target.value })
                      setMascotaPage(1)
                    }}
                    className="px-3.5 py-2 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer min-w-[140px]"
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>

                  {/* Buscador */}
                  <div className="relative flex-1 min-w-[200px]">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      value={mascotaFilters.searchQuery}
                      onChange={(e) => {
                        setMascotaFilters({ ...mascotaFilters, searchQuery: e.target.value })
                        setMascotaPage(1)
                      }}
                      placeholder="Buscar mascota..."
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                    />
                    {mascotaFilters.searchQuery && (
                      <button
                        type="button"
                        onClick={() => setMascotaFilters({ ...mascotaFilters, searchQuery: '' })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage hover:text-charcoal cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Botón + Registrar mascota */}
                <button
                  type="button"
                  onClick={openCreateMascota}
                  className="bg-terracotta hover:bg-[#A34E35] text-white inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer shrink-0 active:translate-y-0.5"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Registrar mascota</span>
                </button>
              </div>

              {/* Tabla de Mascotas */}
              <div className="bg-white border border-border-tan rounded-2xl sm:rounded-[1.25rem] pt-2 shadow-[0_4px_20px_rgba(35,78,70,0.04)] overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-bone/80 border-b border-border-tan/60">
                        <th className="py-3.5 px-4 sm:px-6">Nombre</th>
                        <th className="py-3.5 px-4">Especie / Raza</th>
                        <th className="py-3.5 px-4">Edad</th>
                        <th className="py-3.5 px-4">Sexo / Peso</th>
                        <th className="py-3.5 px-4">Dueño</th>
                        <th className="py-3.5 px-4">Estado</th>
                        <th className="py-3.5 px-4 sm:px-6 text-center min-w-[220px]">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-tan/30 text-xs sm:text-sm">
                      {paginatedMascotas.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-sage font-medium">
                            No se encontraron mascotas con los filtros seleccionados.
                          </td>
                        </tr>
                      ) : (
                        paginatedMascotas.map((m) => (
                          <tr
                            key={m.id}
                            onClick={() => setSelectedHistoriaPet(m)}
                            className="group hover:bg-[#F5F3EE] transition-colors cursor-pointer"
                          >
                            {/* Nombre con Avatar / Thumbnail */}
                            <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {m.photoUrl ? (
                                  <img
                                    src={m.photoUrl}
                                    alt={m.name}
                                    className="w-9 h-9 rounded-full object-cover border border-border-tan shadow-2xs"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-[#E8F2EF] text-[#234E46] font-bold text-sm flex items-center justify-center border border-[#234E46]/15">
                                    {m.name.charAt(0)}
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="font-bold text-charcoal group-hover:text-brand transition-colors text-sm sm:text-base leading-tight">
                                    {m.name}
                                  </span>
                                  <span className="text-[11px] text-sage font-medium leading-tight">
                                    Click para ver historia
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Especie / Raza */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-bold text-charcoal leading-tight">
                                  {m.species}
                                </span>
                                <span className="text-xs text-sage font-medium leading-tight">
                                  {m.breed}
                                </span>
                              </div>
                            </td>

                            {/* Edad */}
                            <td className="py-3.5 px-4 font-medium text-charcoal whitespace-nowrap">
                              {m.age}
                            </td>

                            {/* Sexo / Peso */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-medium text-charcoal leading-tight">
                                  {m.sex}
                                </span>
                                <span className="text-xs text-sage font-medium leading-tight">
                                  {m.weight}
                                </span>
                              </div>
                            </td>

                            {/* Dueño y Teléfono */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#234E46] leading-tight">
                                  {m.ownerName}
                                </span>
                                <span className="text-xs text-sage font-medium leading-tight">
                                  {m.ownerPhone}
                                </span>
                              </div>
                            </td>

                            {/* Estado */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold ${
                                  m.status === 'Activo'
                                    ? 'bg-[#E8F2EF] text-brand border border-brand/15'
                                    : 'bg-[#F1EFEA] text-sage border border-border-tan'
                                }`}
                              >
                                {m.status}
                              </span>
                            </td>

                            {/* Acciones: Historia / Ver / Editar / Eliminar → endpoints Pets + ClientsPets */}
                            <td
                              className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex flex-wrap items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedHistoriaPet(m)}
                                  className={actionBtnClass}
                                  title="Historia clínica"
                                  aria-label={`Historia clínica de ${m.name}`}
                                >
                                  <MedicalHistoryIcon className="w-3.5 h-3.5 text-brand" />
                                  <span className="hidden xl:inline">Historia</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDetailItem({ type: 'mascota', data: m })}
                                  className={actionBtnClass}
                                  title="Ver detalles"
                                  aria-label={`Ver detalles de ${m.name}`}
                                >
                                  <EyeIcon className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline">Ver</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditMascota(m)}
                                  className={actionBtnClass}
                                  title="Editar mascota (PUT /api/Pets)"
                                  aria-label={`Editar ${m.name}`}
                                >
                                  <EditIcon className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline">Editar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteMascota(m)}
                                  className={actionDangerBtnClass}
                                  title="Eliminar mascota (DELETE /api/Pets)"
                                  aria-label={`Eliminar ${m.name}`}
                                >
                                  <TrashIcon className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline">Eliminar</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer de Paginación */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-border-tan/50 bg-white text-xs text-sage">
                  <span>
                    Mostrando {totalMascotas === 0 ? 0 : (mascotaPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(mascotaPage * itemsPerPage, totalMascotas)} de {totalMascotas}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={mascotaPage <= 1}
                      onClick={() => setMascotaPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center justify-center px-2.5 h-8 rounded-lg text-[0.75rem] font-semibold text-sage bg-transparent border border-transparent cursor-pointer hover:not-disabled:bg-[#F5F3EE] hover:not-disabled:text-brand disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
                      aria-label="Página anterior"
                    >
                      Anterior
                    </button>

                    {Array.from({ length: totalMascotaPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setMascotaPage(num)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[0.85rem] cursor-pointer transition-all duration-150 ${
                          mascotaPage === num
                            ? 'bg-brand text-white font-bold'
                            : 'font-semibold text-sage hover:bg-[#F5F3EE] hover:text-brand'
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={mascotaPage >= totalMascotaPages}
                      onClick={() => setMascotaPage((p) => Math.min(totalMascotaPages, p + 1))}
                      className="inline-flex items-center justify-center px-2.5 h-8 rounded-lg text-[0.75rem] font-semibold text-sage bg-transparent border border-transparent cursor-pointer hover:not-disabled:bg-[#F5F3EE] hover:not-disabled:text-brand disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
                      aria-label="Página siguiente"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: DUEÑOS                                                     */}
          {/* ================================================================= */}
          {activeTab === 'duenos' && (
            <div className="flex-1 flex flex-col gap-4 sm:gap-5 relative z-10 animate-view-popup">
              {/* Barra de Filtros y Botón Registrar */}
              <div
                className="bg-white border border-border-tan rounded-2xl sm:rounded-[1.25rem] p-4 sm:p-5 shadow-[0_2px_12px_rgba(35,78,70,0.03)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1">
                  <span className="text-[11px] sm:text-xs font-bold text-charcoal/70 tracking-wider shrink-0 uppercase">
                    Filtros:
                  </span>

                  {/* Dropdown Estados */}
                  <select
                    value={duenoFilters.statusFilter}
                    onChange={(e) => {
                      setDuenoFilters({ ...duenoFilters, statusFilter: e.target.value })
                      setDuenoPage(1)
                    }}
                    className="px-3.5 py-2 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer min-w-[140px]"
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>

                  {/* Buscador */}
                  <div className="relative flex-1 min-w-[220px]">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      value={duenoFilters.searchQuery}
                      onChange={(e) => {
                        setDuenoFilters({ ...duenoFilters, searchQuery: e.target.value })
                        setDuenoPage(1)
                      }}
                      placeholder="Buscar dueño por nombre, documento o teléfono..."
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border-tan bg-white text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                    />
                    {duenoFilters.searchQuery && (
                      <button
                        type="button"
                        onClick={() => setDuenoFilters({ ...duenoFilters, searchQuery: '' })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sage hover:text-charcoal cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Botón + Registrar dueño */}
                <button
                  type="button"
                  onClick={openCreateDueno}
                  className="bg-terracotta hover:bg-[#A34E35] text-white inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer shrink-0 active:translate-y-0.5"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Registrar dueño</span>
                </button>
              </div>

              {/* Tabla de Dueños */}
              <div className="bg-white border border-border-tan rounded-2xl sm:rounded-[1.25rem] pt-2 shadow-[0_4px_20px_rgba(35,78,70,0.04)] overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-bone/80 border-b border-border-tan/60">
                        <th className="py-3.5 px-4 sm:px-6">Dueño / Documento</th>
                        <th className="py-3.5 px-4">Contacto</th>
                        <th className="py-3.5 px-4">Dirección / Ciudad</th>
                        <th className="py-3.5 px-4">Mascotas Registradas</th>
                        <th className="py-3.5 px-4">Estado</th>
                        <th className="py-3.5 px-4 sm:px-6 text-center min-w-[220px]">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-tan/30 text-xs sm:text-sm">
                      {paginatedDuenos.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-sage font-medium">
                            No se encontraron dueños con los filtros seleccionados.
                          </td>
                        </tr>
                      ) : (
                        paginatedDuenos.map((d) => (
                          <tr key={d.id} className="group">
                            {/* Nombre con Avatar */}
                            <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-terracotta-soft text-terracotta font-bold text-sm flex items-center justify-center border border-terracotta/20">
                                  {d.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-charcoal group-hover:text-brand transition-colors text-sm sm:text-base leading-tight">
                                    {d.name}
                                  </span>
                                  <span className="text-xs text-sage font-medium leading-tight">
                                    {d.documentId}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Contacto */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-bold text-charcoal leading-tight">
                                  {d.phone}
                                </span>
                                <span className="text-xs text-sage font-medium leading-tight">
                                  {d.email}
                                </span>
                              </div>
                            </td>

                            {/* Dirección */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-medium text-charcoal leading-tight">
                                  {d.address}
                                </span>
                                <span className="text-xs text-sage font-medium leading-tight">
                                  {d.city}
                                </span>
                              </div>
                            </td>

                            {/* Mascotas Registradas */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {d.mascotasSummary && d.mascotasSummary.length > 0 ? (
                                  d.mascotasSummary.map((pet, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-bone text-charcoal text-[11px] font-semibold border border-border-tan"
                                    >
                                      {pet}
                                    </span>
                                  ))
                                ) : (

                                  <span className="text-xs text-sage italic">Sin mascotas</span>
                                )}
                              </div>
                            </td>

                            {/* Estado */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-semibold ${
                                  d.status === 'Activo'
                                    ? 'bg-[#E8F2EF] text-brand border border-brand/15'
                                    : 'bg-[#F1EFEA] text-sage border border-border-tan'
                                }`}
                              >
                                {d.status}
                              </span>
                            </td>

                            {/* Acciones dueño: Ver / Editar / Activar-Desactivar / Eliminar */}
                            <td
                              className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex flex-wrap items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setDetailItem({ type: 'dueno', data: d })}
                                  className={actionBtnClass}
                                  title="Ver detalles"
                                  aria-label={`Ver detalles de ${d.name}`}
                                >
                                  <EyeIcon className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline">Ver</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditDueno(d)}
                                  className={actionBtnClass}
                                  title="Editar dueño"
                                  aria-label={`Editar ${d.name}`}
                                >
                                  <EditIcon className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline">Editar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleDuenoStatus(d.id)}
                                  className={actionBtnClass}
                                  title={d.status === 'Activo' ? 'Desactivar' : 'Activar'}
                                  aria-label={`${d.status === 'Activo' ? 'Desactivar' : 'Activar'} ${d.name}`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      d.status === 'Activo' ? 'bg-sage' : 'bg-brand'
                                    }`}
                                  />
                                  <span className="hidden xl:inline">
                                    {d.status === 'Activo' ? 'Desactivar' : 'Activar'}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteDueno(d)}
                                  className={actionDangerBtnClass}
                                  title="Eliminar dueño"
                                  aria-label={`Eliminar ${d.name}`}
                                >
                                  <TrashIcon className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline">Eliminar</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer de Paginación */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-border-tan/50 bg-white text-xs text-sage">
                  <span>
                    Mostrando {totalDuenos === 0 ? 0 : (duenoPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(duenoPage * itemsPerPage, totalDuenos)} de {totalDuenos}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={duenoPage <= 1}
                      onClick={() => setDuenoPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center justify-center px-2.5 h-8 rounded-lg text-[0.75rem] font-semibold text-sage bg-transparent border border-transparent cursor-pointer hover:not-disabled:bg-[#F5F3EE] hover:not-disabled:text-brand disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
                      aria-label="Página anterior"
                    >
                      Anterior
                    </button>

                    {Array.from({ length: totalDuenoPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setDuenoPage(num)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[0.85rem] cursor-pointer transition-all duration-150 ${
                          duenoPage === num
                            ? 'bg-brand text-white font-bold'
                            : 'font-semibold text-sage hover:bg-[#F5F3EE] hover:text-brand'
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={duenoPage >= totalDuenoPages}
                      onClick={() => setDuenoPage((p) => Math.min(totalDuenoPages, p + 1))}
                      className="inline-flex items-center justify-center px-2.5 h-8 rounded-lg text-[0.75rem] font-semibold text-sage bg-transparent border border-transparent cursor-pointer hover:not-disabled:bg-[#F5F3EE] hover:not-disabled:text-brand disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
                      aria-label="Página siguiente"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Drawers / Modals */}
      <MascotaDrawer
        isOpen={isMascotaModalOpen}
        onClose={() => setIsMascotaModalOpen(false)}
        onSave={(data) => {
          if (editingMascota) {
            updateMascota(editingMascota.id, data)
          } else {
            createMascota(data)
          }
        }}
        editingMascota={editingMascota}
        duenos={duenos}
        speciesOptions={speciesOptions}
        raceOptions={raceOptions}
      />

      <DuenoDrawer
        isOpen={isDuenoModalOpen}
        onClose={() => setIsDuenoModalOpen(false)}
        onSave={(data) => {
          if (editingDueno) {
            updateDueno(editingDueno.id, data)
          } else {
            createDueno(data)
          }
        }}
        editingDueno={editingDueno}
      />

      <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />

      {/* Modal de Historia Clínica */}
      <HistoriaClinicaSuperAdminModal
        mascota={selectedHistoriaPet}
        onClose={() => setSelectedHistoriaPet(null)}
      />

      {/* Confirmación eliminar mascota */}
      {pendingDeleteMascota && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] cursor-pointer"
            aria-label="Cerrar confirmación"
            disabled={isDeleting}
            onClick={() => setPendingDeleteMascota(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-mascota-title"
            className="relative z-10 w-full max-w-sm rounded-2xl border border-border-tan bg-white p-5 shadow-[0_16px_40px_rgba(35,78,70,0.18)]"
          >
            <h2 id="delete-mascota-title" className="text-base font-bold text-brand tracking-tight">
              ¿Eliminar mascota?
            </h2>
            <p className="mt-2 text-sm text-charcoal leading-snug">
              Vas a eliminar a <span className="font-bold">{pendingDeleteMascota.name}</span>.
              Se quita el vínculo con el dueño y el registro en el sistema.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPendingDeleteMascota(null)}
                className="px-3.5 py-2 rounded-xl border border-border-tan bg-bone text-charcoal text-xs font-semibold transition cursor-pointer hover:bg-cream disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void confirmDeleteMascota()}
                className="px-3.5 py-2 rounded-xl bg-terracotta text-white text-xs font-bold transition cursor-pointer hover:bg-[#b55e43] disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación eliminar dueño */}
      {pendingDeleteDueno && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] cursor-pointer"
            aria-label="Cerrar confirmación"
            disabled={isDeleting}
            onClick={() => setPendingDeleteDueno(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dueno-title"
            className="relative z-10 w-full max-w-sm rounded-2xl border border-border-tan bg-white p-5 shadow-[0_16px_40px_rgba(35,78,70,0.18)]"
          >
            <h2 id="delete-dueno-title" className="text-base font-bold text-brand tracking-tight">
              ¿Eliminar dueño?
            </h2>
            <p className="mt-2 text-sm text-charcoal leading-snug">
              Vas a eliminar a <span className="font-bold">{pendingDeleteDueno.name}</span>.
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPendingDeleteDueno(null)}
                className="px-3.5 py-2 rounded-xl border border-border-tan bg-bone text-charcoal text-xs font-semibold transition cursor-pointer hover:bg-cream disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void confirmDeleteDueno()}
                className="px-3.5 py-2 rounded-xl bg-terracotta text-white text-xs font-bold transition cursor-pointer hover:bg-[#b55e43] disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

