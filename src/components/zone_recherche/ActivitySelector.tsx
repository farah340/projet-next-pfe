'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { TypeActivite, Categorie } from '@/types'

interface ActivitySelectorProps {
  types: TypeActivite[]
  selectedType: TypeActivite | null
  selectedCategorie: Categorie | null
  onTypeChange: (type: TypeActivite) => void
  onCategorieChange: (cat: Categorie | null) => void
}

export function ActivitySelector({
  types,
  selectedType,
  selectedCategorie,
  onTypeChange,
  onCategorieChange,
}: ActivitySelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const categories = selectedType?.categories || []

  return (
    <div className="space-y-3">

      {/* Type d'activité dropdown */}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Type d'activité
        </div>
        <div ref={containerRef} className="relative">
          <button
            onClick={() => setShowDropdown(v => !v)}
            className={`w-full flex items-center gap-3 bg-white border rounded-xl px-4 py-3 text-sm transition-all shadow-sm ${
              showDropdown
                ? 'border-blue-400 ring-2 ring-blue-100'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {selectedType?.icone && (
              <span className="text-lg">{selectedType.icone}</span>
            )}
            <span className="flex-1 text-left font-semibold text-slate-800">
              {selectedType?.nom || 'Choisir un type...'}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
              {types.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    onTypeChange(t)
                    onCategorieChange(null)
                    setShowDropdown(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0 ${
                    selectedType?.id === t.id ? 'bg-blue-50' : ''
                  }`}
                >
                  {t.icone && <span className="text-base">{t.icone}</span>}
                  <span className="text-sm font-medium text-slate-800">{t.nom}</span>
                  <span className="ml-auto text-xs text-slate-400">
                    {t.categories?.length || 0} catégories
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Catégories chips */}
      {selectedType && categories.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            Sélectionnez une catégorie pour {selectedType.nom} :
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategorieChange(cat.id === selectedCategorie?.id ? null : cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  selectedCategorie?.id === cat.id
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}