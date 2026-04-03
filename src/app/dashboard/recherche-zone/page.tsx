'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, BarChart3 } from 'lucide-react'

import { TypeActivite, Categorie, ZoneResult, Lieu } from '@/types'
import { useZoneSearch }  from '@/Hooks/Usezoneseach'
import { useLieux }       from '@/Hooks/useLieux'
import { SearchBar }      from '@/components/zone_recherche/SearchBar'
import { ActivitySelector } from '@/components/zone_recherche/ActivitySelector'
import { GoogleMap }      from '@/components/zone_recherche/GoogleMap'
import { LieuxGrid }      from '@/components/zone_recherche/LieuxGrid'

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export default function RechercheZonePage() {
  const router = useRouter()

  /* ── Zone search ── */
  const {
    query, setQuery,
    suggestions,
    loading: loadingSearch,
    showSuggestions, setShowSuggestions,
    hideSuggestions,
  } = useZoneSearch()

  const [selectedZone, setSelectedZone] = useState<ZoneResult | null>(null)

  /* ── Types & catégories ── */
  const [typesActivite, setTypesActivite]     = useState<TypeActivite[]>([])
  const [selectedType, setSelectedType]       = useState<TypeActivite | null>(null)
  const [selectedCategorie, setSelectedCategorie] = useState<Categorie | null>(null)

  /* ── Lieux ── */
  const {
    lieux, loading: loadingLieux,
    collecteEnCours, hasSearched,
    saving, saved,
    fetchLieux, saveLieux, reset: resetLieux,
  } = useLieux()

  const [selectedLieu, setSelectedLieu] = useState<Lieu | null>(null)

  /* ── Charger types depuis DB ── */
  useEffect(() => {
    fetch('/api/types-activite')
      .then(r => r.json())
      .then(data => {
        setTypesActivite(data.types || [])
        if (data.types?.length > 0) setSelectedType(data.types[0])
      })
      .catch(console.error)
  }, [])

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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Rechercher une zone
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Trouvez et analysez des zones géographiques pour votre projet
            </p>
          </div>
          {selectedZone && (
            <button
              onClick={() => router.push(
                `/analyse-zone/${encodeURIComponent(String(selectedZone.id))}` +
                `?lat=${selectedZone.lat}&lng=${selectedZone.lng}` +
                `&nom=${encodeURIComponent(selectedZone.nom.split(',')[0])}`
              )}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              Analyser cette zone
            </button>
          )}
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

          <ActivitySelector
            types={typesActivite}
            selectedType={selectedType}
            selectedCategorie={selectedCategorie}
            onTypeChange={setSelectedType}
            onCategorieChange={setSelectedCategorie}
          />

          {/* Bouton recherche */}
          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-sm"
          >
            {loadingLieux
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Recherche en cours...</>
              : <><Search  className="w-4 h-4" /> Rechercher</>
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