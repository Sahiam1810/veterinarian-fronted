import { useState, useMemo, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { ViewPopup, CustomSelect } from '../../components'

export interface MascotasAuxProps {
  onNotice?: (msg: string) => void
}

interface MascotaAuxItem {
  id: string
  petId: string // e.g. "#M-8492"
  name: string
  specie: 'Canino' | 'Felino' | 'Exótico' | string
  breed: string
  age: string
  gender: 'Hembra' | 'Macho' | string
  weight: string
  ownerName: string
  ownerPhone?: string
  nextAppointment: string // e.g. "Hoy, 14:30" or "Sin citas"
  sterilized: 'Sí' | 'No'
  avatarUrl?: string
  citaActual?: {
    service: string
    time: string
    vetName: string
  } | null
}

const INITIAL_MASCOTAS: MascotaAuxItem[] = [
  {
    id: 'pet-1',
    petId: '#M-8492',
    name: 'Luna',
    specie: 'Canino',
    breed: 'Golden Retriever',
    age: '3 Años',
    gender: 'Hembra',
    weight: '28.5',
    ownerName: 'Carlos Mendoza',
    ownerPhone: '+57 300 123 4567',
    nextAppointment: 'Hoy, 14:30',
    sterilized: 'Sí',
    avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=120&h=120',
    citaActual: {
      service: 'Control General (Anual)',
      time: 'Hoy, 14:30',
      vetName: 'Dr. Ramírez',
    },
  },
  {
    id: 'pet-2',
    petId: '#M-8493',
    name: 'Milo',
    specie: 'Felino',
    breed: 'Siamés',
    age: '2 Años',
    gender: 'Macho',
    weight: '4.2',
    ownerName: 'Ana Silva',
    ownerPhone: '+57 312 987 6543',
    nextAppointment: 'Mañana, 10:00',
    sterilized: 'Sí',
    avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=120&h=120',
    citaActual: {
      service: 'Desparasitación',
      time: 'Mañana, 10:00',
      vetName: 'Dr. López',
    },
  },
  {
    id: 'pet-3',
    petId: '#M-8494',
    name: 'Toby',
    specie: 'Canino',
    breed: 'Mestizo',
    age: '5 Años',
    gender: 'Macho',
    weight: '15.0',
    ownerName: 'Roberto Gómez',
    ownerPhone: '+57 315 456 7890',
    nextAppointment: 'Sin citas',
    sterilized: 'No',
    avatarUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=120&h=120',
    citaActual: null,
  },
]

export function MascotasAux({ onNotice }: MascotasAuxProps) {
  const [mascotas, setMascotas] = useState<MascotaAuxItem[]>(INITIAL_MASCOTAS)
  const [selectedPetId, setSelectedPetId] = useState<string>('pet-1')
  const [activeTab, setActiveTab] = useState<'Todos' | 'Perros' | 'Gatos' | 'Exóticos'>('Todos')
  
  // Slide Drawer Estado
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)

  // Form states for new Pet
  const [newName, setNewName] = useState('')
  const [newSpecie, setNewSpecie] = useState('Canino')
  const [newBreed, setNewBreed] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newGender, setNewGender] = useState('Hembra')
  const [newWeight, setNewWeight] = useState('')
  const [newOwner, setNewOwner] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newSterilized, setNewSterilized] = useState<'Sí' | 'No'>('No')

  const selectedPet = useMemo(() => {
    return mascotas.find((p) => p.id === selectedPetId) || mascotas[0]
  }, [mascotas, selectedPetId])

  const filteredMascotas = useMemo(() => {
    return mascotas.filter((p) => {
      if (activeTab === 'Todos') return true
      if (activeTab === 'Perros') return p.specie.toLowerCase() === 'canino'
      if (activeTab === 'Gatos') return p.specie.toLowerCase() === 'felino'
      if (activeTab === 'Exóticos') return p.specie.toLowerCase() === 'exótico'
      return true
    })
  }, [mascotas, activeTab])

  const handleAddPet = (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newOwner.trim()) return

    const newPetId = `#M-${Math.floor(1000 + Math.random() * 9000)}`
    const newPet: MascotaAuxItem = {
      id: `pet-${Date.now()}`,
      petId: newPetId,
      name: newName,
      specie: newSpecie,
      breed: newBreed || 'Mestizo',
      age: newAge || '1 Año',
      gender: newGender,
      weight: newWeight || '0.0',
      ownerName: newOwner,
      ownerPhone: newPhone,
      nextAppointment: 'Sin citas',
      sterilized: newSterilized,
      citaActual: null,
    }

    setMascotas((prev) => [...prev, newPet])
    setSelectedPetId(newPet.id)
    setIsAddDrawerOpen(false)
    onNotice?.(`¡Mascota ${newName} registrada con éxito!`)

    // Reset Form
    setNewName('')
    setNewSpecie('Canino')
    setNewBreed('')
    setNewAge('')
    setNewGender('Hembra')
    setNewWeight('')
    setNewOwner('')
    setNewPhone('')
    setNewSterilized('No')
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 sm:gap-6 min-w-0">
      
      {/* Columna Izquierda: Tabla y filtros */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        
        {/* Barra superior de herramientas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-border-tan rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={() => setIsAddDrawerOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold hover:bg-brand-hover active:scale-98 transition shadow-xs cursor-pointer"
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>Nueva Mascota</span>
          </button>

          {/* Filtros rápidos / Pestañas */}
          <div className="flex items-center gap-1 bg-bone/70 p-1 rounded-xl border border-border-tan/70">
            {(['Todos', 'Perros', 'Gatos', 'Exóticos'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-brand shadow-2xs'
                    : 'text-sage hover:text-brand'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de mascotas */}
        <ViewPopup animationKey={activeTab} className="w-full">
          <div className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#dce9e3] text-[#34524a] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-4 sm:px-6 font-bold">MASCOTA</th>
                    <th className="py-4 px-4 sm:px-5 font-bold">ESPECIE/RAZA</th>
                    <th className="py-4 px-4 sm:px-5 font-bold">DETALLES</th>
                    <th className="py-4 px-4 sm:px-5 font-bold">DUEÑO</th>
                    <th className="py-4 px-4 sm:px-6 font-bold text-center">PRÓXIMA CITA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-tan/60 text-sm">
                  {filteredMascotas.map((pet) => {
                    const isSelected = pet.id === selectedPetId
                    return (
                      <tr
                        key={pet.id}
                        onClick={() => setSelectedPetId(pet.id)}
                        className={`hover:bg-[#fcfaf7] transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#f8faf9]' : ''
                        }`}
                      >
                        {/* MASCOTA */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-border-tan bg-bone flex items-center justify-center text-brand font-bold">
                              {pet.avatarUrl ? (
                                <img
                                  src={pet.avatarUrl}
                                  alt={pet.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                pet.name.charAt(0)
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-charcoal truncate">
                                {pet.name}
                              </span>
                              <span className="text-[11px] text-sage font-medium">
                                ID: {pet.petId}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* ESPECIE/RAZA */}
                        <td className="py-4 px-4 sm:px-5 font-medium text-charcoal">
                          <div className="flex flex-col">
                            <span className="font-semibold text-charcoal">{pet.specie}</span>
                            <span className="text-xs text-gray-500">{pet.breed}</span>
                          </div>
                        </td>

                        {/* DETALLES */}
                        <td className="py-4 px-4 sm:px-5">
                          <div className="flex flex-col text-xs text-gray-700">
                            <span>{pet.age}</span>
                            <span className="font-semibold text-sage">{pet.gender}</span>
                            <span className="text-[10px] text-gray-500">{pet.weight} kg</span>
                          </div>
                        </td>

                        {/* DUEÑO */}
                        <td className="py-4 px-4 sm:px-5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal">
                            <svg
                              className="w-4 h-4 text-sage shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span>{pet.ownerName}</span>
                          </div>
                        </td>

                        {/* PRÓXIMA CITA */}
                        <td className="py-4 px-4 sm:px-6 text-center">
                          {pet.nextAppointment === 'Sin citas' ? (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-bone text-sage">
                              Sin citas
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#e8f3ef] text-brand border border-brand/10">
                              {pet.nextAppointment}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </ViewPopup>
      </div>

      {/* Columna Derecha: Ficha de detalle de mascota seleccionada */}
      {selectedPet && (
        <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0">
          <div className="bg-white rounded-3xl border border-border-tan shadow-[0_2px_16px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col gap-6 sticky top-6">
            
            {/* Header / Avatar */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-bone shadow-md bg-bone flex items-center justify-center text-brand text-3xl font-extrabold">
                {selectedPet.avatarUrl ? (
                  <img
                    src={selectedPet.avatarUrl}
                    alt={selectedPet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedPet.name.charAt(0)
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-brand">
                  {selectedPet.name}
                </h2>
                
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-bone text-sage">
                    {selectedPet.specie}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-bone text-sage">
                    {selectedPet.breed}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid de Propiedades */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#fcfbf9] border border-border-tan/60 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Edad</span>
                <span className="font-extrabold text-charcoal text-sm mt-0.5">{selectedPet.age}</span>
              </div>
              <div className="bg-[#fcfbf9] border border-border-tan/60 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Peso</span>
                <span className="font-extrabold text-charcoal text-sm mt-0.5">{selectedPet.weight} kg</span>
              </div>
              <div className="bg-[#fcfbf9] border border-border-tan/60 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Sexo</span>
                <span className="font-extrabold text-charcoal text-sm mt-0.5">{selectedPet.gender}</span>
              </div>
              <div className="bg-[#fcfbf9] border border-border-tan/60 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Esterilizado</span>
                <span className="font-extrabold text-charcoal text-sm mt-0.5">{selectedPet.sterilized}</span>
              </div>
            </div>

            {/* Card del Propietario */}
            <div className="bg-bone/40 border border-border-tan rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Propietario</span>
                  <span className="font-bold text-charcoal text-sm truncate">{selectedPet.ownerName}</span>
                </div>
              </div>

              {selectedPet.ownerPhone && (
                <a
                  href={`tel:${selectedPet.ownerPhone}`}
                  className="w-8 h-8 rounded-full bg-white hover:bg-bone border border-border-tan flex items-center justify-center text-[#854d38] transition"
                  title="Llamar propietario"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              )}
            </div>

            {/* Acción de preparar atención */}
            <button
              type="button"
              onClick={() => onNotice?.(`Iniciando preparación para ${selectedPet.name}`)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#854d38] hover:bg-[#703d2a] active:scale-97 text-white font-bold text-sm shadow-xs transition cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Preparar Atención</span>
            </button>

            {/* Cita Actual */}
            {selectedPet.citaActual && (
              <div className="flex flex-col gap-2 border-t border-border-tan/50 pt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sage uppercase tracking-wider">
                  <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
                  </svg>
                  <span>Cita Actual</span>
                </div>

                <div className="bg-[#f0f7f4] border border-[#d4ede4] rounded-2xl p-4 flex flex-col gap-1">
                  <span className="font-extrabold text-[#143d36] text-sm leading-tight">
                    {selectedPet.citaActual.service}
                  </span>
                  <span className="text-xs text-[#0f766e] font-semibold mt-1">
                    {selectedPet.citaActual.time} • {selectedPet.citaActual.vetName}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-over Drawer: Registrar Nueva Mascota */}
      {isAddDrawerOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs flex justify-end animate-fade-in"
            onClick={() => setIsAddDrawerOpen(false)}
          >
            <div
              className="w-full sm:w-[460px] lg:w-[500px] bg-white h-full shadow-2xl border-l border-border-tan flex flex-col justify-between overflow-hidden relative drawer-slide-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border-tan/70 bg-white">
                <div className="flex flex-col">
                  <h2 className="text-xl sm:text-2xl font-bold text-brand tracking-tight">
                    Registrar Mascota
                  </h2>
                  <p className="text-xs text-sage mt-0.5 font-medium">
                    Ingresa los datos para control veterinario e historial clínico
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddDrawerOpen(false)}
                  className="text-charcoal/70 hover:text-charcoal p-1.5 rounded-lg hover:bg-bone transition cursor-pointer"
                >
                  <span className="text-xl font-medium">✕</span>
                </button>
              </div>

              {/* Form Body */}
              <form
                id="nueva-mascota-form"
                onSubmit={handleAddPet}
                className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                    Nombre de la Mascota <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej. Bruno, Kira..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <CustomSelect
                      label="Especie"
                      required
                      value={newSpecie}
                      onChange={setNewSpecie}
                      options={['Canino', 'Felino', 'Exótico', 'Otro']}
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                      Raza
                    </label>
                    <input
                      type="text"
                      value={newBreed}
                      onChange={(e) => setNewBreed(e.target.value)}
                      placeholder="Ej. Pastor Alemán..."
                      className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                      Edad
                    </label>
                    <input
                      type="text"
                      value={newAge}
                      onChange={(e) => setNewAge(e.target.value)}
                      placeholder="Ej. 2 Años, 6 Meses..."
                      className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      placeholder="Ej. 14.3"
                      className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <CustomSelect
                      label="Sexo"
                      required
                      value={newGender}
                      onChange={setNewGender}
                      options={['Hembra', 'Macho']}
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="Esterilizado"
                      required
                      value={newSterilized}
                      onChange={(val) => setNewSterilized(val as 'Sí' | 'No')}
                      options={['Sí', 'No']}
                    />
                  </div>
                </div>

                <div className="space-y-3.5 pt-2">
                  <h3 className="text-xs font-bold text-sage uppercase tracking-wider border-b border-border-tan/50 pb-1">
                    Información del Propietario
                  </h3>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                      Nombre del Dueño <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newOwner}
                      onChange={(e) => setNewOwner(e.target.value)}
                      placeholder="Ej. Laura Torres..."
                      className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-charcoal mb-1.5">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Ej. +57 320 000 0000"
                      className="w-full px-4 py-2.5 rounded-xl border border-border-tan text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-2xs"
                    />
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 sm:gap-4 px-6 py-4 border-t border-border-tan/70 bg-white">
                <button
                  type="button"
                  onClick={() => setIsAddDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-charcoal/80 hover:text-charcoal hover:bg-bone transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="nueva-mascota-form"
                  className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white transition shadow-xs cursor-pointer active:translate-y-0.5"
                >
                  Registrar Mascota
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
