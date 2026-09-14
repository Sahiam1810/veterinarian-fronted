// Extraída como función pura y sin dependencias de servicios/red (mismo
// criterio que useRecepMascotas.ts) para poder probarla con el test runner
// de Node sin arrastrar imports con alias "@/..." no resueltos en tests.
export interface MascotaAuxSearchFields {
  name: string
  ownerName: string
  breed: string
  specie: string
}

export function filterAuxMascotas<T extends MascotaAuxSearchFields>(
  mascotas: T[],
  search: string,
): T[] {
  const query = search.trim().toLowerCase()
  if (!query) return mascotas
  return mascotas.filter(
    (pet) =>
      pet.name.toLowerCase().includes(query) ||
      pet.ownerName.toLowerCase().includes(query) ||
      pet.breed.toLowerCase().includes(query) ||
      pet.specie.toLowerCase().includes(query),
  )
}
