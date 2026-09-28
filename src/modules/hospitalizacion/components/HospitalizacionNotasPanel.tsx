import { useCallback, useEffect, useState } from 'react'
import type {
  AddStayNoteDto,
  ApiHospitalizationNote,
  ApiStaffMember,
} from '../types/hospitalizacion.types'
import {
  addStayNote,
  fetchStaff,
  fetchStayNotes,
} from '../services/hospitalizacionService'
import { getStoredUser } from '@/modules/auth'
import { PageToast, PlusIcon, ReloadIcon } from '@/global/components'

interface HospitalizacionNotasPanelProps {
  stayId: string
  isDischarged?: boolean
  isStayLoading?: boolean
  canViewNotes?: boolean
  canCreateNotes?: boolean
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible'

  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function HospitalizacionNotasPanel({
  stayId,
  isDischarged = false,
  isStayLoading = true,
  canViewNotes = false,
  canCreateNotes = false,
}: HospitalizacionNotasPanelProps) {
  const [notes, setNotes] = useState<ApiHospitalizationNote[]>([])
  const [staff, setStaff] = useState<ApiStaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [handedToUserId, setHandedToUserId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const currentUserId = getStoredUser()?.id?.toLowerCase() ?? ''
  const veterinarianStaff = staff.filter((member) => {
    const isVeterinarian = member.roleName.trim().toLowerCase().includes('veterin')
    const isCurrentUser = member.id.trim().toLowerCase() === currentUserId
    return isVeterinarian && !isCurrentUser
  })

  const loadNotes = useCallback(async () => {
    if (!canViewNotes || !stayId) return

    setIsLoading(true)
    setError(null)
    try {
      const [notesResponse, staffResponse] = await Promise.all([
        fetchStayNotes(stayId),
        canCreateNotes ? fetchStaff() : Promise.resolve([]),
      ])
      setNotes(notesResponse)
      setStaff(staffResponse)
    } catch {
      setError('No se pudieron cargar las notas de la estancia.')
    } finally {
      setIsLoading(false)
    }
  }, [canCreateNotes, canViewNotes, stayId])

  useEffect(() => {
    void loadNotes()
  }, [loadNotes])

  const handleSave = async () => {
    const nota = noteText.trim()
    if (!nota) return

    const payload: AddStayNoteDto = {
      nota,
      entregadoAUserId: handedToUserId || null,
    }

    setIsSaving(true)
    try {
      await addStayNote(stayId, payload)
      setNoteText('')
      setHandedToUserId('')
      setIsFormOpen(false)
      setToastMessage('Nota registrada correctamente.')
      await loadNotes()
      window.setTimeout(() => setToastMessage(null), 3500)
    } catch {
      setError('No se pudo guardar la nota.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!canViewNotes) return null

  return (
    <section className="bg-white rounded-2xl border border-warm-grey/40 shadow-xs overflow-hidden">
      {toastMessage && <PageToast message={toastMessage} />}

      <div className="px-6 py-4.5 border-b border-warm-grey/30 bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-charcoal tracking-tight">Evolución y notas</h2>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-bone text-sage rounded-full border border-warm-grey/40">
              {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
            </span>
          </div>
          <p className="text-xs text-sage mt-0.5">
            Registra la evolución del paciente y la entrega de turno.
          </p>
        </div>

        {canCreateNotes && !isDischarged && (
          <button
            type="button"
            onClick={() => setIsFormOpen((current) => !current)}
            disabled={isStayLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition disabled:opacity-50"
          >
            <PlusIcon className="w-4 h-4" />
            {isFormOpen ? 'Cerrar' : 'Nueva nota'}
          </button>
        )}
      </div>

      <div className="p-6">
        {isFormOpen && canCreateNotes && !isDischarged && (
          <div className="mb-5 p-4 rounded-xl border border-brand/20 bg-brand/5 space-y-3">
            <label className="block text-xs font-bold text-charcoal">
              Nota de evolución o entrega de turno *
              <textarea
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Describe el estado del paciente, evolución, indicaciones o información para el siguiente turno..."
                className="mt-1.5 w-full px-3.5 py-3 rounded-xl border border-border-tan bg-white text-sm font-normal text-charcoal resize-y focus:outline-none focus:border-brand"
              />
            </label>

            <label className="block text-xs font-bold text-charcoal">
              Entregar turno a <span className="font-normal text-sage">(opcional)</span>
              <select
                value={handedToUserId}
                onChange={(event) => setHandedToUserId(event.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-border-tan bg-white text-sm font-normal text-charcoal focus:outline-none focus:border-brand"
              >
                <option value="">Seleccionar usuario...</option>
                {veterinarianStaff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} · {member.roleName}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false)
                  setNoteText('')
                  setHandedToUserId('')
                }}
                className="px-3.5 py-2 rounded-xl border border-border-tan text-xs font-semibold text-charcoal hover:bg-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving || !noteText.trim()}
                className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar nota'}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-8 text-center text-sage text-xs">
            <ReloadIcon className="w-5 h-5 mx-auto mb-2 animate-spin" />
            Cargando notas...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-terracotta-soft/30 border border-terracotta/30 flex items-center justify-between gap-3 text-xs text-danger">
            <span>{error}</span>
            <button type="button" onClick={() => void loadNotes()} className="font-bold underline">
              Reintentar
            </button>
          </div>
        ) : notes.length === 0 ? (
          <div className="py-8 text-center text-sage text-xs">
            Aún no hay notas registradas para esta estancia.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <article key={note.id} className="rounded-xl border border-warm-grey/40 bg-[#FAF8F5] p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-bold text-brand">
                    {note.authorName || 'Personal médico'}
                  </span>
                  <time className="text-[11px] text-sage">{formatDate(note.createdAt)}</time>
                </div>
                <p className="text-sm text-charcoal whitespace-pre-wrap">{note.nota}</p>
                {note.handedToName && (
                  <p className="mt-3 pt-2 border-t border-warm-grey/30 text-[11px] text-sage">
                    Entregado a: <span className="font-bold text-charcoal">{note.handedToName}</span>
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
