'use client'

import { useRef, useState } from 'react'
import { MapPin, Layers, Loader2, X, Maximize2 } from 'lucide-react'
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

interface FullscreenMapProps {
  apiKey: string
  selectedZone: ZoneResult | null
  lieux: Lieu[]
  collecteEnCours: boolean
  onLieuClick: (lieu: Lieu) => void
  selectedLieu: Lieu | null
  byCategorie: Record<string, number>
}

// Composant pour la carte en plein écran
function FullscreenMap({
  apiKey,
  selectedZone,
  lieux,
  collecteEnCours,
  onLieuClick,
  selectedLieu,
  byCategorie,
}: FullscreenMapProps) {
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

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Badge nombre de lieux */}
      {lieux.length > 0 && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2 shadow-sm">
          <Layers className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-semibold text-slate-700">
            {lieux.length} lieu{lieux.length > 1 ? 'x' : ''} trouvé{lieux.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Légende */}
      {lieux.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Légende
          </div>
          {Object.entries(byCategorie)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3 mb-2 last:mb-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: CAT_COLORS[cat as keyof typeof CAT_COLORS] || DEFAULT_COLOR }}
                />
                <span className="text-sm text-slate-600">{cat}</span>
                <span className="text-sm text-slate-400 ml-auto pl-3">{count}</span>
              </div>
            ))}
        </div>
      )}

      {/* Collecte en cours */}
      {collecteEnCours && (
        <div className="absolute bottom-4 left-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          <span className="text-sm font-semibold text-amber-700">
            Collecte en cours, réessayez dans 30s
          </span>
        </div>
      )}
    </div>
  )
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
  const [isFullscreen, setIsFullscreen] = useState(false)

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

  const handleMapClick = () => {
    if (selectedZone) {
      setIsFullscreen(true)
    }
  }

  const handleCloseFullscreen = () => {
    setIsFullscreen(false)
  }

  // Stats par catégorie pour la légende
  const byCategorie = lieux.reduce<Record<string, number>>((acc, l) => {
    acc[l.categorie] = (acc[l.categorie] || 0) + 1
    return acc
  }, {})

  return (
    <>
      {/* Carte normale */}
      <div
        className="relative mx-6 mt-5 cursor-pointer hover:shadow-lg transition-shadow"
        style={{ height: '420px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        onClick={handleMapClick}
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

        {/* Bouton d'agrandissement */}
        {selectedZone && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-2 shadow-sm pointer-events-none">
            <Maximize2 className="w-4 h-4 text-slate-600" />
          </div>
        )}

        {/* Badge nombre de lieux */}
        {lieux.length > 0 && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm pointer-events-none">
            <Layers className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-slate-700">
              {lieux.length} lieu{lieux.length > 1 ? 'x' : ''} trouvé{lieux.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Légende */}
        {lieux.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-sm pointer-events-none">
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
          <div className="absolute bottom-3 left-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2 pointer-events-none">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
            <span className="text-xs font-semibold text-amber-700">
              Collecte en cours, réessayez dans 30s
            </span>
          </div>
        )}
      </div>

      {/* Modal plein écran */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full h-full m-4 bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* Bouton de fermeture */}
            <button
              onClick={handleCloseFullscreen}
              className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-2 shadow-sm hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>

            {/* Carte en plein écran */}
            <div className="w-full h-full">
              <FullscreenMap
                apiKey={apiKey}
                selectedZone={selectedZone}
                lieux={lieux}
                collecteEnCours={collecteEnCours}
                onLieuClick={onLieuClick}
                selectedLieu={selectedLieu}
                byCategorie={byCategorie}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}