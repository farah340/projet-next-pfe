'use client'

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

type SearchResult = {
    display_name: string
    lat: string
    lon: string
    boundingbox: string[]
}

export default function MapSearch() {
    const mapRef = useRef<any>(null)
    const mapInstanceRef = useRef<any>(null)
    const markerRef = useRef<any>(null)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState<SearchResult | null>(null)
    const [error, setError] = useState('')

    // ── Initialiser la carte Leaflet ──
    useEffect(() => {
    if (typeof window === 'undefined') return

    const initMap = async () => {
        const L = (await import('leaflet')).default

        // ← Fix : nettoyer si déjà initialisé (StrictMode)
        if (mapRef.current && (mapRef.current as any)._leaflet_id) {
            (mapRef.current as any)._leaflet_id = null
        }

        if (!mapRef.current || mapInstanceRef.current) return

        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        const map = L.map(mapRef.current, {
            center: [33.8869, 9.5375],
            zoom: 7,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19,
        }).addTo(map)

        mapInstanceRef.current = map
    }

    initMap()

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove()
            mapInstanceRef.current = null
        }
    }
}, [])

    // ── Recherche Nominatim ──
    const handleSearch = async () => {
        if (!query.trim()) return
        setError('')
        setLoading(true)
        setResults([])

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
                { headers: { 'Accept-Language': 'fr' } }
            )
            const data = await res.json()

            if (!data || data.length === 0) {
                setError('Aucun résultat trouvé pour cette recherche.')
            } else {
                setResults(data)
            }
        } catch {
            setError('Erreur de connexion. Vérifiez votre internet.')
        } finally {
            setLoading(false)
        }
    }

    // ── Sélectionner un résultat et centrer la carte ──
    const handleSelect = async (result: SearchResult) => {
        setSelected(result)
        setResults([])
        setQuery(result.display_name.split(',')[0])

        const L = (await import('leaflet')).default
        const map = mapInstanceRef.current
        if (!map) return

        const lat = parseFloat(result.lat)
        const lon = parseFloat(result.lon)

        // Supprimer l'ancien marker
        if (markerRef.current) {
            markerRef.current.remove()
        }

        // Ajouter le nouveau marker
        markerRef.current = L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`<strong>${result.display_name.split(',')[0]}</strong><br/><span style="font-size:12px;color:#666">${result.display_name}</span>`)
            .openPopup()

        // Zoomer sur la zone avec le bounding box
        const bb = result.boundingbox
        if (bb && bb.length === 4) {
            map.fitBounds([
                [parseFloat(bb[0]), parseFloat(bb[2])],
                [parseFloat(bb[1]), parseFloat(bb[3])],
            ])
        } else {
            map.setView([lat, lon], 13)
        }
    }

    return (
        <div className="flex flex-col gap-4">

            {/* ── Barre de recherche ── */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className="text-slate-400">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="Rechercher une ville, adresse..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        ) : 'Rechercher'}
                    </button>
                </div>

                {/* ── Dropdown résultats ── */}
                {results.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-[1000] mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        {results.map((r, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSelect(r)}
                                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 border-b border-slate-100 last:border-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className="mt-0.5 flex-shrink-0 text-slate-400">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span className="text-sm text-slate-700 line-clamp-2">{r.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Erreur ── */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* ── Résultat sélectionné ── */}
            {selected && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className="mt-0.5 flex-shrink-0 text-emerald-600">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-emerald-800">{selected.display_name.split(',')[0]}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">{selected.display_name}</p>
                        <p className="text-xs text-emerald-500 mt-0.5">
                            {parseFloat(selected.lat).toFixed(5)}, {parseFloat(selected.lon).toFixed(5)}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Carte ── */}
            <div
                ref={mapRef}
                className="h-[480px] w-full rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                style={{ zIndex: 0 }}
            />

            <p className="text-center text-xs text-slate-400">
                © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer"
                    className="underline hover:text-slate-600">OpenStreetMap</a> contributors
            </p>
        </div>
    )
}