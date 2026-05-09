'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import ConcurrenceTable from './Concurrencetable'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import type { AnalyseResult } from '@/types/analyse'
import DemographieTab from './demographietab'

type Zone = {
  id: string
  nom: string
  adresse: string
  lat: number
  lng: number
  description: string | null
  createdAt: string
}

// ── Tooltip du graphique ──
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.08)' }}>
        <div style={{ fontSize: 12, color: '#7a7a9a', marginBottom: 4 }}>{label}</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a2e' }}>Score : {payload[0].value}</div>
      </div>
    )
  }
  return null
}

// ── Donut chart simple stylisé pour le score global ──
function ScoreDonut({ score, color = '#6c63ff' }: { score: number; color?: string }) {
  const size = 130
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference - (score / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ece9ff"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 11, color: '#9a9ab0', marginTop: 2 }}>/100</span>
      </div>
    </div>
  )
}

// ── Mini metric card (Accessibilité, Infrastructure, etc.) ──
function MetricCard({
  icon, value, label, color = '#6c63ff',
}: { icon: React.ReactNode; value: number; label: string; color?: string }) {
  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #ebebf0',
      borderRadius: 16,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      minHeight: 130,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: '#f3f1ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, color: '#7a7a9a', fontWeight: 500 }}>{value}%</span>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>
            {value}
          </span>
          <span style={{ fontSize: 14, color: '#9a9ab0', fontWeight: 600 }}>%</span>
        </div>
        <p style={{ fontSize: 13, color: '#4a4a5a', margin: '6px 0 8px', fontWeight: 500 }}>{label}</p>
        <div style={{ height: 4, background: '#f0eef9', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
        </div>
      </div>
    </div>
  )
}

export default function ZoneAnalysePage({ params }: { params: { id: string } }) {
  const [zone, setZone] = useState<Zone | null>(null)
  const [analyse, setAnalyse] = useState<AnalyseResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'demo' | 'concurrence' | 'insights'>('overview')
  const [isFav, setIsFav] = useState(false)
  const [activite, setActivite] = useState<string>('Restauration')

  useEffect(() => {
    const run = async () => {
      try {
        // 1. Charger la zone
        const zRes = await fetch(`/api/zones/${params.id}`)
        if (!zRes.ok) throw new Error('Zone introuvable')
        const zoneData: Zone = await zRes.json()
        setZone(zoneData)

        // 2. Appeler l'API analyse avec zoneId + activite
        const searchParams = new URLSearchParams(window.location.search)
        const act = searchParams.get('activite') || 'commerce'
        setActivite(act.charAt(0).toUpperCase() + act.slice(1))

        const analysisRes = await fetch(`/api/analyse/${params.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activite: act }),
        })

        if (!analysisRes.ok) {
          const err = await analysisRes.json()
          throw new Error(err.error || 'Erreur analyse')
        }

        const result: AnalyseResult = await analysisRes.json()
        setAnalyse(result)
      } catch (err: any) {
        setError(err.message || 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [params.id])

  // ── Concentration concurrentielle calculée depuis analyse.donnees.concurrence ──
  const concentrationData = useMemo(() => {
    const conc = analyse?.donnees?.concurrence
    if (!conc) return { buckets: [], plusProche: null, total: 0, densite: 0 }

    const concurrents = conc.concurrents ?? []
    const buckets = [
      { label: '< 500 m', range: [0, 500], count: 0, color: '#a78bfa' },
      { label: '500 m – 1 km', range: [500, 1000], count: 0, color: '#6c63ff' },
      { label: '1 – 2 km', range: [1000, 2000], count: 0, color: '#8b80ff' },
      { label: '2 – 5 km', range: [2000, 5000], count: 0, color: '#c4bcff' },
      { label: '> 5 km', range: [5000, Infinity], count: 0, color: '#ddd6fe' },
    ]

    // Préfère les valeurs déjà calculées si dispo, sinon calcule depuis la liste
    if (typeof conc.dans_500m === 'number') buckets[0].count = conc.dans_500m
    if (typeof conc.dans_1km === 'number') buckets[1].count = Math.max(0, conc.dans_1km - (conc.dans_500m ?? 0))

    // Pour les buckets 1-2km, 2-5km, >5km → calcul depuis la liste
    concurrents.forEach((c) => {
      const d = c.distance_m ?? 0
      if (d >= 1000 && d < 2000) buckets[2].count += 1
      else if (d >= 2000 && d < 5000) buckets[3].count += 1
      else if (d >= 5000) buckets[4].count += 1
      // Si dans_500m / dans_1km absents, on les remplit aussi
      if (typeof conc.dans_500m !== 'number' && d < 500) buckets[0].count += 1
      if (typeof conc.dans_1km !== 'number' && d >= 500 && d < 1000) buckets[1].count += 1
    })

    const total = conc.total ?? concurrents.length
    const plusProche = conc.plus_proche_m ?? null

    // Densité approximative dans 1 km² ≈ (concurrents dans 1km / π * 1²)
    const dans1km = (conc.dans_500m ?? 0) + (typeof conc.dans_1km === 'number'
      ? Math.max(0, conc.dans_1km - (conc.dans_500m ?? 0))
      : buckets[1].count)
    const totalDans1km = (conc.dans_500m ?? buckets[0].count) + (typeof conc.dans_1km === 'number'
      ? Math.max(0, conc.dans_1km - (conc.dans_500m ?? 0))
      : buckets[1].count)
    const densite = Math.round((totalDans1km / Math.PI) * 10) / 10

    return { buckets, plusProche, total, densite }
  }, [analyse])

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
        <div style={{ width: 48, height: 48, border: '3px solid #ebebf0', borderTop: '3px solid #6c63ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Analyse en cours…</p>
          <p style={{ color: '#7a7a9a', fontSize: 14 }}>L'agent IA analyse votre zone géographique</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── Error ──
  if (error || !zone || !analyse) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: '#fff', borderRadius: 16, padding: 40, border: '1.5px solid #ebebf0' }}>
          <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>❌ {error || 'Zone introuvable'}</p>
          <Link href="/dashboard/zones/list" style={{ color: '#6c63ff', fontSize: 14 }}>← Retour aux zones</Link>
        </div>
      </div>
    )
  }

  // ── Score color ──
  const scoreColor = analyse.scoreGlobal >= 80 ? '#22c55e'
                   : analyse.scoreGlobal >= 65 ? '#6c63ff'
                   : '#f59e0b'

  // Verdict label & accent
  const verdictColor = analyse.scoreGlobal >= 75 ? '#16a34a' : analyse.scoreGlobal >= 60 ? '#6c63ff' : '#d97706'
  const verdictBg = analyse.scoreGlobal >= 75 ? '#ecfdf5' : analyse.scoreGlobal >= 60 ? '#f3f1ff' : '#fffbeb'

  // Calcul moyenne / min / max pour l'évolution
  const scoreSerie = Array.isArray(analyse.historiqueScore) ? analyse.historiqueScore : []
  const scoreValues = scoreSerie.map(s => s.score).filter(v => typeof v === 'number')
  const minScore = scoreValues.length ? Math.min(...scoreValues) : 0
  const maxScore = scoreValues.length ? Math.max(...scoreValues) : 0
  const avgScore = scoreValues.length ? Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 10) / 10 : 0

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", background: '#fafafe', minHeight: '100vh', padding: '24px 32px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .tab-pill { transition: all .2s; }
        .action-btn { transition: all .2s; }
        .action-btn:hover { opacity: .85; transform: translateY(-1px); }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ─────────── HEADER CARD ─────────── */}
        <div style={{
          background: '#fff',
          border: '1.5px solid #ebebf0',
          borderRadius: 18,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
        }}>
          <Link
            href="/dashboard/zones/list"
            style={{
              width: 38, height: 38,
              background: '#f5f5f8',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none',
              color: '#0f0f13',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </Link>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 24, fontWeight: 800,
                margin: 0,
                color: '#1a1a2e',
                letterSpacing: '-0.02em',
              }}>
                {zone.nom}
              </h1>

              {/* Badge activité */}
              <span style={{
                background: '#6c63ff',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: 99,
                letterSpacing: '.01em',
              }}>
                {activite}
              </span>

              {/* Étoile favori */}
              <button
                onClick={() => setIsFav(f => !f)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 18,
                  color: isFav ? '#f59e0b' : '#d1d5db',
                  padding: 0,
                  lineHeight: 1,
                }}
                aria-label="Favori"
              >
                ★
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#7a7a9a', margin: 0, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <svg style={{ marginTop: 2, flexShrink: 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{zone.adresse}</span>
            </p>
          </div>
        </div>

        {/* ─────────── SCORE GLOBAL + 4 MÉTRIQUES ─────────── */}
        <div style={{
          background: '#fff',
          border: '1.5px solid #ebebf0',
          borderRadius: 18,
          padding: 16,
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr',
          gap: 12,
        }}>
          {/* Score global avec donut */}
          <div style={{
            background: '#f3f1ff',
            border: '1.5px solid #e0dbff',
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <ScoreDonut score={analyse.scoreGlobal ?? 0} color={scoreColor} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 11,
                color: '#7a7a9a',
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                fontWeight: 600,
                marginBottom: 8,
              }}>
                Score global
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: verdictBg,
                color: verdictColor,
                padding: '3px 10px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
              }}>
                <span style={{ width: 6, height: 6, background: verdictColor, borderRadius: '50%' }} />
                {analyse.verdict ?? '—'}
              </div>

              {analyse.scoreDelta && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: analyse.scoreDeltaPositive ? '#16a34a' : '#ef4444',
                  marginBottom: 8,
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {analyse.scoreDeltaPositive
                      ? <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      : <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />}
                  </svg>
                  {analyse.scoreDelta} sur 12 mois
                </div>
              )}

              <p style={{
                fontSize: 12,
                color: '#5a5a7a',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {analyse.niveauZone
                  ? `Zone ${analyse.niveauZone}, performance ${analyse.scoreGlobal >= 75 ? 'élevée' : analyse.scoreGlobal >= 60 ? 'moyenne' : 'faible'}.`
                  : `Zone à potentiel ${analyse.scoreGlobal >= 75 ? 'élevé' : analyse.scoreGlobal >= 60 ? 'moyen' : 'faible'}.`
                }
              </p>
            </div>
          </div>

          {/* 4 métriques */}
          <MetricCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M4 4l5 5M16 21H8a4 4 0 0 1-4-4V8" /></svg>}
            value={analyse.accessibilite?.transports ?? 0}
            label="Accessibilité"
            color="#6c63ff"
          />
          <MetricCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
            value={analyse.infrastructure?.commerces ?? 0}
            label="Infrastructure"
            color="#6c63ff"
          />
          <MetricCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
            value={analyse.attractivite?.fluxPietons ?? 0}
            label="Attractivité"
            color="#f59e0b"
          />
          <MetricCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}
            value={analyse.scoreConcurrence ?? 0}
            label="Concurrence"
            color="#6c63ff"
          />
        </div>

        {/* ─────────── BANNIÈRE OPPORTUNITÉ ─────────── */}
        {analyse.opportunite && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 12,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}>
            <div style={{
              width: 22, height: 22,
              borderRadius: '50%',
              border: '1.5px solid #f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', fontFamily: 'serif', fontStyle: 'italic' }}>i</span>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700, color: '#92400e' }}>Opportunité détectée — </span>
              <span style={{ color: '#78350f' }}>{analyse.opportunite}</span>
            </div>
          </div>
        )}

        {/* ─────────── TABS (style pill) ─────────── */}
        <div style={{
          display: 'flex',
          gap: 4,
          alignItems: 'center',
        }}>
          {([
            { key: 'overview', label: "Vue d'ensemble" },
            { key: 'demo', label: 'Démographie' },
            { key: 'concurrence', label: 'Concurrence', count: analyse.donnees?.concurrence?.total ?? analyse.donnees?.concurrence?.concurrents?.length },
            { key: 'insights', label: 'Insights' },
          ] as const).map(t => {
            const isActive = activeTab === t.key
            return (
              <button
                key={t.key}
                className="tab-pill"
                onClick={() => setActiveTab(t.key as any)}
                style={{
                  padding: '10px 18px',
                  background: isActive ? '#2563eb' : 'transparent',
                  border: 'none',
                  borderRadius: 99,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#fff' : '#5a5a7a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {t.label}
                {('count' in t) && t.count != null && (
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isActive ? 'rgba(255,255,255,.7)' : '#9a9ab0',
                    background: isActive ? 'rgba(255,255,255,.12)' : 'transparent',
                    padding: isActive ? '1px 6px' : 0,
                    borderRadius: 99,
                  }}>
                    {t.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ─────────── CONTENU TABS ─────────── */}

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Évolution score */}
              <div style={{
                background: '#fff',
                border: '1.5px solid #ebebf0',
                borderRadius: 18,
                padding: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, margin: 0, color: '#1a1a2e' }}>
                      Évolution du score
                    </h3>
                    <p style={{ color: '#7a7a9a', fontSize: 12, margin: '4px 0 0', fontWeight: 500 }}>
                      Performance sur les 12 derniers mois
                    </p>
                  </div>
                  {analyse.scoreDelta && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: analyse.scoreDeltaPositive ? '#ecfdf5' : '#fef2f2',
                      color: analyse.scoreDeltaPositive ? '#16a34a' : '#ef4444',
                      padding: '4px 10px',
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {analyse.scoreDeltaPositive
                          ? <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          : <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />}
                      </svg>
                      {analyse.scoreDelta}
                    </div>
                  )}
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={scoreSerie} margin={{ top: 16, right: 8, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6c63ff" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#6c63ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9a9ab0' }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#9a9ab0' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#6c63ff"
                      strokeWidth={2.5}
                      fill="url(#scoreFill)"
                      dot={{ fill: '#fff', stroke: '#6c63ff', strokeWidth: 2, r: 3 }}
                      activeDot={{ fill: '#6c63ff', stroke: '#fff', strokeWidth: 2.5, r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, fontSize: 11, color: '#7a7a9a' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6c63ff' }} />
                    Score mensuel
                  </span>
                  {scoreValues.length > 0 && (
                    <span>Min : {minScore} · Max : {maxScore} · Moy. : {avgScore}</span>
                  )}
                </div>
              </div>

              {/* Concentration concurrentielle */}
              <div style={{
                background: '#fff',
                border: '1.5px solid #ebebf0',
                borderRadius: 18,
                padding: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, margin: 0, color: '#1a1a2e' }}>
                      Concentration concurrentielle
                    </h3>
                    <p style={{ color: '#7a7a9a', fontSize: 12, margin: '4px 0 0', fontWeight: 500 }}>
                      {concentrationData.total} concurrents répartis par distance
                    </p>
                  </div>
                  {concentrationData.plusProche != null && (
                    <span style={{
                      background: '#f3f1ff',
                      color: '#6c63ff',
                      padding: '4px 10px',
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      Plus proche : {concentrationData.plusProche} m
                    </span>
                  )}
                </div>

                {/* Bar chart custom */}
                {(() => {
                  const buckets = concentrationData.buckets
                  const maxC = Math.max(1, ...buckets.map(b => b.count))
                  const ticks = [0, Math.ceil(maxC * 0.25), Math.ceil(maxC * 0.5), Math.ceil(maxC * 0.75), maxC]
                  const peakIndex = buckets.reduce((max, b, i) => b.count > buckets[max].count ? i : max, 0)

                  return (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', gap: 8, height: 180, alignItems: 'flex-end', position: 'relative' }}>
                        {/* Y axis labels */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column-reverse',
                          justifyContent: 'space-between',
                          height: '100%',
                          paddingRight: 8,
                          fontSize: 11,
                          color: '#9a9ab0',
                          minWidth: 18,
                        }}>
                          {ticks.map((t, i) => <span key={i}>{t}</span>)}
                        </div>

                        {/* Grid + bars */}
                        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                          {/* Lignes horizontales */}
                          {ticks.map((_, i) => (
                            <div
                              key={i}
                              style={{
                                position: 'absolute',
                                left: 0, right: 0,
                                bottom: `${(i / (ticks.length - 1)) * 100}%`,
                                borderTop: '1px dashed #ececf2',
                              }}
                            />
                          ))}

                          {/* Bars */}
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'grid',
                            gridTemplateColumns: `repeat(${buckets.length}, 1fr)`,
                            alignItems: 'end',
                            gap: 8,
                          }}>
                            {buckets.map((b, i) => {
                              const h = (b.count / maxC) * 100
                              const isPeak = i === peakIndex && b.count > 0
                              return (
                                <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                  <span style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: isPeak ? '#16a34a' : '#5a5a7a',
                                    marginBottom: 4,
                                  }}>
                                    {b.count}
                                  </span>
                                  <div style={{
                                    width: '100%',
                                    height: `${Math.max(h, 2)}%`,
                                    background: isPeak ? '#22c55e' : b.color,
                                    borderRadius: '6px 6px 0 0',
                                    transition: 'height 1s ease',
                                  }} />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* X labels */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: `18px 8px repeat(${buckets.length}, 1fr)`,
                        gap: 8,
                        marginTop: 6,
                      }}>
                        <div /><div />
                        {buckets.map(b => (
                          <span key={b.label} style={{ fontSize: 11, color: '#7a7a9a', textAlign: 'center', fontWeight: 500 }}>
                            {b.label}
                          </span>
                        ))}
                      </div>

                      {/* Footer légende */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, fontSize: 11, color: '#7a7a9a' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                          Pic de concentration
                        </span>
                        <span>Densité : {concentrationData.densite} / km² · Saturation {
                          concentrationData.densite > 10 ? 'élevée'
                          : concentrationData.densite > 4 ? 'modérée'
                          : 'faible'
                        }</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Métriques détaillées (3 cartes) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                {
                  icon: '', title: 'Accessibilité',
                  items: [
                    { label: 'Transports', value: analyse.accessibilite?.transports ?? 0 },
                    { label: 'Parking', value: analyse.accessibilite?.parking ?? 0 },
                    { label: 'Piétons', value: analyse.accessibilite?.pietons ?? 0 },
                  ]
                },
                {
                  icon: '', title: 'Infrastructure',
                  items: [
                    { label: 'Commerces', value: analyse.infrastructure?.commerces ?? 0 },
                    { label: 'Services', value: analyse.infrastructure?.services ?? 0 },
                    { label: 'Équipements', value: analyse.infrastructure?.equipements ?? 0 },
                  ]
                },
                {
                  icon: '', title: 'Attractivité',
                  items: [
                    { label: 'Flux piétons', value: analyse.attractivite?.fluxPietons ?? 0 },
                    { label: 'Visibilité', value: analyse.attractivite?.visibilite ?? 0 },
                    { label: 'Pouvoir d\'achat', value: analyse.attractivite?.pouvoirAchat ?? 0 },
                  ]
                },
              ].map(block => (
                <div key={block.title} style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 18, padding: 24 }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, margin: '0 0 16px', color: '#1a1a2e' }}>{block.title}</h3>
                  {block.items.map(item => (
                    <div key={item.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#4a4a5a', fontWeight: 500 }}>{item.label}</span>
                        <span style={{ fontWeight: 700, color: '#6c63ff', fontSize: 14 }}>{item.value}%</span>
                      </div>
                      <div style={{ height: 6, background: '#f0eef9', borderRadius: 99, overflow: 'hidden', marginTop: 6 }}>
                        <div style={{ height: '100%', width: `${item.value}%`, background: '#6c63ff', borderRadius: 99, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Densité des activités (concurrents par type + infra) */}
            <div style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 4px', color: '#1a1a2e' }}>
                Densité des activités
              </h3>
              <p style={{ color: '#7a7a9a', fontSize: 12, margin: '0 0 20px', fontWeight: 500 }}>
                Répartition des concurrents et infrastructures locales
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Concurrents par type */}
                {analyse.donnees?.concurrence?.par_type && Object.keys(analyse.donnees.concurrence.par_type).length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#4a4a5a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      Types de concurrents
                    </div>
                    {Object.entries(analyse.donnees.concurrence.par_type).slice(0, 5).map(([key, t]: [string, any]) => (
                      <div key={key} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: '#2a2a38', fontWeight: 500 }}>{t.display}</span>
                          <span style={{ color: '#6c63ff', fontWeight: 700 }}>{t.count} ({t.percentage}%)</span>
                        </div>
                        <div style={{ height: 6, background: '#f0eef9', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${t.percentage}%`, background: '#6c63ff', borderRadius: 99, transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Infrastructure par catégorie */}
                {analyse.donnees?.infrastructure?.par_categorie && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#4a4a5a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      Infrastructure locale
                    </div>
                    {Object.entries(analyse.donnees.infrastructure.par_categorie).map(([key, cat]: [string, any]) => {
                      const icons: Record<string, string> = { commerce: '', sante: '', education: '', services: '' }
                      const colors: Record<string, string> = { commerce: '#6c63ff', sante: '#22c55e', education: '#f59e0b', services: '#ff6584' }
                      const labels: Record<string, string> = { commerce: 'Commerce', sante: 'Santé', education: 'Éducation', services: 'Services' }
                      return (
                        <div key={key} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                            <span style={{ color: '#2a2a38', fontWeight: 500 }}>{icons[key]} {labels[key] ?? key}</span>
                            <span style={{ color: colors[key] ?? '#6c63ff', fontWeight: 700 }}>{cat.count} étab.</span>
                          </div>
                          <div style={{ height: 6, background: '#f0eef9', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, cat.count * 12)}%`, background: colors[key] ?? '#6c63ff', borderRadius: 99 }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Démographie ── */}
        {activeTab === 'demo' && (
          <DemographieTab analyse={analyse} />
        )}

        {/* ── Concurrence ── */}
        {activeTab === 'concurrence' && (
          <div style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 18, padding: 24 }}>
            <ConcurrenceTable
              concurrents={analyse.donnees?.concurrence?.concurrents ?? []}
              stats={analyse.donnees?.concurrence?.stats}
              parType={analyse.donnees?.concurrence?.par_type}
            />
          </div>
        )}

        {/* ── Insights ── */}
        {activeTab === 'insights' && (
          <div style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 18, padding: 32 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, margin: '0 0 6px', color: '#1a1a2e' }}>
              Rapport d'analyse IA
            </h3>
            <p style={{ color: '#7a7a9a', fontSize: 13, margin: '0 0 24px', fontWeight: 500 }}>
              Analyse stratégique générée par l'agent IA
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(Array.isArray(analyse.insights) ? analyse.insights : []).map((insight, i) => {
                if (typeof insight === 'string') {
                  return (
                    <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 20px', background: '#f5f5f8', borderRadius: 12 }}>
                      <div style={{ width: 28, height: 28, background: '#6c63ff', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: '#2a2a38' }}>{insight}</p>
                    </div>
                  )
                }

                const colors = {
                  opportunite: { bg: '#f0fdf4', border: '#86efac', badge: '#16a34a', dot: '#22c55e' },
                  warning: { bg: '#fffbeb', border: '#fde68a', badge: '#d97706', dot: '#f59e0b' },
                  info: { bg: '#eff6ff', border: '#bfdbfe', badge: '#2563eb', dot: '#3b82f6' },
                }
                const c = colors[insight.niveau as keyof typeof colors] ?? colors.info

                return (
                  <div key={i} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 14, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#1a1a2e', flex: 1 }}>
                        {insight.titre}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: c.badge, background: '#fff', border: `1px solid ${c.border}`, borderRadius: 99, padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        {insight.niveau === 'opportunite' ? 'Opportunité' : insight.niveau === 'warning' ? 'Attention' : 'Info'}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#2a2a38', margin: '0 0 8px 20px', lineHeight: 1.5 }}>
                      {insight.resume}
                    </p>
                    <p style={{ fontSize: 13, color: '#4a4a5a', margin: '0 0 0 20px', lineHeight: 1.7 }}>
                      {insight.detail}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}