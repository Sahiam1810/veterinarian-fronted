import { useEffect, useState } from 'react'
import {
  DuenosTablePanel,
  DuenoDrawer,
  MascotaFichaModal,
  useMascotasSuperAdmin,
} from '@/modules/superadmin'
import { fetchMyModulePermissions } from '@/modules/auth'

interface DuenosPageProps {
  onNotice?: (message: string) => void
}

// S48: sección Dueños para veterinario (y otros roles no-SuperAdmin), visible
// solo si el SuperAdmin concede el permiso "Clientes". Reutiliza la misma
// tabla, drawer y ficha que SuperAdmin — solo cambian los botones visibles.
export function DuenosPage({ onNotice }: DuenosPageProps) {
  const {
    duenoFilters,
    setDuenoFilters,
    paginatedDuenos,
    duenoPage,
    setDuenoPage,
    totalDuenoPages,
    totalDuenos,
    itemsPerPage,
    isDuenoModalOpen,
    setIsDuenoModalOpen,
    editingDueno,
    detailItem,
    setDetailItem,
    createDueno,
    updateDueno,
    deleteDueno,
    toggleDuenoStatus,
    openCreateDueno,
    openEditDueno,
    isLoading,
    loadError,
    activeNotification,
  } = useMascotasSuperAdmin()

  const [permissions, setPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
  })
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [pendingDeleteName, setPendingDeleteName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchMyModulePermissions()
      .then((perms) => {
        const clientes = perms['Clientes']
        setPermissions({
          canCreate: Boolean(clientes?.canCreate),
          canEdit: Boolean(clientes?.canEdit),
          canDelete: Boolean(clientes?.canDelete),
        })
      })
      .catch(() => {
        // Sin permisos leídos: por seguridad no se habilita ninguna acción de escritura.
      })
  }, [])

  useEffect(() => {
    if (!activeNotification) return
    onNotice?.(activeNotification)
  }, [activeNotification, onNotice])

  const confirmDelete = async () => {
    if (!pendingDeleteId) return
    setIsDeleting(true)
    try {
      await deleteDueno(pendingDeleteId)
      setPendingDeleteId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-sage font-medium">Cargando dueños…</p>
  }

  if (loadError) {
    return (
      <p className="text-sm text-danger font-medium" role="alert">
        {loadError}
      </p>
    )
  }

  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden relative flex flex-col">
      <DuenosTablePanel
        duenos={paginatedDuenos}
        duenoFilters={duenoFilters}
        onFiltersChange={setDuenoFilters}
        duenoPage={duenoPage}
        onPageChange={setDuenoPage}
        totalDuenoPages={totalDuenoPages}
        totalDuenos={totalDuenos}
        itemsPerPage={itemsPerPage}
        onView={(d) => setDetailItem({ type: 'dueno', data: d })}
        onEdit={openEditDueno}
        onToggleStatus={toggleDuenoStatus}
        onDelete={(d) => {
          setPendingDeleteId(d.id)
          setPendingDeleteName(d.name)
        }}
        onCreate={openCreateDueno}
        canCreate={permissions.canCreate}
        canEdit={permissions.canEdit}
        canDelete={permissions.canDelete}
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

      <MascotaFichaModal item={detailItem} onClose={() => setDetailItem(null)} />

      {pendingDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] cursor-pointer"
            aria-label="Cerrar confirmación"
            disabled={isDeleting}
            onClick={() => setPendingDeleteId(null)}
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
              Vas a eliminar a <span className="font-bold">{pendingDeleteName}</span> del sistema.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPendingDeleteId(null)}
                className="px-3.5 py-2 rounded-xl border border-border-tan bg-bone text-charcoal text-xs font-semibold transition cursor-pointer hover:bg-cream disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  void confirmDelete()
                }}
                className="px-3.5 py-2 rounded-xl bg-terracotta text-white text-xs font-bold transition cursor-pointer hover:bg-[#A34E35] disabled:opacity-60"
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
