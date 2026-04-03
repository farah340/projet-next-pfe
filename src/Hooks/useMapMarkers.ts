// features/recherche-zone/hooks/useMapMarkers.ts
'use client'

import { useEffect, useRef } from 'react'
import { Lieu, ZoneResult } from '@/types'
import { CAT_COLORS, DEFAULT_COLOR, SEARCH_RADIUS_METERS } from '@/constants'

interface UseMapMarkersOptions {
  mapInstance: google.maps.Map | null
  infoWindow: google.maps.InfoWindow | null
  lieux: Lieu[]
  selectedZone: ZoneResult | null
  onLieuClick: (lieu: Lieu) => void
}

export function useMapMarkers({
  mapInstance,
  infoWindow,
  lieux,
  selectedZone,
  onLieuClick,
}: UseMapMarkersOptions) {
  const markersRef      = useRef<google.maps.Marker[]>([])
  const centerMarkerRef = useRef<google.maps.Marker | null>(null)
  const circleRef       = useRef<google.maps.Circle | null>(null)

  // Centre marker + circle quand la zone change
  useEffect(() => {
    if (!selectedZone || !mapInstance) return
    const pos = { lat: selectedZone.lat, lng: selectedZone.lng }

    mapInstance.panTo(pos)
    mapInstance.setZoom(14)

    centerMarkerRef.current?.setMap(null)
    centerMarkerRef.current = new google.maps.Marker({
      position: pos,
      map: mapInstance,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3,
      },
      title: 'Zone recherchée',
      zIndex: 999,
    })

    circleRef.current?.setMap(null)
    circleRef.current = new google.maps.Circle({
      center: pos,
      radius: SEARCH_RADIUS_METERS,
      map: mapInstance,
      fillColor: '#2563eb',
      fillOpacity: 0.05,
      strokeColor: '#2563eb',
      strokeOpacity: 0.3,
      strokeWeight: 1.5,
    })
  }, [selectedZone, mapInstance])

  // Markers lieux
  useEffect(() => {
    if (!mapInstance) return
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    lieux.forEach(lieu => {
      const color = CAT_COLORS[lieu.categorie] || DEFAULT_COLOR
      const marker = new google.maps.Marker({
        position: { lat: lieu.lat, lng: lieu.lng },
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: lieu.nom,
      })

      marker.addListener('click', () => {
        onLieuClick(lieu)
        infoWindow?.setContent(`
          <div style="font-family:'Segoe UI',sans-serif;min-width:180px;padding:4px">
            <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px">${lieu.nom}</div>
            ${lieu.adresse ? `<div style="font-size:11px;color:#64748b;margin-bottom:6px">${lieu.adresse}</div>` : ''}
            <div style="display:flex;align-items:center;gap:6px">
              <span style="background:${color}20;color:${color};font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px">${lieu.categorie}</span>
              ${lieu.note ? `<span style="font-size:11px;color:#64748b">⭐ ${lieu.note}</span>` : ''}
            </div>
          </div>
        `)
        infoWindow?.open(mapInstance, marker)
      })

      markersRef.current.push(marker)
    })
  }, [lieux, mapInstance, infoWindow, onLieuClick])

  // Focus marker sélectionné depuis la liste
  const focusLieu = (lieu: Lieu) => {
    if (!mapInstance) return
    mapInstance.panTo({ lat: lieu.lat, lng: lieu.lng })
    const marker = markersRef.current.find(m => m.getTitle() === lieu.nom)
    if (marker) google.maps.event.trigger(marker, 'click')
  }

  return { focusLieu }
}