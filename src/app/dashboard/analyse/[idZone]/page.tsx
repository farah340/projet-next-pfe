'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, MapPin, TrendingUp, Building2,
  AlertCircle, BarChart3, Star,
  Coffee, Heart, GraduationCap, Banknote, ShoppingCart,
  Dumbbell, Hotel, Car, Save, CheckCircle2,
} from 'lucide-react'
import { useParams } from 'next/navigation'
const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 rounded-xl animate-pulse" />
})

const CATEGORIES = [
  { value: 'Restauration', icon: Coffee, color: '#ef4444' },
  { value: 'Santé', icon: Heart, color: '#22c55e' },
  { value: 'Éducation', icon: GraduationCap, color: '#06b6d4' },
  { value: 'Finance', icon: Banknote, color: '#3b82f6' },
  { value: 'Commerce', icon: ShoppingCart, color: '#f59e0b' },
  { value: 'Sport', icon: Dumbbell, color: '#8b5cf6' },
  { value: 'Hébergement', icon: Hotel, color: '#ec4899' },
  { value: 'Transport', icon: Car, color: '#64748b' },
]

interface AnalyseData {
  scoreGlobal: number
  verdict: string
  zone_name: string
  categorie: string
  recommandation: string
  opportunite: string
  pointsForts: string[]
  pointsFaibles: string[]
  insights: any[]
  ephemeral?: boolean
  zone: {
    id: string
    nom: string
    lat: number
    lng: number
    adresse?: string | null
  }
  stats: {
    totalLieux: number
    parCategorie: Record<string, number>
    noteMoyenne: number | null
  }
  donnees: any
}

export default function AnalyseZonePage() {
  const params = useParams<{ idZone: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()

  const activite = searchParams.get('activite') || 'commerce'
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const nom = searchParams.get('nom')
  const adresse = searchParams.get('adresse')

  const [data, setData] = useState<AnalyseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingZone, setSavingZone] = useState(false)
  const [savedZoneId, setSavedZoneId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/analyse/${params.idZone}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activite,
            lat: lat ? Number(lat) : undefined,
            lng: lng ? Number(lng) : undefined,
            nom: nom || undefined,
            adresse: adresse || undefined,
          }),
        })
        const json = await res.json()
        if (!res.ok || json.error) throw new Error(json.error || 'Erreur analyse')
        setData(json)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.idZone, activite, lat, lng, nom, adresse])

  // Sauvegarder une zone éphémère dans la DB
  const handleSaveZone = async () => {
    if (!data?.zone) return
    setSavingZone(true)
    try {
      const res = await fetch('/api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: data.zone.nom,
          adresse: data.zone.adresse || data.zone.nom,
          lat: data.zone.lat,
          lng: data.zone.lng,
        }),
      })
      const zoneDb = await res.json()
      if (!res.ok) throw new Error(zoneDb.error || 'Erreur sauvegarde')
      setSavedZoneId(zoneDb.id)
      // Rediriger vers l'URL avec l'ID DB pour que la prochaine fois l'analyse soit sauvegardée
      router.replace(`/dashboard/analyse/${zoneDb.id}?activite=${encodeURIComponent(activite)}`)
    } catch (e: any) {
      alert('Échec de la sauvegarde: ' + e.message)
    } finally {
      setSavingZone(false)
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Analyse en cours...</p>
          <p className="text-xs text-gray-400">L'agent IA analyse votre zone géographique</p>
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 min-h-screen">
        <div className="text-center bg-white rounded-xl border border-gray-200 p-10">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Erreur d'analyse</p>
          <p className="text-sm text-gray-500 mt-1">{error || 'Données indisponibles'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            ← Retour
          </button>
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...Object.values(data.stats.parCategorie), 1)
  const scoreColor = data.scoreGlobal >= 80 ? '#22c55e' : data.scoreGlobal >= 65 ? '#6c63ff' : '#f59e0b'

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <h1 className="text-lg font-semibold text-gray-900">
                  {data.zone_name || nom || 'Zone analysée'}
                </h1>
                {data.ephemeral && (
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Non sauvegardée
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Analyse pour activité : <span className="font-semibold">{data.categorie}</span> · rayon 5 km
              </p>
            </div>
          </div>

          {/* Bouton sauvegarde pour les analyses éphémères */}
          {data.ephemeral && !savedZoneId && (
            <button
              onClick={handleSaveZone}
              disabled={savingZone}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {savingZone ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer cette zone
            </button>
          )}
          {savedZoneId && (
            <span className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Zone sauvegardée
            </span>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">

        {/* Score global */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">
                Score global
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold" style={{ color: scoreColor }}>
                  {Math.round(data.scoreGlobal)}
                </span>
                <span className="text-2xl text-gray-400">/100</span>
                <span
                  className="ml-3 text-sm font-semibold px-3 py-1 rounded-full"
                  style={{ background: `${scoreColor}20`, color: scoreColor }}
                >
                  {data.verdict}
                </span>
              </div>
              {data.opportunite && (
                <p className="text-sm text-gray-600 mt-3 max-w-2xl">{data.opportunite}</p>
              )}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total lieux
              </span>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{data.stats.totalLieux}</div>
            <div className="text-xs text-gray-500 mt-1">dans la zone</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Catégories
              </span>
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-purple-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(data.stats.parCategorie).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">types d'activités</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Note moyenne
              </span>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.stats.noteMoyenne ? `${data.stats.noteMoyenne}/5` : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-1">satisfaction client</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Concurrents
              </span>
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.donnees?.concurrence?.total ?? 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">détectés</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* Répartition par catégorie */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Répartition par catégorie
            </h2>
            {Object.keys(data.stats.parCategorie).length === 0 ? (
              <p className="text-sm text-gray-400">Aucun lieu détecté dans cette zone.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {Object.entries(data.stats.parCategorie)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => {
                    const catData = CATEGORIES.find(c => c.value === cat)
                    const Icon = catData?.icon || Building2
                    const color = catData?.color || '#94a3b8'
                    const pct = Math.round((count / maxCount) * 100)
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" style={{ color }} />
                            <span className="text-xs font-medium text-gray-700">{cat}</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-900">{count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Points forts / faibles */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Synthèse stratégique
            </h2>
            {data.pointsForts?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-green-700 uppercase mb-2">Points forts</p>
                <ul className="space-y-1.5">
                  {data.pointsForts.map((p, i) => (
                    <li key={i} className="text-xs text-gray-700 flex gap-2">
                      <span className="text-green-500">✓</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.pointsFaibles?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-700 uppercase mb-2">Points faibles</p>
                <ul className="space-y-1.5">
                  {data.pointsFaibles.map((p, i) => (
                    <li key={i} className="text-xs text-gray-700 flex gap-2">
                      <span className="text-red-500">✗</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(!data.pointsForts?.length && !data.pointsFaibles?.length) && (
              <p className="text-sm text-gray-400">Aucune donnée stratégique disponible.</p>
            )}
          </div>
        </div>

        {/* Recommandation */}
        {data.recommandation && (
          <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl border border-blue-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              💡 Recommandation IA
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{data.recommandation}</p>
          </div>
        )}

      </div>
    </div>
  )
}