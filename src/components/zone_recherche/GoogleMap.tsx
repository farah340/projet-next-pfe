'use client'

import { useRef } from 'react'
import { MapPin, Layers, Loader2 } from 'lucide-react'
import { Lieu, ZoneResult } from '@/types'
import { CAT_COLORS, DEFAULT_COLOR } from '@/constants'
import { useGoogleMaps } from '@/Hooks/useGoogleMap'
import { useMapMarkers } from '@/Hooks/useMapMarkers'

interface GoogleMapProps {
  apiKey: string
  selectedZone: ZoneResult | null
  lieux: Lieu[]
  collecteEnCours: boolean
  onLieuClick: (lieu: Lieu) => void
  selectedLieu: Lieu | null
}

export function GoogleMap({
  apiKey,
  selectedZone,
  lieux,
  collecteEnCours,
  onLieuClick,
  selectedLieu,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  const { mapInstanceRef, infoWindowRef, isReady } = useGoogleMaps({
    apiKey,
    mapRef,
  })

  const { focusLieu } = useMapMarkers({
    mapInstance: isReady ? mapInstanceRef.current : null,
    infoWindow:  isReady ? infoWindowRef.current  : null,
    lieux,
    selectedZone,
    onLieuClick,
  })

  // Focus quand selectedLieu change depuis la liste
  const prevLieuRef = useRef<Lieu | null>(null)
  if (selectedLieu && selectedLieu !== prevLieuRef.current) {
    prevLieuRef.current = selectedLieu
    if (isReady) focusLieu(selectedLieu)
  }

  // Stats par catégorie pour la légende
  const byCategorie = lieux.reduce<Record<string, number>>((acc, l) => {
    acc[l.categorie] = (acc[l.categorie] || 0) + 1
    return acc
  }, {})

  return (
    <div
      className="relative mx-6 mt-5"
      style={{ height: '420px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
    >
      {/* Map container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Overlay si pas de zone */}
      {!selectedZone && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm pointer-events-none">
          <MapPin className="w-10 h-10 text-blue-400 mb-2" />
          <p className="text-sm font-semibold text-slate-600">
            Recherchez une zone pour afficher la carte
          </p>
        </div>
      )}

      {/* Badge nombre de lieux */}
      {lieux.length > 0 && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
          <Layers className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-semibold text-slate-700">
            {lieux.length} lieu{lieux.length > 1 ? 'x' : ''} trouvé{lieux.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Légende */}
      {lieux.length > 0 && (
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Légende
          </div>
          {Object.entries(byCategorie)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-2 mb-1 last:mb-0">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: CAT_COLORS[cat as keyof typeof CAT_COLORS] || DEFAULT_COLOR }}
                />
                <span className="text-xs text-slate-600">{cat}</span>
                <span className="text-xs text-slate-400 ml-auto pl-3">{count}</span>
              </div>
            ))}
        </div>
      )}

      {/* Collecte en cours */}
      {collecteEnCours && (
        <div className="absolute bottom-3 left-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
          <span className="text-xs font-semibold text-amber-700">
            Collecte en cours, réessayez dans 30s
          </span>
        </div>
      )}
    </div>
  )
}