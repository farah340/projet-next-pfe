'use client'

import { useState, useCallback } from 'react'
import { Search, Loader2 } from 'lucide-react'

import { TypeActivite, Categorie, ZoneResult, Lieu } from '@/types'
import { useZoneSearch } from '@/Hooks/Usezoneseach'
import { useLieux } from '@/Hooks/useLieux'
import { SearchBar } from '@/components/zone_recherche/SearchBar'
import CategorieSearch from '@/components/zone_recherche/CategorieSearch'
import { GoogleMap } from '@/components/zone_recherche/GoogleMap'
import { LieuxGrid } from '@/components/zone_recherche/LieuxGrid'

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export default function RechercheZonePage() {

  /* ── Zone search ── */
  const {
    query, setQuery,
    suggestions,
    loading: loadingSearch,
    showSuggestions,
    hideSuggestions,
  } = useZoneSearch()

  const [selectedZone, setSelectedZone] = useState<ZoneResult | null>(null)

  /* ── Catégorie sélectionnée (le type est déduit automatiquement) ── */
  const [selectedCategorie, setSelectedCategorie] = useState<Categorie | null>(null)
  const [selectedType, setSelectedType] = useState<TypeActivite | null>(null)

  /* ── Lieux ── */
  const {
    lieux, loading: loadingLieux,
    collecteEnCours, hasSearched,
    saving, saved,
    fetchLieux, saveLieux, reset: resetLieux,
  } = useLieux()

  const [selectedLieu, setSelectedLieu] = useState<Lieu | null>(null)

  /* ── Handlers ── */
  const handleSelectZone = useCallback((zone: ZoneResult) => {
    setSelectedZone(zone)
    setQuery(zone.nom.split(',')[0])
    hideSuggestions()
    resetLieux()
    setSelectedLieu(null)
  }, [setQuery, hideSuggestions, resetLieux])

  const handleClearZone = useCallback(() => {
    setSelectedZone(null)
    setQuery('')
    resetLieux()
    setSelectedLieu(null)
  }, [setQuery, resetLieux])

  /* ── Quand une catégorie est sélectionnée, on récupère aussi son type ── */
  const handleCategorieSelect = useCallback((cat: any | null) => {
    if (!cat) {
      setSelectedCategorie(null)
      setSelectedType(null)
      return
    }

    // Format compatible avec ton type Categorie existant
    setSelectedCategorie({
      id: cat.id,
      name: cat.nom,
      google_type: cat.google_type,
      keywords: cat.keywords,
      typeActiviteId: cat.type_id,
    })

    // Reconstruire le type d'activité depuis les données reçues
    setSelectedType({
      id: cat.type_id,
      nom: cat.type_nom,
      emoji: cat.type_emoji,
    })
  }, [])

  const handleSearch = useCallback(() => {
    if (!selectedZone || !selectedCategorie) return
    setSelectedLieu(null)
    fetchLieux({ zone: selectedZone, categorie: selectedCategorie, typeActivite: selectedType })
  }, [selectedZone, selectedCategorie, selectedType, fetchLieux])

  const handleSave = useCallback(() => {
    if (!selectedZone || !selectedCategorie) return
    saveLieux({ zone: selectedZone, categorie: selectedCategorie, typeActivite: selectedType, lieux })
  }, [selectedZone, selectedCategorie, selectedType, lieux, saveLieux])

  const canSearch = !!selectedZone && !!selectedCategorie && !loadingLieux

  /* ── Render ── */
  return (
    <div
      className="flex flex-col h-full bg-slate-50 overflow-y-auto"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-5 shadow-sm">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Rechercher une zone
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Trouvez et explorez des zones géographiques. Sauvegardez-les pour lancer l'analyse complète depuis <span className="font-semibold">Mes zones</span>.
          </p>
        </div>

        {/* Search card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">

          <SearchBar
            query={query}
            onChange={val => { setQuery(val); if (selectedZone) setSelectedZone(null) }}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            loading={loadingSearch}
            selectedZone={selectedZone}
            onSelect={handleSelectZone}
            onClear={handleClearZone}
            onHideSuggestions={hideSuggestions}
          />

          {/* ✅ Recherche dynamique de catégorie */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Activité
            </label>
            <CategorieSearch onSelect={handleCategorieSelect} />
          </div>

          {/* Bouton recherche */}
          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-sm"
          >
            {loadingLieux
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Recherche en cours...</>
              : <><Search className="w-4 h-4" /> Rechercher</>
            }
          </button>
        </div>
      </div>

      {/* ── CARTE ── */}
      <GoogleMap
        apiKey={GOOGLE_API_KEY}
        selectedZone={selectedZone}
        lieux={lieux}
        collecteEnCours={collecteEnCours}
        onLieuClick={setSelectedLieu}
        selectedLieu={selectedLieu}
      />

      {/* ── RÉSULTATS ── */}
      {hasSearched && (
        <LieuxGrid
          lieux={lieux}
          loading={loadingLieux}
          selectedLieu={selectedLieu}
          selectedZone={selectedZone}
          selectedCategorie={selectedCategorie}
          saving={saving}
          saved={saved}
          onLieuClick={setSelectedLieu}
          onSave={handleSave}
        />
      )}
    </div>
  )
}