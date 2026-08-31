import { useState, type FormEvent } from 'react'
import {
  AdminHeader,
  AdminSidebar,
  DashboardBackgroundDecoration,
  HistoriaClinicaAdminModal,
} from '../../components'
import { useMascotasAdmin } from '../../hooks'
import type {
  AdminMascota,
  AdminDueno,
  MascotaFormData,
  DuenoFormData,
  EspecieMascota,
  EstadoMascota,
  SexoMascota,
} from '../../types'
import {
  SearchIcon,
  PlusIcon,
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  PawIcon,
  OwnersIcon,
  MedicalHistoryIcon,
} from '@/global/components'


interface MascotasAdminProps {
  onNavigate?: (routeId: string) => void
  activeRoute?: string
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  onCloseSidebar?: () => void
  userName?: string
  userRole?: string
  onLogout?: () => void
}

/* ============================================================================
   1. DRAWER / MODAL: REGISTRAR / EDITAR MASCOTA
   ============================================================================ */
interface MascotaDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: MascotaFormData) => void
  editingMascota: AdminMascota | null
  duenos: AdminDueno[]
}

function MascotaDrawer({
  isOpen,
  onClose,
  onSave,
  editingMascota,
  duenos,
}: MascotaDrawerProps) {
  const [name, setName] = useState(editingMascota?.name || '')
  const [species, setSpecies] = useState<EspecieMascota>(editingMascota?.species || 'Canino')
  const [breed, setBreed] = useState(editingMascota?.breed || '')
  const [age, setAge] = useState(editingMascota?.age || '')
  const [sex, setSex] = useState<SexoMascota>(editingMascota?.sex || 'Macho')
  const [weight, setWeight] = useState(editingMascota?.weight || '')
  const [ownerId, setOwnerId] = useState(editingMascota?.ownerId || duenos[0]?.id || '')
  const [status, setStatus] = useState<EstadoMascota>(editingMascota?.status || 'Activo')
  const [photoUrl, setPhotoUrl] = useState(editingMascota?.photoUrl || '')
  const [notes, setNotes] = useState(editingMascota?.notes || '')
  const [formError, setFormError] = useState<string | null>(null)

  // Sync state on open/change
  useState(() => {
    if (editingMascota) {
      setName(editingMascota.name)
      setSpecies(editingMascota.species)
      setBreed(editingMascota.breed)
      setAge(editingMascota.age)
      setSex(editingMascota.sex)
      setWeight(editingMascota.weight)
      setOwnerId(editingMascota.ownerId)
      setStatus(editingMascota.status)
      setPhotoUrl(editingMascota.photoUrl || '')
      setNotes(editingMascota.notes || '')
    } else {
      setName('')
      setSpecies('Canino')
      setBreed('')
      setAge('')
      setSex('Macho')
      setWeight('')
      setOwnerId(duenos[0]?.id || '')
      setStatus('Activo')
      setPhotoUrl('')
      setNotes('')
    }
  })

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setFormError('Por favor ingresa el nombre de la mascota.')
      return
    }
    if (!breed.trim()) {
      setFormError('Por favor ingresa la raza de la mascota.')
      return
    }
    if (!ownerId) {
      setFormError('Por favor selecciona el dueño responsable.')
      return
    }

    onSave({
      name: name.trim(),
      species,
      breed: breed.trim(),
      age: age.trim() || 'No especificada',
      sex,
      weight: weight.trim() || 'N/A',
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
                onChange={(e) => setSpecies(e.target.value as EspecieMascota)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              >
                <option value="Canino">Canino</option>
                <option value="Felino">Felino</option>
                <option value="Ave">Ave</option>
                <option value="Roedor">Roedor</option>
                <option value="Exótico">Exótico</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Raza <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                required
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Ej: Golden Retriever"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">Edad</label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ej: 3 años"
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
              <label className="block text-xs font-bold text-charcoal mb-1.5">Peso</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ej: 32 kg"
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
  editingDueno: AdminDueno | null
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
    if (!phone.trim()) {
      setFormError('Por favor ingresa el teléfono de contacto.')
      return
    }

    onSave({
      name: name.trim(),
      documentId: documentId.trim() || `CC ${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: email.trim() || 'cliente@huellitas.com',
      phone: phone.trim(),
      address: address.trim() || 'No registrada',
      city: city.trim() || 'Bogotá',
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
              <label className="block text-xs font-bold text-charcoal mb-1.5">Documento / Cédula</label>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="CC 1098765432"
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
                placeholder="Ej: 555-0192"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
            />
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
  item: { type: 'mascota' | 'dueno'; data: AdminMascota | AdminDueno } | null
  onClose: () => void
}) {
  if (!item) return null

  const isMascota = item.type === 'mascota'
  const mascota = isMascota ? (item.data as AdminMascota) : null
  const dueno = !isMascota ? (item.data as AdminDueno) : null

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
export function MascotasAdmin({
  onNavigate,
  activeRoute = 'mascotas',
  isSidebarOpen: externalIsSidebarOpen,
  onToggleSidebar: externalOnToggleSidebar,
  onCloseSidebar: externalOnCloseSidebar,
  userName = 'Admin Veterinario',
  userRole = 'Administrador',
  onLogout,
}: MascotasAdminProps) {
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [selectedHistoriaPet, setSelectedHistoriaPet] = useState<AdminMascota | null>(null)


  const {
    activeTab,
    setActiveTab,
    duenos,
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
    toggleMascotaStatus,
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
  } = useMascotasAdmin()

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

  const toggleMenu = (id: string) => {
    setActiveMenuId((curr) => (curr === id ? null : id))
  }

  const closeMenu = () => {
    setActiveMenuId(null)
  }

  return (
    <div
      className="h-screen max-h-screen overflow-hidden flex flex-col bg-bone relative text-charcoal"
      onClick={closeMenu}
    >
      {/* 1. Header Fijo */}
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        userName={userName}
        userRole={userRole}
        onNotificationClick={() => showToast('Tienes 2 notificaciones del sistema')}
        onProfileClick={() => showToast('Abriendo panel de perfil de administrador')}
      />

      {/* 2. Cuerpo Principal con Sidebar y Área de Trabajo */}
      <div className="flex-1 flex overflow-hidden relative">
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeRoute={activeRoute}
          onNavigate={handleSidebarNavigate}
          onLogout={onLogout}
        />

        <main
          key={activeRoute}
          className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 animate-view-popup"
        >
          <DashboardBackgroundDecoration />

          {activeNotification && (
            <div
              className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-brand text-white text-xs sm:text-sm font-semibold shadow-lg border border-white/20 flex items-center gap-2 pointer-events-none"
              role="alert"
            >
              <span>{activeNotification}</span>
            </div>
          )}

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
                    <option value="Canino">Canino</option>
                    <option value="Felino">Felino</option>
                    <option value="Ave">Ave</option>
                    <option value="Roedor">Roedor</option>
                    <option value="Exótico">Exótico</option>
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
                        <th className="py-3.5 px-4 sm:px-6 text-center">Acciones</th>
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

                            {/* Acciones */}
                            <td
                              className="py-3.5 px-4 sm:px-6 text-center relative whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => toggleMenu(m.id)}
                                className="p-1.5 text-sage hover:text-charcoal hover:bg-border-tan/40 rounded-lg transition-colors cursor-pointer"
                                aria-label={`Acciones para ${m.name}`}
                              >
                                <MoreVerticalIcon className="w-4 h-4" />
                              </button>

                              {activeMenuId === m.id && (
                                <div className="absolute right-6 top-10 z-30 w-44 bg-white rounded-2xl shadow-lg border border-border-tan p-1.5 text-left text-xs modal-content-animate">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu()
                                      setSelectedHistoriaPet(m)
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-bone hover:text-brand font-semibold transition cursor-pointer"
                                  >
                                    <MedicalHistoryIcon className="w-3.5 h-3.5 text-brand" />
                                    <span>Historia clínica</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu()
                                      setDetailItem({ type: 'mascota', data: m })
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-bone hover:text-brand font-semibold transition cursor-pointer"
                                  >
                                    <EyeIcon className="w-3.5 h-3.5" />
                                    <span>Ver detalles</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu()
                                      openEditMascota(m)
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-bone hover:text-brand font-semibold transition cursor-pointer"
                                  >
                                    <EditIcon className="w-3.5 h-3.5" />
                                    <span>Editar</span>
                                  </button>


                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu()
                                      toggleMascotaStatus(m.id)
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-bone font-semibold transition cursor-pointer"
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        m.status === 'Activo' ? 'bg-sage' : 'bg-brand'
                                      }`}
                                    />
                                    <span>{m.status === 'Activo' ? 'Desactivar' : 'Activar'}</span>
                                  </button>

                                  <div className="my-1 border-t border-border-tan/50" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu()
                                      deleteMascota(m.id)
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-terracotta hover:bg-terracotta-soft font-semibold transition cursor-pointer"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                    <span>Eliminar</span>
                                  </button>
                                </div>
                              )}
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
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[0.85rem] font-semibold text-sage bg-transparent border border-transparent cursor-pointer hover:not-disabled:bg-[#F5F3EE] hover:not-disabled:text-brand disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
                    >
                      ‹
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
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[0.85rem] font-semibold text-sage bg-transparent border border-transparent cursor-pointer hover:not-disabled:bg-[#F5F3EE] hover:not-disabled:text-brand disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
                    >
                      ›
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
                        <th className="py-3.5 px-4 sm:px-6 text-center">Acciones</th>
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

                            {/* Acciones */}
                            <td
                              className="py-3.5 px-4 sm:px-6 text-center relative whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => toggleMenu(d.id)}
                                className="p-1.5 text-sage hover:text-charcoal hover:bg-border-tan/40 rounded-lg transition-colors cursor-pointer"
                                aria-label={`Acciones para ${d.name}`}
                              >
                                <MoreVerticalIcon className="w-4 h-4" />
                              </button>

                              {activeMenuId === d.id && (
                                <div className="absolute right-6 top-10 z-30 w-40 bg-white rounded-2xl shadow-lg border border-border-tan p-1.5 text-left text-xs modal-content-animate">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu()
                                      setDetailItem({ type: 'dueno', data: d })
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-bone hover:text-brand font-semibold transition cursor-pointer"
                                  >
                                    <EyeIcon className="w-3.5 h-3.5" />
                                    <span>Ver detalles</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu()
                                      openEditDueno(d)
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-bone hover:text-brand font-semibold transition cursor-pointer"
                                  >
                                    <EditIcon className="w-3.5 h-3.5" />
                                    <span>Editar</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu()
                                      toggleDuenoStatus(d.id)
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal hover:bg-bone font-semibold transition cursor-pointer"
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        d.status === 'Activo' ? 'bg-sage' : 'bg-brand'
                                      }`}
                                    />
                                    <span>{d.status === 'Activo' ? 'Desactivar' : 'Activar'}</span>
                                  </button>

                                  <div className="my-1 border-t border-border-tan/50" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu()
                                      deleteDueno(d.id)
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-terracotta hover:bg-terracotta-soft font-semibold transition cursor-pointer"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                    <span>Eliminar</span>
                                  </button>
                                </div>
                              )}
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
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[0.85rem] font-semibold text-sage bg-transparent border border-transparent cursor-pointer hover:not-disabled:bg-[#F5F3EE] hover:not-disabled:text-brand disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
                    >
                      ‹
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
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[0.85rem] font-semibold text-sage bg-transparent border border-transparent cursor-pointer hover:not-disabled:bg-[#F5F3EE] hover:not-disabled:text-brand disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
                    >
                      ›
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
      <HistoriaClinicaAdminModal
        mascota={selectedHistoriaPet}
        onClose={() => setSelectedHistoriaPet(null)}
      />
    </div>
  )
}

