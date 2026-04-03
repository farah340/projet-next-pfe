// features/recherche-zone/hooks/useGoogleMaps.ts
'use client'

import { useEffect, useRef, useState } from 'react'
import { MAP_STYLES } from '@/constants'

declare global {
  interface Window {
    google: typeof google
  }
}

let googleMapsPromise: Promise<void> | null = null

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (googleMapsPromise) return googleMapsPromise
  googleMapsPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('SSR'))
    if ((window as any).google?.maps) return resolve()
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
  return googleMapsPromise
}

interface UseGoogleMapsOptions {
  apiKey: string
  mapRef: React.RefObject<HTMLDivElement | null>
  defaultCenter?: { lat: number; lng: number }
  defaultZoom?: number
}

export function useGoogleMaps({
  apiKey,
  mapRef,
  defaultCenter = { lat: 36.8065, lng: 10.1815 },
  defaultZoom = 12,
}: UseGoogleMapsOptions) {
  const mapInstanceRef   = useRef<google.maps.Map | null>(null)
  const infoWindowRef    = useRef<google.maps.InfoWindow | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!apiKey || !mapRef.current) return
    loadGoogleMapsScript(apiKey).then(() => {
      if (mapInstanceRef.current) return
      mapInstanceRef.current = new google.maps.Map(mapRef.current!, {
        center: defaultCenter,
        zoom: defaultZoom,
        disableDefaultUI: true,
        zoomControl: true,
        styles: MAP_STYLES,
      })
      infoWindowRef.current = new google.maps.InfoWindow()
      setIsReady(true)
    }).catch(console.error)
  }, [apiKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { mapInstanceRef, infoWindowRef, isReady }
}