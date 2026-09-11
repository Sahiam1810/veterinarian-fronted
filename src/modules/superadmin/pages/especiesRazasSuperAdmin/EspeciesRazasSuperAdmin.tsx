import { useEffect, useState, useMemo, type FormEvent, type ReactNode } from 'react'
import {
  SuperAdminHeader,
  SuperAdminSidebar,
  DashboardBackgroundDecoration,
  ProfessionalCombobox,
} from '../../components'
import { useEspeciesRazasSuperAdmin } from '../../hooks/useEspeciesRazasSuperAdmin'
import type {
  EspecieCatalogo,
  EspecieFormData,
  RazaCatalogo,
  RazaFormData,
} from '../../types/especiesRazasSuperAdmin.types'
import type { ModuleId, NotificacionSuperAdmin } from '../../types'
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  PawIcon,
  PageToast,
} from '@/global/components'

export interface EspeciesRazasSuperAdminProps {
  onNavigate?: (routeId: string) => void
  onProfileClick?: () => void
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

export function EspeciesRazasSuperAdmin({
  onNavigate,
  onProfileClick: externalOnProfileClick,
  activeRoute = 'especies-razas',
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
}: EspeciesRazasSuperAdminProps = {}) {
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false)
  const isSidebarOpen =
    externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : internalIsSidebarOpen
  const toggleSidebar =
    externalOnToggleSidebar || (() => setInternalIsSidebarOpen((prev) => !prev))
  const closeSidebar =
    externalOnCloseSidebar || (() => setInternalIsSidebarOpen(false))

  const {
    isLoading,
    especies,
    filteredEspecies,
    selectedSpeciesId,
    setSelectedSpeciesId,
    selectedSpecies,
    razasDeEspecie,
    searchQuery,
    setSearchQuery,
    activeNotification,
    toastTone,
    showToast,
    saveEspecie,
    removeEspecie,
    saveRaza,
    removeRaza,
  } = useEspeciesRazasSuperAdmin()

  const [especieDrawerOpen, setEspecieDrawerOpen] = useState(false)
  const [editingEspecie, setEditingEspecie] = useState<EspecieCatalogo | null>(null)
  const [razaDrawerOpen, setRazaDrawerOpen] = useState(false)
  const [editingRaza, setEditingRaza] = useState<RazaCatalogo | null>(null)

  const [pendingDeleteEspecie, setPendingDeleteEspecie] = useState<EspecieCatalogo | null>(null)
  const [pendingDeleteRaza, setPendingDeleteRaza] = useState<RazaCatalogo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSidebarNavigate = (routeId: string) => {
    if (onNavigate) onNavigate(routeId)
    else showToast(`Navegando a: ${routeId}`)
  }

  const confirmDeleteEspecie = async () => {
    if (!pendingDeleteEspecie) return
    setIsDeleting(true)
    try {
      const ok = await removeEspecie(pendingDeleteEspecie)
      if (ok) setPendingDeleteEspecie(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDeleteRaza = async () => {
    if (!pendingDeleteRaza) return
    setIsDeleting(true)
    try {
      const ok = await removeRaza(pendingDeleteRaza)
      if (ok) setPendingDeleteRaza(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-bone relative text-charcoal">
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
        onProfileClick={externalOnProfileClick || (() => handleSidebarNavigate('perfil'))}
      />

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
          className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-7 animate-view-popup"
        >
          <DashboardBackgroundDecoration />

          {activeNotification && (
            <PageToast message={activeNotification} tone={toastTone} />
          )}

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pop-in stagger-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
                Especies y razas
              </h1>
              <p className="text-sage text-sm mt-1">
                Catálogo para mascotas: elige una especie y gestiona sus razas.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingEspecie(null)
                  setEspecieDrawerOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-charcoal text-xs font-bold hover:bg-bone transition cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                Nueva especie
              </button>
              <button
                type="button"
                disabled={!selectedSpecies}
                onClick={() => {
                  setEditingRaza(null)
                  setRazaDrawerOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-[#b55e43] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <PlusIcon className="w-4 h-4" />
                Nueva raza
              </button>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 animate-pop-in stagger-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar especie o raza..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-tan bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(240px,320px)_1fr] gap-4 sm:gap-5 flex-1 min-h-0 animate-pop-in stagger-3">
            {/* Panel especies */}
            <section className="bg-white rounded-2xl border border-border-tan/70 shadow-xs flex flex-col overflow-hidden min-h-[280px]">
              <div className="px-4 py-3 border-b border-border-tan/50 bg-bone/50">
                <h2 className="text-sm font-bold text-brand">Especies</h2>
                <p className="text-[11px] text-sage mt-0.5">
                  {isLoading ? 'Cargando…' : `${filteredEspecies.length} registradas`}
                </p>
              </div>
              <ul className="flex-1 overflow-y-auto divide-y divide-border-tan/30">
                {!isLoading && filteredEspecies.length === 0 && (
                  <li className="p-6 text-center text-sage text-sm">
                    No hay especies. Crea la primera.
                  </li>
                )}
                {filteredEspecies.map((esp) => {
                  const active = esp.id === selectedSpeciesId
                  return (
                    <li key={esp.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedSpeciesId(esp.id)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition cursor-pointer ${
                          active
                            ? 'bg-sage-soft/60 border-l-4 border-brand'
                            : 'hover:bg-bone/60 border-l-4 border-transparent'
                        }`}
                      >
                        <span className="w-9 h-9 rounded-xl bg-sage-soft text-brand flex items-center justify-center shrink-0">
                          <PawIcon className="w-4 h-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold text-charcoal text-sm truncate">
                            {esp.name}
                          </span>
                          <span className="block text-[11px] text-sage">
                            {esp.raceCount} raza{esp.raceCount === 1 ? '' : 's'}
                          </span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingEspecie(esp)
                              setEspecieDrawerOpen(true)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.stopPropagation()
                                setEditingEspecie(esp)
                                setEspecieDrawerOpen(true)
                              }
                            }}
                            className="p-1.5 text-sage hover:text-brand rounded-lg hover:bg-white"
                            aria-label={`Editar ${esp.name}`}
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation()
                              setPendingDeleteEspecie(esp)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.stopPropagation()
                                setPendingDeleteEspecie(esp)
                              }
                            }}
                            className="p-1.5 text-sage hover:text-danger rounded-lg hover:bg-white"
                            aria-label={`Eliminar ${esp.name}`}
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>

            {/* Panel razas */}
            <section className="bg-white rounded-2xl border border-border-tan/70 shadow-xs flex flex-col overflow-hidden min-h-[280px]">
              <div className="px-4 sm:px-6 py-3 border-b border-border-tan/50 bg-bone/50 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-brand">
                    {selectedSpecies
                      ? `Razas de ${selectedSpecies.name}`
                      : 'Razas'}
                  </h2>
                  <p className="text-[11px] text-sage mt-0.5">
                    Cada raza pertenece a una sola especie.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[420px]">
                  <thead>
                    <tr className="bg-bone/80 border-b border-border-tan/60 text-sage text-[0.72rem] font-bold tracking-wider uppercase">
                      <th className="py-3 px-6">Raza</th>
                      <th className="py-3 px-4">Especie</th>
                      <th className="py-3 px-6 text-center w-28">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-tan/30 text-xs sm:text-sm">
                    {!selectedSpecies && (
                      <tr>
                        <td colSpan={3} className="py-10 text-center text-sage font-medium">
                          Selecciona una especie para ver sus razas.
                        </td>
                      </tr>
                    )}
                    {selectedSpecies && razasDeEspecie.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-10 text-center text-sage font-medium">
                          Sin razas para esta especie. Crea la primera.
                        </td>
                      </tr>
                    )}
                    {razasDeEspecie.map((raza) => (
                      <tr key={raza.id} className="hover:bg-bone/40 transition">
                        <td className="py-3.5 px-6 font-bold text-charcoal">{raza.name}</td>
                        <td className="py-3.5 px-4 text-charcoal/80">
                          {raza.speciesName || selectedSpecies?.name}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRaza(raza)
                                setRazaDrawerOpen(true)
                              }}
                              className="p-1.5 text-sage hover:text-brand hover:bg-white rounded-lg border border-transparent hover:border-border-tan transition cursor-pointer"
                              aria-label={`Editar ${raza.name}`}
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteRaza(raza)}
                              className="p-1.5 text-sage hover:text-danger hover:bg-white rounded-lg border border-transparent hover:border-border-tan transition cursor-pointer"
                              aria-label={`Eliminar ${raza.name}`}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      <EspecieDrawer
        isOpen={especieDrawerOpen}
        editing={editingEspecie}
        onClose={() => {
          setEspecieDrawerOpen(false)
          setEditingEspecie(null)
        }}
        onSave={async (data) => {
          const ok = await saveEspecie(data, editingEspecie?.id)
          if (ok) {
            setEspecieDrawerOpen(false)
            setEditingEspecie(null)
          }
        }}
      />

      <RazaDrawer
        isOpen={razaDrawerOpen}
        editing={editingRaza}
        especies={especies}
        defaultSpeciesId={selectedSpeciesId}
        onClose={() => {
          setRazaDrawerOpen(false)
          setEditingRaza(null)
        }}
        onSave={async (data) => {
          const ok = await saveRaza(data, editingRaza?.id)
          if (ok) {
            setRazaDrawerOpen(false)
            setEditingRaza(null)
            setSelectedSpeciesId(data.speciesId)
          }
        }}
      />

      {pendingDeleteEspecie && (
        <ConfirmModal
          title="¿Eliminar especie?"
          message={
            <>
              Vas a eliminar{' '}
              <span className="font-bold">{pendingDeleteEspecie.name}</span>. Solo
              es posible si no tiene razas asociadas.
            </>
          }
          confirming={isDeleting}
          onCancel={() => setPendingDeleteEspecie(null)}
          onConfirm={() => void confirmDeleteEspecie()}
        />
      )}

      {pendingDeleteRaza && (
        <ConfirmModal
          title="¿Eliminar raza?"
          message={
            <>
              Vas a eliminar{' '}
              <span className="font-bold">{pendingDeleteRaza.name}</span> de{' '}
              <span className="font-bold">
                {pendingDeleteRaza.speciesName || selectedSpecies?.name}
              </span>
              . No se puede deshacer.
            </>
          }
          confirming={isDeleting}
          onCancel={() => setPendingDeleteRaza(null)}
          onConfirm={() => void confirmDeleteRaza()}
        />
      )}
    </div>
  )
}

function ConfirmModal({
  title,
  message,
  confirming,
  onCancel,
  onConfirm,
}: {
  title: string
  message: ReactNode
  confirming: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] cursor-pointer"
        aria-label="Cerrar confirmación"
        disabled={confirming}
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border-tan bg-white p-5 shadow-[0_16px_40px_rgba(35,78,70,0.18)]"
      >
        <h2 className="text-base font-bold text-brand tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-charcoal leading-snug">{message}</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={confirming}
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl border border-border-tan bg-bone text-charcoal text-xs font-semibold transition cursor-pointer hover:bg-cream disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={confirming}
            onClick={onConfirm}
            className="px-3.5 py-2 rounded-xl bg-terracotta text-white text-xs font-bold transition cursor-pointer hover:bg-[#b55e43] disabled:opacity-50"
          >
            {confirming ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EspecieDrawer({
  isOpen,
  editing,
  onClose,
  onSave,
}: {
  isOpen: boolean
  editing: EspecieCatalogo | null
  onClose: () => void
  onSave: (data: EspecieFormData) => Promise<void>
}) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setName(editing?.name || '')
    }
  }, [isOpen, editing])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsRendered(false)
      setIsClosing(false)
      onClose()
    }, 220)
  }

  if (!isRendered) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({ name })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <button
        type="button"
        className={`absolute inset-0 bg-charcoal/40 backdrop-blur-xs ${
          isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
        }`}
        aria-label="Cerrar"
        onClick={handleClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l border-border-tan flex flex-col ${
          isClosing ? 'drawer-panel-exit' : 'drawer-panel-animate'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70">
          <h3 className="text-xl font-bold text-brand">
            {editing ? 'Editar especie' : 'Nueva especie'}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
          >
            ✕
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block font-bold text-charcoal mb-1.5 text-sm">
              Nombre <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Perro, Gato, Conejo"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
            <p className="mt-1 text-[11px] text-sage">Máximo 20 caracteres.</p>
          </div>
          <div className="pt-4 border-t border-border-tan/60 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-border-tan text-sage font-bold hover:bg-bone cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Guardando…' : editing ? 'Guardar' : 'Crear especie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RazaDrawer({
  isOpen,
  editing,
  especies,
  defaultSpeciesId,
  onClose,
  onSave,
}: {
  isOpen: boolean
  editing: RazaCatalogo | null
  especies: EspecieCatalogo[]
  defaultSpeciesId: string | null
  onClose: () => void
  onSave: (data: RazaFormData) => Promise<void>
}) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)
  const [name, setName] = useState('')
  const [speciesId, setSpeciesId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setName(editing?.name || '')
      setSpeciesId(editing?.speciesId || defaultSpeciesId || especies[0]?.id || '')
    }
  }, [isOpen, editing, defaultSpeciesId, especies])

  const especiesOpciones = useMemo(() => {
    return especies.map((s) => ({
      id: s.id,
      name: s.name,
    }))
  }, [especies])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsRendered(false)
      setIsClosing(false)
      onClose()
    }, 220)
  }

  if (!isRendered) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({ name, speciesId })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <button
        type="button"
        className={`absolute inset-0 bg-charcoal/40 backdrop-blur-xs ${
          isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
        }`}
        aria-label="Cerrar"
        onClick={handleClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l border-border-tan flex flex-col ${
          isClosing ? 'drawer-panel-exit' : 'drawer-panel-animate'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70">
          <h3 className="text-xl font-bold text-brand">
            {editing ? 'Editar raza' : 'Nueva raza'}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
          >
            ✕
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="relative z-20">
            <label className="block font-bold text-charcoal mb-1.5 text-sm">
              Especie <span className="text-terracotta">*</span>
            </label>
            <ProfessionalCombobox
              value={speciesId}
              onChange={setSpeciesId}
              options={especiesOpciones}
              hasAllOption={false}
              placeholder={especies.length === 0 ? 'Sin especies' : 'Seleccionar especie...'}
              searchPlaceholder="Buscar especie por nombre..."
              className="w-full bg-white"
              disabled={especies.length === 0}
            />
            <p className="mt-1 text-[11px] text-sage">
              La raza quedará asignada a esta especie.
            </p>
          </div>
          <div>
            <label className="block font-bold text-charcoal mb-1.5 text-sm">
              Nombre de la raza <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Labrador Retriever"
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
            <p className="mt-1 text-[11px] text-sage">Máximo 20 caracteres.</p>
          </div>
          <div className="pt-4 border-t border-border-tan/60 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-border-tan text-sage font-bold hover:bg-bone cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !speciesId}
              className="px-5 py-2.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Guardando…' : editing ? 'Guardar' : 'Crear raza'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
