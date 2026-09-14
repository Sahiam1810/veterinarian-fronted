import { useState, useMemo } from 'react'
import { ViewPopup } from '../../components'
import { useAuxMascotas } from '../../hooks'
import { MascotaFichaModal, type MascotaFichaModalItem } from '@/modules/superadmin'
import type { MascotaAuxItem } from '../../hooks/useAuxMascotas'

export interface MascotasAuxProps {
  onNotice?: (msg: string) => void
}

// Ficha compartida con Veterinario/Recepcionista/SuperAdmin (modal, no panel propio).
function toFichaItem(pet: MascotaAuxItem): MascotaFichaModalItem {
  return {
    type: 'vetMascota',
    data: {
      name: pet.name,
      photoUrl: pet.avatarUrl,
      species: pet.specie,
      breed: pet.breed,
      ageLabel: pet.age,
      sexLabel: pet.gender,
      weightLabel: `${pet.weight} kg`,
      microchip: 'No disponible',
      ownerName: pet.ownerName,
      ownerPhone: pet.ownerPhone || 'No disponible',
      allergyAlert: null,
      status: 'Activo',
      sterilizedLabel: pet.sterilized,
      citaActual: pet.citaActual,
    },
  }
}

export function MascotasAux(_props: MascotasAuxProps) {
  const {
    mascotas,
    selectedPet,
    selectedPetId,
    setSelectedPetId,
  } = useAuxMascotas()

  const [activeTab, setActiveTab] = useState<'Todos' | 'Perros' | 'Gatos' | 'Exóticos'>('Todos')

  const filteredMascotas = useMemo(() => {
    return mascotas.filter((p) => {
      if (activeTab === 'Todos') return true
      if (activeTab === 'Perros') return p.specie.toLowerCase().includes('canin') || p.specie.toLowerCase().includes('perr')
      if (activeTab === 'Gatos') return p.specie.toLowerCase().includes('felin') || p.specie.toLowerCase().includes('gat')
      if (activeTab === 'Exóticos') return p.specie.toLowerCase().includes('exót') || p.specie.toLowerCase().includes('exot')
      return true
    })
  }, [mascotas, activeTab])

  return (
    <div className="w-full flex flex-col gap-4 min-w-0">
      {/* Barra superior de herramientas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-border-tan rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
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

      <MascotaFichaModal
        item={selectedPet ? toFichaItem(selectedPet) : null}
        onClose={() => setSelectedPetId('')}
      />
    </div>
  )
}
