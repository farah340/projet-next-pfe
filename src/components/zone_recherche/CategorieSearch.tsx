'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X, Check, Loader2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────
export type Categorie = {
  id: string
  nom: string           // "Café"
  google_type: string   // "cafe"
  keywords: string[]    // ["coffee"]
  type_id: string
  type_nom: string      // "Restauration"
  type_emoji: string    // "🍽️"
}

type Props = {
  onSelect: (categorie: Categorie | null) => void
}

export default function CategorieSearch({ onSelect }: Props) {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Categorie | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // ─── Charger les catégories depuis l'API ────────────────────
  useEffect(() => {
    fetch('/api/zones/categorie')
      .then((r) => r.json())
      .then((data) => {
        setCategories(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Erreur chargement catégories:', err)
        setLoading(false)
      })
  }, [])

  // ─── Filtrage en temps réel ─────────────────────────────────
  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()

    return categories
      .filter((c) => {
        // Match sur le nom de la catégorie
        if (c.nom.toLowerCase().includes(q)) return true
        // Match sur le nom du type d'activité
        if (c.type_nom.toLowerCase().includes(q)) return true
        // Match sur les mots-clés
        if (c.keywords.some((k) => k.toLowerCase().includes(q))) return true
        // Match sur le google_type
        if (c.google_type.toLowerCase().includes(q)) return true
        return false
      })
      .slice(0, 10)
  }, [query, categories])

  const noResults = query.trim().length > 0 && suggestions.length === 0 && !selected && !loading

  // ─── Reset highlight quand suggestions changent ─────────────
  useEffect(() => {
    setHighlightedIndex(0)
  }, [suggestions])

  // ─── Fermer la liste au clic extérieur ──────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ─── Sélection ──────────────────────────────────────────────
  const handleSelect = (cat: Categorie) => {
    setSelected(cat)
    setQuery(cat.nom)
    setIsOpen(false)
    onSelect(cat)
  }

  const handleClear = () => {
    setSelected(null)
    setQuery('')
    setIsOpen(true)
    onSelect(null)
  }

  // ─── Navigation clavier ─────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSelect(suggestions[highlightedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ─── Input ──────────────────────────────────────────── */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(null)
            setIsOpen(true)
            onSelect(null)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre activité"
          disabled={loading}
          className={`w-full rounded-lg border bg-white px-12 py-3 text-sm outline-none transition focus:ring-2 disabled:bg-gray-50 placeholder:text-gray-500 text-gray-900 ${
            selected
              ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100'
              : noResults
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
          }`}
        />

        {/* Indicateurs à droite */}
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {loading && <Loader2 size={16} className="animate-spin text-gray-400" />}
          {selected && !loading && <Check size={18} className="text-emerald-500" />}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ─── Liste de suggestions ──────────────────────────── */}
      {isOpen && query.trim() && !selected && !loading && (
        <div className="absolute z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((cat, idx) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(cat)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                      idx === highlightedIndex ? 'bg-indigo-50' : 'hover:bg-indigo-50'
                    }`}
                  >
                    <span className="text-xl">{cat.type_emoji}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{cat.nom}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{cat.type_nom}</span>
                        {cat.keywords.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="italic">{cat.keywords.slice(0, 3).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            // ─── Aucun résultat ────────────────────────────
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="text-xl">❌</span>
              <div>
                <p className="text-sm font-medium text-red-600">
                  Cette activité n'existe pas dans notre base
                </p>
                <p className="text-xs text-gray-500">
                  Aucune catégorie ne correspond à "<strong>{query}</strong>"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Confirmation visuelle ──────────────────────────── */}
      {selected && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <Check size={14} className="text-emerald-600" />
          <span className="text-emerald-700">
            <strong>{selected.nom}</strong> ({selected.type_emoji} {selected.type_nom}) sélectionné
          </span>
        </div>
      )}
    </div>
  )
}