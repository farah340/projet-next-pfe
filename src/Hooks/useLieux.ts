'use client'

import { useState, useCallback } from 'react'
import { Lieu, ZoneResult, Categorie, TypeActivite } from '../types'

interface FetchLieuxParams {
  zone: ZoneResult
  categorie: Categorie
  typeActivite: TypeActivite | null
}

interface SaveParams {
  zone: ZoneResult
  categorie: Categorie
  typeActivite: TypeActivite | null
  lieux: Lieu[]
}

export function useLieux() {
  const [lieux, setLieux]                   = useState<Lieu[]>([])
  const [loading, setLoading]               = useState(false)
  const [collecteEnCours, setCollecteEnCours] = useState(false)
  const [hasSearched, setHasSearched]       = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [saved, setSaved]                   = useState(false)

  const fetchLieux = useCallback(async ({ zone, categorie, typeActivite }: FetchLieuxParams) => {
    setLoading(true)
    setHasSearched(true)
    setSaved(false)
    try {
      const params = new URLSearchParams({
        lat:         String(zone.lat),
        lng:         String(zone.lng),
        categorieId: categorie.id,
        categorie:   categorie.name,
      })
      const res  = await fetch(`/api/zones/lieux?${params}`)
      const data = await res.json()
      setLieux(data.lieux || [])
      setCollecteEnCours(data.collecteEnCours || false)
    } catch (err) {
      console.error('fetchLieux error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveLieux = useCallback(async ({ zone, categorie, typeActivite, lieux }: SaveParams) => {
    if (lieux.length === 0) return
    setSaving(true)
    try {
      await fetch('/api/zones/sauvegarder', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone,
          categorieId:    categorie.id,
          categorie:      categorie.name,
          typeActiviteId: typeActivite?.id,
          lieux,
        }),
      })
      setSaved(true)
    } catch (err) {
      console.error('saveLieux error:', err)
    } finally {
      setSaving(false)
    }
  }, [])

  const reset = useCallback(() => {
    setLieux([])
    setHasSearched(false)
    setSaved(false)
    setCollecteEnCours(false)
  }, [])

  return {
    lieux,
    loading,
    collecteEnCours,
    hasSearched,
    saving,
    saved,
    fetchLieux,
    saveLieux,
    reset,
  }
}