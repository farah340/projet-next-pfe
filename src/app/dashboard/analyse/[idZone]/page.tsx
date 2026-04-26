'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  ArrowLeft, Loader2, MapPin, TrendingUp, Building2,
  AlertCircle, CheckCircle, BarChart3, Users, Star,
  Coffee, Heart, GraduationCap, Banknote, ShoppingCart,
  Dumbbell, Hotel, Car
} from 'lucide-react'

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
  zone: { nom: string; lat: number; lng: number }
  stats: {
    totalLieux: number
    parCategorie: Record<string, number>
    noteMoyenne: number | null
    categorieDominante: string
  }
  opportunites: Array<{
    categorie: string
    message: string
    niveau: string
  }>
  lieux: any[]
}

export default function AnalyseZonePage({ params }: { params: { zoneId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const nom = searchParams.get('nom')

  const [data, setData] = useState<AnalyseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `/api/analyse/${params.zoneId}?lat=${lat}&lng=${lng}&nom=${encodeURIComponent(nom || '')}`
        )
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        setData(json)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    if (lat && lng) load()
  }, [params.zoneId, lat, lng, nom])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Analyse en cours...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Erreur d'analyse</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...Object.values(data.stats.parCategorie))

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
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
              <h1 className="text-lg font-semibold text-gray-900">{nom || 'Zone analysée'}</h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Analyse commerciale dans un rayon de 5 km
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">

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
                Opportunités
              </span>
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.opportunites.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">détectées</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* Répartition par catégorie */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Répartition par catégorie
            </h2>
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
          </div>

          {/* Opportunités */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Opportunités détectées
            </h2>
            {data.opportunites.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">Zone bien équilibrée</p>
                <p className="text-xs text-gray-400 mt-1">
                  Toutes les catégories sont bien représentées
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {data.opportunites.map((opp, i) => {
                  const catData = CATEGORIES.find(c => c.value === opp.categorie)
                  const Icon = catData?.icon || Building2
                  const color = catData?.color || '#94a3b8'
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg"
                      style={{ background: `${color}08` }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}15` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900">
                          {opp.categorie}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{opp.message}</div>
                      </div>
                      <div
                        className="ml-auto flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: `${color}15`, color }}
                      >
                        {opp.niveau}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Carte des activités
          </h2>
          <div className="h-80 rounded-xl overflow-hidden">
            <MapComponent
              center={[parseFloat(lat!), parseFloat(lng!)]}
              lieux={data.lieux}
            />
          </div>
        </div>
      </div>
    </div>
  )
}