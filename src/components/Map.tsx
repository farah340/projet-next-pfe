'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface Lieu {
  id: string
  nom: string
  lat: number
  lng: number
  adresse: string
  categorie: string
  types: string
  note: number | null
  nbAvis: number
}
 
interface MapProps {
  center: [number, number]
  lieux: Lieu[]
  onLieuClick?: (lieu: Lieu) => void
}
 
const categorieColors: Record<string, string> = {
  'Restauration': '#ef4444',
  'Santé': '#22c55e',
  'Finance': '#3b82f6',
  'Commerce': '#f59e0b',
  'Sport': '#8b5cf6',
  'Éducation': '#06b6d4',
  'Hébergement': '#ec4899',
  'Transport': '#64748b',
  'Autre': '#94a3b8',
}
 
export default function MapComponent({ center, lieux, onLieuClick }: MapProps) {
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initMap = async () => {
      const L = (await import('leaflet')).default

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(center, 14)
      } else {
        mapInstanceRef.current = L.map(mapRef.current!).setView(center, 14)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: ' OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current)
      }
 
      // Clear existing markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
 
      // Add center marker
      const centerIcon = L.divIcon({
        html: `<div style="
          width:16px;height:16px;
          background:#2563eb;
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 2px 8px rgba(37,99,235,0.5)
        "></div>`,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })
      L.marker(center, { icon: centerIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>Zone recherchée</b>')
 
      // Add circle
      L.circle(center, {
        radius: 5000,
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '6 4'
      }).addTo(mapInstanceRef.current)
 
      // Add lieu markers
      lieux.forEach(lieu => {
        const color = categorieColors[lieu.categorie] || '#94a3b8'
        const icon = L.divIcon({
          html: `<div style="
            width:12px;height:12px;
            background:${color};
            border:2px solid white;
            border-radius:50%;
            box-shadow:0 1px 4px rgba(0,0,0,0.3)
          "></div>`,
          className: '',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        })
 
        const marker = L.marker([lieu.lat, lieu.lng], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="min-width:160px;font-family:sans-serif">
              <div style="font-weight:600;font-size:13px;margin-bottom:4px">${lieu.nom}</div>
              <div style="font-size:11px;color:#64748b;margin-bottom:6px">${lieu.adresse || lieu.categorie}</div>
              ${lieu.note ? `<div style="font-size:12px">⭐ ${lieu.note} (${lieu.nbAvis} avis)</div>` : ''}
              <div style="
                display:inline-block;
                background:${color}20;
                color:${color};
                font-size:10px;
                font-weight:600;
                padding:2px 8px;
                border-radius:20px;
                margin-top:4px
              ">${lieu.categorie}</div>
            </div>
          `)
 
        if (onLieuClick) {
          marker.on('click', () => onLieuClick(lieu))
        }
 
        markersRef.current.push(marker)
      })
    }
 
    initMap()
  }, [center, lieux])
 
  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', borderRadius: '12px' }}
    />
  )
}