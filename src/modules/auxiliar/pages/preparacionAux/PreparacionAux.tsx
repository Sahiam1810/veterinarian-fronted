import { useState, type FormEvent } from 'react'
import { ViewPopup } from '../../components'
import { useAuxPreparacion, type PreparacionCitaItem } from '../../hooks'

export interface PreparacionAuxProps {
  onNotice?: (msg: string) => void
}

export function PreparacionAux({ onNotice }: PreparacionAuxProps) {
  const {
    citas,
    selectedCita,
    selectedCitaId,
    setSelectedCitaId,
    searchTerm,
    setSearchTerm,
    savePreparada,
  } = useAuxPreparacion()

  // Form states for selected appointment triaje
  const [weight, setWeight] = useState('')
  const [temp, setTemp] = useState('')
  const [obs, setObs] = useState('')
  const [vetNotes, setVetNotes] = useState('')

  const handleSelectCita = (cita: PreparacionCitaItem) => {
    setSelectedCitaId(cita.id)
    setWeight(cita.lastWeight || '')
    setTemp(cita.lastTemp || '')
    setObs('')
    setVetNotes('')
  }

  const handleSavePreparada = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedCita) return

    await savePreparada(selectedCita.id, {
      weight,
      temp,
      obs,
      vetNotes,
    })

    onNotice?.(`¡Paciente ${selectedCita.petName} marcado como preparado exitosamente!`)
    
    // Reset fields
    setWeight('')
    setTemp('')
    setObs('')
    setVetNotes('')
  }


  return (
    <ViewPopup animationKey="preparacion" className="w-full">
      <div className="w-full flex flex-col lg:flex-row gap-5 sm:gap-6 min-w-0">
      
      {/* Columna Izquierda: Tabla y Buscador */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        
        {/* Buscador de Pacientes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-border-tan rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black text-brand tracking-tight">
              Preparación de Atención
            </h1>
            <p className="text-xs sm:text-sm text-sage font-medium mt-0.5">
              Citas programadas para hoy que requieren preparación previa.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar paciente..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal bg-white placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sage">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#dce9e3] text-[#34524a] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-4 sm:px-6 font-bold">HORA</th>
                  <th className="py-4 px-4 sm:px-5 font-bold">PACIENTE</th>
                  <th className="py-4 px-4 sm:px-5 font-bold">SERVICIO / PROFESIONAL</th>
                  <th className="py-4 px-4 sm:px-6 font-bold text-center">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-tan/60 text-sm">
                {citas.map((cita) => {
                  const isSelected = cita.id === selectedCitaId
                  const isPending = cita.status === 'Pendiente'
                  const isEnPrep = cita.status === 'En preparación'
                  const isPrepared = cita.status === 'Preparada'

                  let badgeClass = 'bg-bone text-sage'
                  if (isEnPrep) badgeClass = 'bg-[#fbe8e4] text-[#854d38] border border-[#f5d0c7]'
                  if (isPending) badgeClass = 'bg-[#eef2f6] text-slate-600 border border-slate-200'
                  if (isPrepared) badgeClass = 'bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]'

                  return (
                    <tr
                      key={cita.id}
                      onClick={() => handleSelectCita(cita)}
                      className={`hover:bg-[#fcfaf7] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#f8faf9]' : ''
                      }`}
                    >
                      {/* HORA */}
                      <td className="py-4 px-4 sm:px-6 font-bold text-charcoal whitespace-nowrap">
                        {cita.time}
                      </td>

                      {/* PACIENTE */}
                      <td className="py-4 px-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-border-tan bg-bone flex items-center justify-center text-brand font-bold">
                            {cita.avatarUrl ? (
                              <img
                                src={cita.avatarUrl}
                                alt={cita.petName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              cita.petName.charAt(0)
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-charcoal truncate">
                              {cita.petName}
                            </span>
                            <span className="text-[11px] text-sage font-medium truncate">
                              Dueño: {cita.ownerName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SERVICIO / PROFESIONAL */}
                      <td className="py-4 px-4 sm:px-5">
                        <div className="flex flex-col text-xs font-semibold text-charcoal">
                          <span>{cita.service}</span>
                          <span className="text-[11px] text-gray-500 font-normal mt-0.5">
                            {cita.vetName}
                          </span>
                        </div>
                      </td>

                      {/* ESTADO */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                          {cita.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Panel de Registro de Preparación */}
      {selectedCita && (
        <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0">
          <div className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col gap-5 sticky top-6">
            
            {/* Cabecera del Paciente */}
            <div className="flex items-center gap-4 bg-bone/30 border border-border-tan/50 rounded-2xl p-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-border-tan bg-bone flex items-center justify-center text-brand text-2xl font-extrabold shadow-sm">
                {selectedCita.avatarUrl ? (
                  <img
                    src={selectedCita.avatarUrl}
                    alt={selectedCita.petName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedCita.petName.charAt(0)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <h3 className="text-base font-extrabold text-charcoal truncate">
                    {selectedCita.petName}
                  </h3>
                  
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fbe8e4] text-[#854d38]">
                    En prep.
                  </span>
                </div>

                <p className="text-xs text-sage mt-0.5 truncate">
                  {selectedCita.petBreed} • {selectedCita.petAge}
                </p>
              </div>
            </div>

            {/* Fichas de Últimas Mediciones */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#fcfbf9] border border-border-tan/60 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] font-bold text-sage uppercase tracking-wider">PESO (ÚLTIMO)</span>
                <span className="font-extrabold text-charcoal text-base mt-0.5">{selectedCita.lastWeight} kg</span>
              </div>
              <div className="bg-[#fcfbf9] border border-border-tan/60 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] font-bold text-sage uppercase tracking-wider">TEMP (ÚLTIMA)</span>
                <span className="font-extrabold text-charcoal text-base mt-0.5">{selectedCita.lastTemp} °C</span>
              </div>
            </div>

            {/* Formulario de Triaje y Registro */}
            <form onSubmit={handleSavePreparada} className="space-y-4">
              <h4 className="text-xs font-bold text-brand uppercase tracking-wider border-b border-border-tan/50 pb-1">
                REGISTRO DE PREPARACIÓN
              </h4>

              {/* Peso y Temp inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1.5">
                    Peso actual (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ej. 32.5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1.5">
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    placeholder="Ej. 38.2"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  Observaciones de preparación
                </label>
                <textarea
                  rows={3}
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Estado de ánimo, signos vitales adicionales, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                />
              </div>

              {/* Info para el Profesional */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  Información para el profesional
                </label>
                <textarea
                  rows={3}
                  value={vetNotes}
                  onChange={(e) => setVetNotes(e.target.value)}
                  placeholder="Notas importantes para el veterinario antes de entrar."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-tan text-xs sm:text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                />
              </div>

              {/* Botón Guardar */}
              <button
                type="submit"
                disabled={selectedCita.status === 'Preparada'}
                className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand hover:bg-brand-hover active:scale-97 disabled:opacity-55 disabled:pointer-events-none text-white font-bold text-sm shadow-xs transition cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Marcar como preparada</span>
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </ViewPopup>
  )
}
