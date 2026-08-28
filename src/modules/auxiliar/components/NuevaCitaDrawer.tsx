import { useState, useEffect, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import type { AuxDayAppointment } from '../types'
import { CustomSelect } from './CustomSelect'

export interface NuevaCitaDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newAppointment: AuxDayAppointment) => void
}

export function NuevaCitaDrawer({
  isOpen,
  onClose,
  onSave,
}: NuevaCitaDrawerProps) {
  const [isRendered, setIsRendered] = useState(isOpen)
  const [isClosing, setIsClosing] = useState(false)

  // Campos del formulario
  const [petName, setPetName] = useState('')
  const [species, setSpecies] = useState('Perro')
  const [breed, setBreed] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [service, setService] = useState('Consulta General')
  const [professional, setProfessional] = useState('Dra. Martínez')
  const [time, setTime] = useState('02:30 PM')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      setPetName('')
      setSpecies('Perro')
      setBreed('')
      setOwnerName('')
      setOwnerPhone('')
      setService('Consulta General')
      setProfessional('Dra. Martínez')
      setTime('02:30 PM')
      setNotes('')
      setFormError(null)
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 230)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsRendered(false)
      setIsClosing(false)
    }, 230)
  }

  if (!isRendered && !isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!petName.trim()) {
      setFormError('Por favor ingresa el nombre de la mascota.')
      return
    }

    if (!ownerName.trim()) {
      setFormError('Por favor ingresa el nombre del dueño o propietario.')
      return
    }

    const speciesBreedFormatted = breed.trim()
      ? `${species} / ${breed.trim()}`
      : species

    const newAppointment: AuxDayAppointment = {
      id: `apt-${Date.now()}`,
      time: time || '02:30 PM',
      petName: petName.trim(),
      petInitial: petName.trim().charAt(0).toUpperCase(),
      avatarColor: species.toLowerCase().includes('gato') ? 'brand' : 'peach',
      speciesBreed: speciesBreedFormatted,
      service,
      professional,
      status: 'Pendiente',
      ownerName: ownerPhone.trim() ? `${ownerName.trim()} (${ownerPhone.trim()})` : ownerName.trim(),
      notes: notes.trim() || undefined,
    }

    onSave(newAppointment)
    handleClose()
  }

  const drawerContent = (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-xs flex justify-end ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-animate'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-nueva-cita-title"
    >
      <div
        className={`w-full sm:w-[460px] lg:w-[500px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative ${
          isClosing ? 'drawer-slide-out' : 'drawer-slide-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header fijo del Drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white">
          <div className="flex flex-col">
            <h2
              id="drawer-nueva-cita-title"
              className="text-xl sm:text-2xl font-bold text-brand tracking-tight"
            >
              Nueva Cita
            </h2>
            <p className="text-xs text-sage mt-0.5 font-medium">
              Programa una cita para atención y preparación clínica
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
            aria-label="Cerrar panel lateral"
          >
            <span className="text-xl font-medium leading-none">✕</span>
          </button>
        </div>

        {/* 2. Cuerpo del Formulario con scroll independiente */}
        <form
          id="nueva-cita-drawer-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5"
        >
          {formError && (
            <div className="p-3.5 rounded-xl bg-terracotta-soft text-danger text-xs font-semibold border border-danger/20">
              {formError}
            </div>
          )}

          {/* Sección: Mascota */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-sage uppercase tracking-wider border-b border-border-tan/50 pb-1">
              Datos del Paciente
            </h3>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                Nombre de la Mascota <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                required
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Ej. Luna, Max, Thor..."
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <CustomSelect
                  label="Especie"
                  required
                  value={species}
                  onChange={setSpecies}
                  options={['Perro', 'Gato', 'Ave', 'Conejo', 'Otro']}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                  Raza
                </label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="Ej. Golden, Mestizo..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Sección: Propietario */}
          <div className="space-y-3.5 pt-2">
            <h3 className="text-xs font-bold text-sage uppercase tracking-wider border-b border-border-tan/50 pb-1">
              Datos del Dueño
            </h3>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                Nombre del Dueño <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ej. Andrea Gómez"
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="Ej. +57 300 123 4567"
                className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
              />
            </div>
          </div>

          {/* Sección: Servicio y Asignación */}
          <div className="space-y-3.5 pt-2">
            <h3 className="text-xs font-bold text-sage uppercase tracking-wider border-b border-border-tan/50 pb-1">
              Servicio y Profesional
            </h3>

            <div>
              <CustomSelect
                label="Servicio Clínico"
                required
                value={service}
                onChange={setService}
                options={[
                  'Consulta General',
                  'Vacunación',
                  'Limpieza Dental',
                  'Desparasitación',
                  'Control Dermatológico',
                  'Control Post-Quirúrgico',
                  'Chequeo Preventivo',
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <CustomSelect
                  label="Profesional"
                  required
                  value={professional}
                  onChange={setProfessional}
                  options={[
                    'Dra. Martínez',
                    'Dr. López',
                    'Dr. Roberto Silva',
                    'Dra. Ana Silva',
                  ]}
                />
              </div>

              <div>
                <CustomSelect
                  label="Horario"
                  required
                  value={time}
                  onChange={setTime}
                  options={[
                    '09:00 AM',
                    '09:45 AM',
                    '10:30 AM',
                    '11:15 AM',
                    '12:00 PM',
                    '02:00 PM',
                    '02:30 PM',
                    '03:15 PM',
                    '04:00 PM',
                    '04:45 PM',
                    '05:30 PM',
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Sección: Motivo y Triaje */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs sm:text-sm font-bold text-charcoal">
              Motivo de Consulta / Observaciones
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe síntomas preliminares, alergias conocidas o instrumental a requerir..."
              className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
            />
          </div>

          {/* Banner de Estado Inicial */}
          <div className="bg-[#f0f7f4] border border-[#d4ede4] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#1b4332]">
            <svg
              className="w-4 h-4 mt-0.5 shrink-0 text-[#0f766e]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="leading-relaxed">
              La cita se creará con estado <strong>Pendiente</strong> en la tabla del día para que el auxiliar realice la preparación de peso, temperatura e instrumental.
            </p>
          </div>
        </form>

        {/* 3. Footer fijo del Drawer */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 px-6 py-4 border-t border-border-tan/70 bg-white">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:text-charcoal hover:bg-bone transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="nueva-cita-drawer-form"
            className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer active:translate-y-0.5"
          >
            Agendar Cita
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body)
  }

  return drawerContent
}
