import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  EspecieCatalogo,
  EspecieFormData,
  RazaCatalogo,
  RazaFormData,
} from '../types/especiesRazasSuperAdmin.types'
import {
  createRace,
  createSpecies,
  deleteRace,
  deleteSpecies,
  updateRace,
  updateSpecies,
} from '../services'
import {
  fetchRacesCached as fetchRaces,
  fetchSpeciesCached as fetchSpecies,
  invalidateReferenceData,
} from '../cache'
import { ApiError } from '@/services'

export function useEspeciesRazasSuperAdmin() {
  const [especies, setEspecies] = useState<EspecieCatalogo[]>([])
  const [razas, setRazas] = useState<RazaCatalogo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const [toastTone, setToastTone] = useState<'success' | 'warning'>('success')

  const showToast = useCallback((message: string, tone: 'success' | 'warning' = 'success') => {
    setToastTone(tone)
    setActiveNotification(message)
    setTimeout(() => setActiveNotification(null), 3200)
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [speciesList, racesList] = await Promise.all([fetchSpecies(), fetchRaces()])
      const mappedRaces: RazaCatalogo[] = racesList.map((r) => ({
        id: r.id,
        name: r.name,
        speciesId: r.speciesId,
        speciesName: r.speciesName ?? '',
      }))
      const countBySpecies = new Map<string, number>()
      for (const race of mappedRaces) {
        countBySpecies.set(race.speciesId, (countBySpecies.get(race.speciesId) ?? 0) + 1)
      }
      const mappedSpecies: EspecieCatalogo[] = speciesList
        .map((s) => ({
          id: s.id,
          name: s.name,
          raceCount: countBySpecies.get(s.id) ?? 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'es'))

      setEspecies(mappedSpecies)
      setRazas(mappedRaces.sort((a, b) => a.name.localeCompare(b.name, 'es')))

      setSelectedSpeciesId((prev) => {
        if (prev && mappedSpecies.some((s) => s.id === prev)) return prev
        return mappedSpecies[0]?.id ?? null
      })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo cargar el catálogo de especies y razas.'
      showToast(message, 'warning')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const selectedSpecies = useMemo(
    () => especies.find((s) => s.id === selectedSpeciesId) ?? null,
    [especies, selectedSpeciesId],
  )

  const filteredEspecies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return especies
    return especies.filter((s) => s.name.toLowerCase().includes(q))
  }, [especies, searchQuery])

  const razasDeEspecie = useMemo(() => {
    if (!selectedSpeciesId) return []
    const q = searchQuery.trim().toLowerCase()
    return razas.filter((r) => {
      if (r.speciesId !== selectedSpeciesId) return false
      if (!q) return true
      return r.name.toLowerCase().includes(q)
    })
  }, [razas, selectedSpeciesId, searchQuery])

  const saveEspecie = async (data: EspecieFormData, editingId?: string) => {
    const name = data.name.trim()
    if (!name) {
      showToast('El nombre de la especie es obligatorio.', 'warning')
      return false
    }
    if (name.length > 20) {
      showToast('El nombre de la especie no puede superar 20 caracteres.', 'warning')
      return false
    }

    try {
      if (editingId) {
        await updateSpecies(editingId, name)
        showToast(`Especie "${name}" actualizada.`)
      } else {
        const created = await createSpecies(name)
        showToast(`Especie "${name}" creada.`)
        setSelectedSpeciesId(created.id)
      }
      invalidateReferenceData('species')
      await loadData()
      return true
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo guardar la especie.'
      showToast(message, 'warning')
      return false
    }
  }

  const removeEspecie = async (especie: EspecieCatalogo) => {
    try {
      await deleteSpecies(especie.id)
      showToast(`Especie "${especie.name}" eliminada.`)
      if (selectedSpeciesId === especie.id) setSelectedSpeciesId(null)
      invalidateReferenceData('species')
      invalidateReferenceData('races')
      await loadData()
      return true
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo eliminar la especie.'
      showToast(message, 'warning')
      return false
    }
  }

  const saveRaza = async (data: RazaFormData, editingId?: string) => {
    const name = data.name.trim()
    if (!name) {
      showToast('El nombre de la raza es obligatorio.', 'warning')
      return false
    }
    if (name.length > 20) {
      showToast('El nombre de la raza no puede superar 20 caracteres.', 'warning')
      return false
    }
    if (!data.speciesId) {
      showToast('Selecciona una especie para la raza.', 'warning')
      return false
    }

    try {
      if (editingId) {
        await updateRace(editingId, { name, speciesId: data.speciesId })
        showToast(`Raza "${name}" actualizada.`)
      } else {
        await createRace({ name, speciesId: data.speciesId })
        showToast(`Raza "${name}" creada.`)
      }
      invalidateReferenceData('races')
      await loadData()
      return true
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo guardar la raza.'
      showToast(message, 'warning')
      return false
    }
  }

  const removeRaza = async (raza: RazaCatalogo) => {
    try {
      await deleteRace(raza.id)
      showToast(`Raza "${raza.name}" eliminada.`)
      invalidateReferenceData('races')
      await loadData()
      return true
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo eliminar la raza.'
      showToast(message, 'warning')
      return false
    }
  }

  return {
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
    reload: loadData,
  }
}
