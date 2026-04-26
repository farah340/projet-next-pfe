'use client'

import { useState, useMemo } from 'react'
import { AlertTriangle, Star, MapPin, Globe, Instagram, Facebook, Phone, ExternalLink } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────
export type Concurrent = {
  id: string
  name: string
  type: string
  type_display: string
  address: string
  lat: number
  lng: number
  distance_m: number
  rating: number | null
  reviews: number
  rating_tier: 'excellent' | 'bon' | 'moyen' | 'faible' | 'non_note'
  google_maps_uri?: string | null
  phone?: string | null
  website?: string | null
  has_website: boolean
  has_instagram: boolean
  has_facebook: boolean
  has_phone: boolean
  digitalisation_score: number
  is_open_now?: boolean | null
  amplitude_horaire_hebdo?: number | null
  jours_ouverts_hebdo?: number | null
  menace_score: number
}

type Stats = {
  total_concurrents: number
  avg_rating: number | null
  median_rating: number | null
  excellents: number
  bons: number
  moyens: number
  faibles: number
  total_reviews: number
  closest_m: number | null
  within_500m: number
  within_1km: number
  pct_avec_site: number
  pct_avec_reseau_social: number
}

type SortKey = 'menace_score' | 'distance_m' | 'rating' | 'reviews' | 'digitalisation_score'

// ─── Helpers UI ───────────────────────────────────────────────
const formatDistance = (m: number) => {
  if (m < 1000) return `${m}m`
  return `${(m / 1000).toFixed(1)}km`
}

const getMenaceBadge = (score: number) => {
  if (score >= 75) return { label: 'Très élevée', className: 'bg-red-100 text-red-800 border border-red-200' }
  if (score >= 55) return { label: 'Élevée', className: 'bg-orange-100 text-orange-800 border border-orange-200' }
  if (score >= 35) return { label: 'Modérée', className: 'bg-amber-100 text-amber-800 border border-amber-200' }
  return { label: 'Faible', className: 'bg-emerald-100 text-emerald-800 border border-emerald-200' }
}

const getRatingTierBadge = (tier: Concurrent['rating_tier']) => {
  const map = {
    excellent: { label: 'Excellent', className: 'bg-emerald-100 text-emerald-800' },
    bon: { label: 'Bon', className: 'bg-sky-100 text-sky-800' },
    moyen: { label: 'Moyen', className: 'bg-amber-100 text-amber-800' },
    faible: { label: 'Faible', className: 'bg-red-100 text-red-800' },
    non_note: { label: 'Non noté', className: 'bg-gray-100 text-gray-600' },
  }
  return map[tier] ?? map.non_note
}

const getDigitalBadge = (score: number) => {
  if (score >= 70) return { label: 'Fort', className: 'text-emerald-700 bg-emerald-50' }
  if (score >= 40) return { label: 'Moyen', className: 'text-amber-700 bg-amber-50' }
  return { label: 'Faible', className: 'text-red-700 bg-red-50' }
}

// ✅ Helper pour générer une recherche Google sur réseau social
const getSocialSearchUrl = (name: string, network: 'instagram' | 'facebook') => {
  return `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + network)}`
}

// ─── Composant principal ──────────────────────────────────────
type Props = {
  concurrents: Concurrent[]
  stats?: Stats
  parType?: Record<string, { display: string; count: number; percentage: number }>
}

export default function ConcurrenceTable({ concurrents = [], stats, parType }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('menace_score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState<string>('all')
  const [search, setSearch] = useState('')

  // ─── Tri + filtrage ─────────────────────────────────────────
  const sortedConcurrents = useMemo(() => {
    let filtered = [...concurrents]

    if (filterType !== 'all') {
      filtered = filtered.filter((c) => c.type === filterType)
    }

    if (search.trim()) {
      const s = search.toLowerCase()
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(s))
    }

    return filtered.sort((a, b) => {
      const va = (a[sortKey] ?? 0) as number
      const vb = (b[sortKey] ?? 0) as number
      return sortOrder === 'desc' ? vb - va : va - vb
    })
  }, [concurrents, sortKey, sortOrder, filterType, search])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  const SortArrow = ({ k }: { k: SortKey }) =>
    sortKey === k ? <span className="ml-1 text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span> : null

  if (!concurrents?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">Aucune donnée de concurrence disponible.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── Cartes stats rapides ──────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total concurrents" value={stats.total_concurrents} />
          <StatCard
            label="Note moyenne"
            value={stats.avg_rating != null ? `${stats.avg_rating}/5` : '—'}
            icon={<Star size={16} className="text-amber-500" />}
          />
          <StatCard
            label="Plus proche"
            value={stats.closest_m != null ? formatDistance(stats.closest_m) : '—'}
            icon={<MapPin size={16} className="text-blue-500" />}
          />
          <StatCard
            label="Avec site web"
            value={`${stats.pct_avec_site}%`}
            icon={<Globe size={16} className="text-indigo-500" />}
          />
        </div>
      )}

      {/* ─── Répartition par type ──────────────────────────────── */}
      {parType && Object.keys(parType).length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Répartition par type</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(parType).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setFilterType(filterType === key ? 'all' : key)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  filterType === key
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-400'
                }`}
              >
                {t.display} · {t.count} ({t.percentage}%)
              </button>
            ))}
            {filterType !== 'all' && (
              <button
                onClick={() => setFilterType('all')}
                className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Barre de recherche ────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Rechercher un concurrent par nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <span className="text-sm text-gray-500">
          {sortedConcurrents.length} résultat{sortedConcurrents.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* ─── Tableau ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Concurrent</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th
                  className="cursor-pointer px-4 py-3 font-semibold hover:text-indigo-600"
                  onClick={() => handleSort('distance_m')}
                >
                  Distance <SortArrow k="distance_m" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 font-semibold hover:text-indigo-600"
                  onClick={() => handleSort('rating')}
                >
                  Note <SortArrow k="rating" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 font-semibold hover:text-indigo-600"
                  onClick={() => handleSort('reviews')}
                >
                  Avis <SortArrow k="reviews" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 font-semibold hover:text-indigo-600"
                  onClick={() => handleSort('digitalisation_score')}
                >
                  Digital <SortArrow k="digitalisation_score" />
                </th>
                <th
                  className="cursor-pointer px-4 py-3 font-semibold hover:text-indigo-600"
                  onClick={() => handleSort('menace_score')}
                >
                  Menace <SortArrow k="menace_score" />
                </th>
                <th className="px-4 py-3 font-semibold">Présence</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedConcurrents.map((c) => {
                const menace = getMenaceBadge(c.menace_score)
                const rating = getRatingTierBadge(c.rating_tier)
                const digital = getDigitalBadge(c.digitalisation_score)

                return (
                  <tr key={c.id} className="transition hover:bg-indigo-50/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.address}</div>
                    </td>

                    <td className="px-4 py-3 text-gray-700">{c.type_display}</td>

                    <td className="px-4 py-3 font-medium text-gray-700">
                      {formatDistance(c.distance_m)}
                    </td>

                    <td className="px-4 py-3">
                      {c.rating != null ? (
                        <div className="flex items-center gap-1.5">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          <span className="font-medium">{c.rating}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${rating.className}`}
                          >
                            {rating.label}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-gray-700">{c.reviews}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${digital.className}`}
                      >
                        {c.digitalisation_score}/100
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-14 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full transition ${
                              c.menace_score >= 75
                                ? 'bg-red-500'
                                : c.menace_score >= 55
                                  ? 'bg-orange-500'
                                  : c.menace_score >= 35
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                            }`}
                            style={{ width: `${c.menace_score}%` }}
                          />
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${menace.className}`}
                        >
                          {c.menace_score}
                        </span>
                      </div>
                    </td>

                    {/* ✅ Colonne PRÉSENCE - icônes cliquables */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Site web - lien direct */}
                        {c.has_website && c.website && (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Visiter ${c.website}`}
                            className="rounded p-1 transition hover:bg-indigo-100"
                          >
                            <Globe size={14} className="text-indigo-500" />
                          </a>
                        )}

                        {/* Instagram - recherche Google */}
                        {c.has_instagram && (
                          <a
                            href={getSocialSearchUrl(c.name, 'instagram')}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chercher sur Instagram"
                            className="rounded p-1 transition hover:bg-pink-100"
                          >
                            <Instagram size={14} className="text-pink-500" />
                          </a>
                        )}

                        {/* Facebook - recherche Google */}
                        {c.has_facebook && (
                          <a
                            href={getSocialSearchUrl(c.name, 'facebook')}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chercher sur Facebook"
                            className="rounded p-1 transition hover:bg-blue-100"
                          >
                            <Facebook size={14} className="text-blue-600" />
                          </a>
                        )}

                        {/* Téléphone - tel: */}
                        {c.has_phone && c.phone && (
                          <a
                            href={`tel:${c.phone.replace(/\s/g, '')}`}
                            title={`Appeler ${c.phone}`}
                            className="rounded p-1 transition hover:bg-emerald-100"
                          >
                            <Phone size={14} className="text-emerald-600" />
                          </a>
                        )}

                        {!c.has_website && !c.has_instagram && !c.has_facebook && !c.has_phone && (
                          <span className="text-xs text-gray-400">Aucune</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {c.google_maps_uri && (
                        <a
                          href={c.google_maps_uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                          title="Voir sur Google Maps"
                        >
                          Maps <ExternalLink size={11} />
                        </a>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Alerte menace élevée ─────────────────────────────── */}
      {sortedConcurrents.some((c) => c.menace_score >= 75) && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={20} />
          <div>
            <p className="font-semibold text-red-900">Concurrents à forte menace détectés</p>
            <p className="text-sm text-red-700">
              Plusieurs concurrents directs ont un score de menace supérieur à 75/100. Une stratégie
              de différenciation est fortement recommandée.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Carte de stat ─────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )
}