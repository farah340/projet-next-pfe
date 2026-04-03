'use client'

import { useState, useEffect, useRef } from 'react'
import { ZoneResult } from '../types/index'
import { NOMINATIM_DEBOUNCE_MS } from '../constants'

export function useZoneSearch() {
  const [query, setQuery]               = useState('')
  const [suggestions, setSuggestions]   = useState<ZoneResult[]>([])
  const [loading, setLoading]           = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res  = await fetch(`/api/zones/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions(data.results || [])
        setShowSuggestions(true)
      } catch (err) {
        console.error('Zone search error:', err)
      } finally {
        setLoading(false)
      }
    }, NOMINATIM_DEBOUNCE_MS)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const hideSuggestions = () => setShowSuggestions(false)

  return {
    query, setQuery,
    suggestions,
    loading,
    showSuggestions, setShowSuggestions,
    hideSuggestions,
  }
}