'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type SearchResult = {
    display_name: string
    lat: string
    lon: string
    boundingbox: string[]
    osm_type: string
    osm_id: number
    geojson?: any
}

export default function MapZone() {
    const router = useRouter()
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const markerRef = useRef<any>(null)
    const geojsonLayerRef = useRef<any>(null)

    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState<SearchResult | null>(null)
    const [error, setError] = useState('')

    // Formulaire de sauvegarde
    const [nom, setNom] = useState('')
    const [description, setDescription] = useState('')
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [saveError, setSaveError] = useState('')

    // ── Initialiser la carte ──
    useEffect(() => {
        if (typeof window === 'undefined') return

        const initMap = async () => {
            const L = (await import('leaflet')).default

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
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&polygon_geojson=1`,
                { headers: { 'Accept-Language': 'fr' } }
            )
            const data = await res.json()
            if (!data || data.length === 0) {
                setError('Aucun résultat trouvé.')
            } else {
                setResults(data)
            }
        } catch {
            setError('Erreur de connexion.')
        } finally {
            setLoading(false)
        }
    }

    // ── Sélectionner une ville et afficher ses frontières ──
    const handleSelect = async (result: SearchResult) => {
        setSelected(result)
        setResults([])
        setQuery(result.display_name.split(',')[0])
        setNom(result.display_name.split(',')[0])
        setSaveSuccess(false)
        setSaveError('')

        const L = (await import('leaflet')).default
        const map = mapInstanceRef.current
        if (!map) return

        // Supprimer l'ancien marker et la couche GeoJSON
        if (markerRef.current) { markerRef.current.remove(); markerRef.current = null }
        if (geojsonLayerRef.current) { geojsonLayerRef.current.remove(); geojsonLayerRef.current = null }

        const lat = parseFloat(result.lat)
        const lon = parseFloat(result.lon)

        // Afficher les frontières GeoJSON si disponibles
        if (result.geojson) {
            geojsonLayerRef.current = L.geoJSON(result.geojson, {
                style: {
                    color: '#3b82f6',
                    weight: 2.5,
                    opacity: 1,
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                },
            }).addTo(map)

            map.fitBounds(geojsonLayerRef.current.getBounds(), { padding: [30, 30] })
        } else {
            // Fallback : marker simple
            markerRef.current = L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`<strong>${result.display_name.split(',')[0]}</strong>`)
                .openPopup()

            const bb = result.boundingbox
            if (bb?.length === 4) {
                map.fitBounds([
                    [parseFloat(bb[0]), parseFloat(bb[2])],
                    [parseFloat(bb[1]), parseFloat(bb[3])],
                ])
            } else {
                map.setView([lat, lon], 12)
            }
        }
    }

    // ── Sauvegarder la zone ──
    const handleSave = async () => {
        if (!selected || !nom.trim()) return
        setSaveError('')
        setSaving(true)

        try {
            const res = await fetch('/api/zones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: nom.trim(),
                    description: description.trim() || null,
                    adresse: selected.display_name,
                    lat: parseFloat(selected.lat),
                    lng: parseFloat(selected.lon),
                    geojson: selected.geojson || null,
                }),
            })

            const data = await res.json()
            if (!res.ok) {
                setSaveError(data.error || 'Erreur lors de la sauvegarde')
            } else {
                setSaveSuccess(true)
                setTimeout(() => router.push('/dashboard/zones'), 1500)
            }
        } catch {
            setSaveError('Erreur de connexion au serveur')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* ── Panneau gauche : recherche + formulaire ── */}
            <div className="flex flex-col gap-4 lg:col-span-1">

                {/* Recherche */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
                        Rechercher
                    </h2>
                    <div className="relative flex flex-col gap-2">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className="text-slate-400">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                placeholder="Ville, région, adresse..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleSearch}
                            disabled={loading || !query.trim()}
                            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40"
                        >
                            {loading ? 'Recherche...' : 'Rechercher'}
                        </button>

                        {/* Dropdown */}
                        {results.length > 0 && (
                            <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[1000] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                                {results.map((r, i) => (
                                    <button key={i} type="button" onClick={() => handleSelect(r)}
                                        className="flex w-full items-start gap-2 border-b border-slate-100 px-3 py-2.5 text-left text-sm hover:bg-slate-50 last:border-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            className="mt-0.5 flex-shrink-0 text-blue-400">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <span className="text-slate-700 line-clamp-2">{r.display_name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                </div>

                {/* Formulaire sauvegarde */}
                {selected && (
                    <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
                            Enregistrer la zone
                        </h2>

                        {/* Zone sélectionnée */}
                        <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className="mt-0.5 flex-shrink-0 text-blue-500">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <p className="text-xs text-blue-700 line-clamp-2">{selected.display_name}</p>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                    Nom de la zone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={nom}
                                    onChange={e => setNom(e.target.value)}
                                    placeholder="Ex: Zone nord de Tunis"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                    Description <span className="text-slate-400">(optionnel)</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Notes sur cette zone..."
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>
                        </div>

                        {saveError && (
                            <p className="mt-2 text-xs text-red-500">{saveError}</p>
                        )}

                        {saveSuccess ? (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Zone sauvegardée ! Redirection...
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || !nom.trim()}
                                className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Sauvegarde...' : '💾 Enregistrer la zone'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Carte ── */}
            <div className="lg:col-span-2">
                <div
                    ref={mapRef}
                    className="h-[600px] w-full rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                    style={{ zIndex: 0 }}
                />
            </div>
        </div>
    )
}