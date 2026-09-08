// Tipos UI del catálogo Especies y Razas (SuperAdmin)

export interface EspecieCatalogo {
  id: string
  name: string
  raceCount: number
}

export interface RazaCatalogo {
  id: string
  name: string
  speciesId: string
  speciesName: string
}

export interface EspecieFormData {
  name: string
}

export interface RazaFormData {
  name: string
  speciesId: string
}
