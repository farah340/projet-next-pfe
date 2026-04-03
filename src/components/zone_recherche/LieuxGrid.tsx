// features/recherche-zone/components/LieuxGrid.tsx
'use client'

import { Bookmark, CheckCircle2, Loader2, MapPin, SlidersHorizontal } from 'lucide-react'
import { Lieu, ZoneResult, Categorie } from '@/types'
import { LieuCard } from './LieuCard'

interface LieuxGridProps {
  lieux: Lieu[]
  loading: boolean
  selectedLieu: Lieu | null
  selectedZone: ZoneResult | null
  selectedCategorie: Categorie | null
  saving: boolean
  saved: boolean
  onLieuClick: (lieu: Lieu) => void
  onSave: () => void
}

export function LieuxGrid({
  lieux, loading, selectedLieu,
  selectedZone, selectedCategorie,
  saving, saved,
  onLieuClick, onSave,
}: LieuxGridProps) {
  return (
    <div className="mx-6 mt-5 mb-6">

      {/* Barre résultats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-bold text-slate-900">
            {loading ? 'Chargement…' : `${lieux.length} résultat${lieux.length > 1 ? 's' : ''}`}
          </h2>
          {selectedZone && (
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {selectedZone.nom.split(',')[0]}
            </span>
          )}
          {selectedCategorie && (
            <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2.5 py-1 rounded-full">
              {selectedCategorie.name}
            </span>
          )}
        </div>

        {/* Bouton sauvegarder */}
        {lieux.length > 0 && (
          <button
            onClick={onSave}
            disabled={saving || saved}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border shadow-sm ${
              saved
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            {saving  ? <Loader2      className="w-4 h-4 animate-spin" /> :
             saved   ? <CheckCircle2 className="w-4 h-4" /> :
                       <Bookmark     className="w-4 h-4" />}
            {saved ? 'Sauvegardé !' : 'Sauvegarder la recherche'}
          </button>
        )}
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : lieux.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-3">
            <SlidersHorizontal className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">Aucun résultat trouvé</p>
          <p className="text-xs text-slate-400">Essayez une autre catégorie ou zone</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {lieux.map(lieu => (
            <LieuCard
              key={lieu.id}
              lieu={lieu}
              isSelected={selectedLieu?.id === lieu.id}
              onClick={onLieuClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}