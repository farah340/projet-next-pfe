'use client'

import { useRef, useEffect } from 'react'
import { Search, MapPin, X, Loader2, Navigation2 } from 'lucide-react'
import { ZoneResult } from '@/types'

interface SearchBarProps {
  query: string
  onChange: (val: string) => void
  suggestions: ZoneResult[]
  showSuggestions: boolean
  loading: boolean
  selectedZone: ZoneResult | null
  onSelect: (zone: ZoneResult) => void
  onClear: () => void
  onHideSuggestions: () => void
}

export function SearchBar({
  query, onChange, suggestions, showSuggestions,
  loading, selectedZone, onSelect, onClear, onHideSuggestions,
}: SearchBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onHideSuggestions()
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onHideSuggestions])

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all shadow-sm ${
        showSuggestions ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
      }`}>
        {loading
          ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin flex-shrink-0" />
          : <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
        <input
          type="text"
          value={query}
          onChange={e => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && onHideSuggestions()}
          placeholder="Entrez l'adresse à rechercher..."
          className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
        />
        {selectedZone && (
          <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
            <Navigation2 className="w-3 h-3" /> Zone sélectionnée
          </span>
        )}
        {query && (
          <button onClick={onClear} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          {suggestions.map(s => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-0"
            >
              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {s.nom.split(',')[0]}
                </div>
                <div className="text-xs text-slate-500 truncate max-w-md">
                  {s.nom.split(',').slice(1, 3).join(',')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}