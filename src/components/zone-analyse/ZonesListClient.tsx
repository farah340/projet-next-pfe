'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'


type ZoneActivite = {
  id: string
  zoneId: string
  typeActiviteId: string
  typeActivite: {
    id: string
    nom: string
    description?: string
  }
}

type Zone = {
  id: string
  nom: string
  description: string | null
  adresse: string
  lat: number
  lng: number
  createdAt: string
  activites?: ZoneActivite[]
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

// Fonction pour générer l'URL Google Maps Static API
function getGoogleMapImage(lat: number, lng: number, zoom: number = 15): string {
  if (!GOOGLE_MAPS_API_KEY) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=600x300&maptype=roadmap&markers=color:red|${lat},${lng}&key=YOUR_API_KEY`
  }
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=600x300&maptype=roadmap&markers=color:red|${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
}

const SECTORS = ['Restaurant', 'Commerce', 'Service', 'Industrie', 'Résidentiel']
const SECTOR_COLORS: Record<string, string> = {
  Restaurant: '#f59e0b',
  Commerce: '#6c63ff',
  Service: '#22c55e',
  Industrie: '#ef4444',
  Résidentiel: '#06b6d4',
}

function getZoneImage(zone: Zone): string {
  return getGoogleMapImage(zone.lat, zone.lng, 16)
}

function getZoneSector(zone: Zone, index: number) {
  // Utiliser la première activité associée si disponible
  if (zone.activites && zone.activites.length > 0) {
    return zone.activites[0].typeActivite.nom
  }
  // Fallback sur l'ancienne méthode
  return SECTORS[index % SECTORS.length]
}

function getZoneScore(lat: number, lng: number) {
  // Score pseudo-aléatoire basé sur les coords
  return Math.floor(65 + ((lat * 100 + lng * 100) % 30))
}

function getScoreDelta(id: string) {
  const n = id.charCodeAt(0) % 10
  return n > 5 ? `+${n}%` : `-${n}%`
}

function getScoreDeltaSign(id: string) {
  return id.charCodeAt(0) % 10 > 5
}

function getScoreColor(score: number) {
  if (score >= 80) return '#22c55e'
  if (score >= 65) return '#6c63ff'
  return '#f59e0b'
}

export default function ZonesListClient({ zones: initial }: { zones: Zone[] }) {
  const router = useRouter()
  const [zones, setZones] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'actives' | 'archivees'>('actives')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Supprimer cette zone ?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/zones?id=${id}`, { method: 'DELETE' })
      if (res.ok) setZones(prev => prev.filter(z => z.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const filtered = zones.filter(z =>
    z.nom.toLowerCase().includes(search.toLowerCase()) ||
    z.adresse.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: zones.length,
    actives: Math.max(zones.length - 1, 0),
    favoris: Math.min(3, zones.length),
    scoreMoyen: zones.length
      ? Math.round(zones.reduce((acc, z) => acc + getZoneScore(z.lat, z.lng), 0) / zones.length)
      : 0,
  }

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", color: '#0f0f13', minHeight: '100vh', background: '#f5f5f8', padding: '36px 40px' }}>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .zone-card { transition: transform .25s, box-shadow .25s; }
        .zone-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(108,99,255,.12); }
        .zone-img img { transition: transform .4s; }
        .zone-card:hover .zone-img img { transform: scale(1.06); }
        .voir-btn { transition: background .2s, color .2s; }
        .voir-btn:hover { background: #5a51e0 !important; color: '#fff' !important; }
        .stat-card { transition: border-color .2s, box-shadow .2s; }
        .stat-card:hover { border-color: #6c63ff; box-shadow: 0 4px 20px rgba(108,99,255,.1); }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: '#fff', borderBottom: '1.5px solid #ebebf0', padding: '24px 40px', margin: '-36px -40px 32px -40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: '#0f0f13' }}>Mes zones</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>Gérez et consultez vos zones géographiques analysées</p>
          </div>
          <Link
            href="/dashboard/recherche-zone"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#6c63ff', color: '#fff',
              padding: '10px 20px', borderRadius: 12,
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(108,99,255,.3)',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Nouvelle zone
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total', value: stats.total },
          { label: 'Actives', value: stats.actives },
          { label: 'Favoris', value: stats.favoris },
          { label: 'Score moyen', value: stats.scoreMoyen },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 14, padding: '18px 22px' }}>
            <div style={{ fontSize: 12, color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 30, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
        {/* Search */}
        <div style={{ flex: 1, background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', height: 42 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7a7a9a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une zone..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', color: '#0f0f13' }}
          />
        </div>
        {/* Filter */}
        <select style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 10, padding: '0 14px', height: 42, fontSize: 14, fontFamily: 'inherit', color: '#0f0f13', cursor: 'pointer', outline: 'none' }}>
          <option>Tous les secteurs</option>
          {SECTORS.map(s => <option key={s}>{s}</option>)}
        </select>
        {/* View toggle */}
        <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 10, padding: 4 }}>
          {(['grid', 'list'] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)} style={{ width: 34, height: 34, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, background: viewMode === v ? '#6c63ff' : 'none', color: viewMode === v ? '#fff' : '#7a7a9a', border: 'none', transition: 'all .2s' }}>
              {v === 'grid' ? '⊞' : '☰'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {(['actives', 'archivees'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', borderRadius: 8, fontSize: 14, cursor: 'pointer', border: tab === t ? '1.5px solid #ebebf0' : '1.5px solid transparent', background: tab === t ? '#fff' : 'none', color: tab === t ? '#0f0f13' : '#7a7a9a', fontWeight: tab === t ? 500 : 400, fontFamily: 'inherit', transition: 'all .2s' }}>
            {t === 'actives' ? 'Actives' : 'Archivées'}
          </button>
        ))}
      </div>

      {/* ── Zones empty ── */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1.5px dashed #ebebf0', borderRadius: 16, padding: 64, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: '#f5f5f8', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7a7a9a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
          </div>
          <p style={{ fontWeight: 600, color: '#0f0f13' }}>Aucune zone trouvée</p>
          <p style={{ color: '#7a7a9a', fontSize: 14, marginTop: 4 }}>Créez votre première zone géographique.</p>
          <Link href="/dashboard/recherche-zone" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#6c63ff', color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(108,99,255,.3)' }}>
            Créer une zone
          </Link>
        </div>
      ) : (
        /* ── Grid ── */
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(3,1fr)' : '1fr',
          gap: viewMode === 'grid' ? 20 : 12,
        }}>
          {filtered.map((zone, i) => {
            const sector = getZoneSector(zone, i)
            const sectorColor = SECTOR_COLORS[sector] || '#6c63ff'
            const score = getZoneScore(zone.lat, zone.lng)
            const delta = getScoreDelta(zone.id)
            const deltaPositive = getScoreDeltaSign(zone.id)
            const scoreColor = getScoreColor(score)
            const isFav = i < 2

            return (
              <div key={zone.id} className="zone-card" style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 16, overflow: 'hidden', cursor: 'pointer' }}>

                {/* ── Image ── */}
                {viewMode === 'grid' && (
                  <div className="zone-img" style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={getZoneImage(zone)}
                      alt={zone.nom}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/map-fallback.jpg'
                      }}
                    />
                    {/* Sector tag */}
                    <span style={{ position: 'absolute', bottom: 10, left: 10, background: sectorColor, color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6 }}>{sector}</span>
                    {/* Fav star */}
                    <button style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.12)' }}>
                      <span style={{ fontSize: 14 }}>{isFav ? '★' : '☆'}</span>
                    </button>
                    {/* delete */}
                    <button
                      onClick={e => handleDelete(zone.id, e)}
                      disabled={deleting === zone.id}
                      style={{ position: 'absolute', top: 10, left: 10, width: 28, height: 28, background: 'rgba(255,255,255,.9)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                    </button>
                  </div>
                )}

                {/* ── Body ── */}
                <div style={{ padding: '16px 18px' }}>
                  {viewMode === 'list' && (
                    <span style={{ background: sectorColor, color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5, display: 'inline-block', marginBottom: 8 }}>{sector}</span>
                  )}
                  <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 600, margin: 0 }}>{zone.nom}</h3>
                  <p style={{ color: '#7a7a9a', fontSize: 12, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {zone.adresse}
                  </p>

                  {/* Stats */}
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#7a7a9a' }}>Score</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ background: scoreColor, color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>{score}</span>
                        <span style={{ color: deltaPositive ? '#22c55e' : '#ef4444', fontSize: 12, fontWeight: 500 }}>
                          {deltaPositive ? '↗' : '↘'}{delta}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#7a7a9a' }}>Coordonnées</span>
                      <span style={{ fontWeight: 500, fontSize: 12 }}>{zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#7a7a9a' }}>Dernière analyse</span>
                      <span style={{ fontWeight: 500, fontSize: 12 }}>{new Date(zone.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                  </div>


                  {/* ── Actions ── */}
                  <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        const activite = zone.activites?.[0]?.typeActivite?.nom || 'commerce'
                        router.push(`/dashboard/zones/${zone.id}/analyse?activite=${encodeURIComponent(activite)}`)
                      }}
                      className="voir-btn"
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        background: '#6c63ff', color: '#fff',
                        padding: '9px 0', borderRadius: 10,
                        fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      Voir
                    </button>
                    <button
                      onClick={e => handleDelete(zone.id, e)}
                      disabled={deleting === zone.id}
                      style={{ width: 38, height: 38, background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}