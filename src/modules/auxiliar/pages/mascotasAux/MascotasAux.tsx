import { SearchIcon } from '@/global/components'
import { ViewPopup, FilterLinesIcon } from '../../components'
import { useAuxMascotas } from '../../hooks'
import { MascotaFichaModal, type MascotaFichaModalItem } from '@/modules/superadmin'
import type { MascotaAuxItem } from '../../hooks/useAuxMascotas'

export interface MascotasAuxProps {
  onNotice?: (msg: string) => void
}

// Ficha compartida con Veterinario/Recepcionista/SuperAdmin (modal, no panel propio).
// Mismos campos que Recepcionista: sin "Esterilizado" ni "Cita Actual" (esos
// bloques extra hacían crecer el modal más que la pantalla y ocultaban el
// footer con los botones Editar/Cerrar).
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
      allergyAlert: pet.allergyAlert,
      status: 'Activo',
    },
  }
}

// Vista Mascotas del auxiliar: mismo comportamiento de buscador + paginación +
// scroll contenido que Recepcionista (S54), pero sin botón "Nueva Mascota"
// (Auxiliar es de solo lectura).
export function MascotasAux(_props: MascotasAuxProps) {
  const {
    mascotas,
    selectedPet,
    selectedPetId,
    setSelectedPetId,
    search,
    setSearch,
    pageStart,
    pageEnd,
    totalCount,
    handlePrevPage,
    handleNextPage,
    handleOpenFilters,
  } = useAuxMascotas()

  return (
    <div className="flex flex-col gap-3 sm:gap-4 h-full min-h-0 min-w-0 overflow-hidden">
      {/* Barra de búsqueda y filtros */}
      <div className="shrink-0 w-full min-w-0 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Buscar mascota</span>
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar mascota, dueño..."
            className="w-full rounded-xl border border-border-tan bg-white pl-10 pr-3 py-2.5 sm:py-3 text-sm text-charcoal placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition shadow-[0_2px_12px_rgba(35,78,70,0.03)]"
          />
        </label>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleOpenFilters}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-border-tan bg-white px-3.5 py-2.5 sm:py-3 text-sm font-bold text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer shadow-[0_2px_12px_rgba(35,78,70,0.03)]"
          >
            <FilterLinesIcon className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Tabla de mascotas */}
      <ViewPopup animationKey="mascotas-tabla" className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
        <section className="flex-1 min-w-0 min-h-0 flex flex-col rounded-2xl border border-border-tan bg-white overflow-hidden shadow-[0_2px_16px_rgba(35,78,70,0.04)]">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead className="sticky top-0 z-10 bg-[#dce9e3]">
                <tr className="text-[#34524a] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-4 sm:px-6 font-bold">MASCOTA</th>
                  <th className="py-4 px-4 sm:px-5 font-bold">ESPECIE/RAZA</th>
                  <th className="py-4 px-4 sm:px-5 font-bold">DETALLES</th>
                  <th className="py-4 px-4 sm:px-5 font-bold">DUEÑO</th>
                  <th className="py-4 px-4 sm:px-6 font-bold text-center">PRÓXIMA CITA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-tan/60 text-sm">
                {mascotas.map((pet) => {
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

          <footer className="shrink-0 flex items-center justify-between gap-3 px-3 sm:px-5 py-3.5 border-t border-border-tan bg-white">
            <p className="text-xs sm:text-sm text-sage font-medium truncate">
              Mostrando {pageStart} a {pageEnd} de {totalCount}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handlePrevPage}
                className="px-2.5 h-8 rounded-lg border border-border-tan text-xs font-semibold text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center"
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                className="px-2.5 h-8 rounded-lg border border-border-tan text-xs font-semibold text-sage hover:text-brand hover:border-brand/30 transition cursor-pointer inline-flex items-center justify-center"
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </div>
          </footer>
        </section>
      </ViewPopup>

      <MascotaFichaModal
        item={selectedPet ? toFichaItem(selectedPet) : null}
        onClose={() => setSelectedPetId('')}
      />
    </div>
  )
}
