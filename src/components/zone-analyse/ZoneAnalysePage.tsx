'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ConcurrenceTable from './Concurrencetable'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import type { AnalyseResult } from '@/types/analyse'
import type { ConcurrentItem as Concurrent } from '@/types/analyse'
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



const CHART_COLORS = ['#6c63ff', '#ff6584', '#22c55e', '#f59e0b']

// ── Composant barre de progression ──
function ProgressBar({ value, color = '#6c63ff' }: { value: number; color?: string }) {
  return (
    <div style={{ height: 6, background: '#ebebf0', borderRadius: 99, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
    </div>
  )
}

// ── Tooltip du graphique ──
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.08)' }}>
        <div style={{ fontSize: 12, color: '#7a7a9a', marginBottom: 4 }}>{label}</div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>score : {payload[0].value}</div>
      </div>
    )
  }
  return null
}

export default function ZoneAnalysePage({ params }: { params: { id: string } }) {
  const [zone, setZone] = useState<Zone | null>(null)
  const [analyse, setAnalyse] = useState<AnalyseResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'demo' | 'concurrence' | 'insights'>('overview')
  const [isFav, setIsFav] = useState(false)

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
        const activite = searchParams.get('activite') || 'commerce'

        const analysisRes = await fetch(`/api/analyse/${params.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activite }),
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

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
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
      <div style={{ minHeight: '100vh', background: '#f5f5f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: '#fff', borderRadius: 16, padding: 40, border: '1.5px solid #ebebf0' }}>
          <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>❌ {error || 'Zone introuvable'}</p>
          <Link href="/dashboard/zones/list" style={{ color: '#6c63ff', fontSize: 14 }}>← Retour aux zones</Link>
        </div>
      </div>
    )
  }

  const scoreColor = analyse.scoreGlobal >= 80 ? '#22c55e' : analyse.scoreGlobal >= 65 ? '#6c63ff' : '#f59e0b'

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", background: '#f5f5f8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .tab-btn { transition: all .2s; }
        .tab-btn:hover { background: rgba(255,255,255,.15) !important; }
        .action-btn { transition: all .2s; }
        .action-btn:hover { opacity: .8; }
      `}</style>

      {/* ── Header bar ── */}
      <div style={{ background: '#fff', borderBottom: '1.5px solid #ebebf0', padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard/zones/list" style={{ width: 34, height: 34, background: '#f5f5f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#0f0f13' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, margin: 0, color: '#1a1a2e', letterSpacing: '-0.02em' }}>{zone.nom}</h1>
              <button onClick={() => setIsFav(f => !f)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                {isFav ? '★' : '☆'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#7a7a9a', margin: 0 }}>
              <svg style={{ verticalAlign: 'middle', marginRight: 4 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              {zone.adresse}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f5f5f8', border: '1.5px solid #ebebf0', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
            Partager
          </button>
          <button className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0f0f13', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Exporter
          </button>
        </div>
      </div>

      {/* ── Hero Score Banner ── */}
      {/* ── Hero Score Banner — simplifié ── */}
      <div style={{
        background: 'linear-gradient(135deg, #3730a3 0%, #6c63ff 50%, #a855f7 100%)',
        padding: '32px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 32,
      }}>
        {/* Score global */}
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
            Score global
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 56, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {analyse.scoreGlobal ?? 0}
            </span>
            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 20 }}>/100</span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-block',
              background: analyse.scoreGlobal >= 75 ? 'rgba(34,197,94,.25)' : analyse.scoreGlobal >= 60 ? 'rgba(99,102,241,.35)' : 'rgba(245,158,11,.25)',
              color: analyse.scoreGlobal >= 75 ? '#86efac' : analyse.scoreGlobal >= 60 ? '#c4b5fd' : '#fcd34d',
              border: `1px solid ${analyse.scoreGlobal >= 75 ? 'rgba(34,197,94,.4)' : analyse.scoreGlobal >= 60 ? 'rgba(167,139,250,.4)' : 'rgba(245,158,11,.4)'}`,
              borderRadius: 99,
              padding: '4px 14px',
              fontSize: 13,
              fontWeight: 600,
            }}>
              {analyse.verdict ?? '—'}
            </span>
            <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>
              {analyse.niveauZone ? `Zone ${analyse.niveauZone}` : ''}
            </span>
          </div>
        </div>

        {/* Métriques rapides */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Accessibilité', value: `${analyse.accessibilite?.transports ?? 0}%`, icon: '🚌' },
            { label: 'Infrastructure', value: `${analyse.infrastructure?.commerces ?? 0}%`, icon: '🏗️' },
            { label: 'Attractivité', value: `${analyse.attractivite?.fluxPietons ?? 0}%`, icon: '✨' },
            { label: 'Concurrence', value: `${analyse.scoreConcurrence ?? 0}%`, icon: '⚡' },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,.15)', paddingLeft: 24 }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#fff' }}>{m.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Opportunité ── */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '14px 40px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        <div>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#92400e' }}>Opportunité détectée — </span>
          <span style={{ fontSize: 13, color: '#78350f' }}>{analyse.opportunite}</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: '#fff', borderBottom: '1.5px solid #ebebf0', padding: '0 40px', display: 'flex', gap: 4 }}>
        {([
          { key: 'overview', label: "Vue d'ensemble" },
          { key: 'demo', label: 'Démographie' },
          { key: 'concurrence', label: 'Concurrence' },
          { key: 'insights', label: 'Insights' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '14px 20px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontFamily: 'inherit',
              color: activeTab === t.key ? '#0f0f13' : '#7a7a9a',
              fontWeight: activeTab === t.key ? 600 : 400,
              borderBottom: activeTab === t.key ? '2px solid #6c63ff' : '2px solid transparent',
              transition: 'all .2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ padding: '32px 40px' }}>

        {/* ── Overview tab ── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

              {/* Évolution score */}
              <div style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4, color: '#1a1a2e' }}>Évolution du score</h3>
                <p style={{ color: '#5a5a7a', fontSize: 13, marginBottom: 20, fontWeight: 500 }}>Performance sur les 7 derniers mois</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={Array.isArray(analyse.historiqueScore) ? analyse.historiqueScore : []} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#7a7a9a' }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#7a7a9a' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="#6c63ff" strokeWidth={2.5} dot={{ fill: '#6c63ff', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Répartition sectorielle */}
              <div style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4, color: '#1a1a2e' }}>Répartition sectorielle</h3>
                <p style={{ color: '#5a5a7a', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>Distribution des activités dans la zone</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={Array.isArray(analyse.repartitionSectorielle) ? analyse.repartitionSectorielle : []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}%`} labelLine={true}>
                      {(Array.isArray(analyse.repartitionSectorielle) ? analyse.repartitionSectorielle : []).map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                {
                  icon: '🎯', title: 'Accessibilité',
                  items: [
                    { label: 'Transports', value: analyse.accessibilite?.transports ?? 0 },
                    { label: 'Parking', value: analyse.accessibilite?.parking ?? 0 },
                    { label: 'Piétons', value: analyse.accessibilite?.pietons ?? 0 },
                  ]
                },
                {
                  icon: '🏗️', title: 'Infrastructure',
                  items: [
                    { label: 'Commerces', value: analyse.infrastructure?.commerces ?? 0 },
                    { label: 'Services', value: analyse.infrastructure?.services ?? 0 },
                    { label: 'Équipements', value: analyse.infrastructure?.equipements ?? 0 },
                  ]
                },
                {
                  icon: '💰', title: 'Attractivité',
                  items: [
                    { label: 'Flux piétons', value: analyse.attractivite?.fluxPietons ?? 0 },
                    { label: 'Visibilité', value: analyse.attractivite?.visibilite ?? 0 },
                    { label: 'Pouvoir d\'achat', value: analyse.attractivite?.pouvoirAchat ?? 0 },
                  ]
                },
              ].map(block => (
                <div key={block.title} style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 16, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 18 }}>{block.icon}</span>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, margin: 0, color: '#1a1a2e' }}>{block.title}</h3>
                  </div>
                  {block.items.map(item => (
                    <div key={item.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#4a4a5a', fontWeight: 500 }}>{item.label}</span>
                        <span style={{ fontWeight: 700, color: '#6c63ff', fontSize: 14 }}>{item.value}%</span>
                      </div>
                      <ProgressBar value={item.value} color="#6c63ff" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Densité des activités */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Concurrents par type */}
              {analyse.donnees?.concurrence?.par_type && Object.keys(analyse.donnees.concurrence.par_type).length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#4a4a5a', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Types de concurrents
                  </div>
                  {Object.entries(analyse.donnees.concurrence.par_type).slice(0, 5).map(([key, t]: [string, any]) => (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: '#2a2a38', fontWeight: 500 }}>{t.display}</span>
                        <span style={{ color: '#6c63ff', fontWeight: 700 }}>{t.count} ({t.percentage}%)</span>
                      </div>
                      <div style={{ height: 6, background: '#ebebf0', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${t.percentage}%`, background: '#6c63ff', borderRadius: 99, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Infrastructure par catégorie */}
              {analyse.donnees?.infrastructure?.par_categorie && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#4a4a5a', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Infrastructure locale
                  </div>
                  {Object.entries(analyse.donnees.infrastructure.par_categorie).map(([key, cat]: [string, any]) => {
                    const icons: Record<string, string> = { commerce: '🛍️', sante: '🏥', education: '🎓', services: '🏦' }
                    const colors: Record<string, string> = { commerce: '#6c63ff', sante: '#22c55e', education: '#f59e0b', services: '#ff6584' }
                    const labels: Record<string, string> = { commerce: 'Commerce', sante: 'Santé', education: 'Éducation', services: 'Services' }
                    return (
                      <div key={key} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: '#2a2a38', fontWeight: 500 }}>{icons[key]} {labels[key] ?? key}</span>
                          <span style={{ color: colors[key] ?? '#6c63ff', fontWeight: 700 }}>{cat.count} étab.</span>
                        </div>
                        <div style={{ height: 6, background: '#ebebf0', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, cat.count * 12)}%`, background: colors[key] ?? '#6c63ff', borderRadius: 99 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Concurrence tab ── ⭐ NOUVEAU ⭐ */}
        {activeTab === 'concurrence' && (
          <ConcurrenceTable
            concurrents={analyse.donnees?.concurrence?.concurrents ?? []}
            stats={analyse.donnees?.concurrence?.stats}
            parType={analyse.donnees?.concurrence?.par_type}
          />
        )}

        {/* ── Insights tab ── */}
        {activeTab === 'insights' && (
          <div style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 16, padding: 32 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 6, color: '#1a1a2e' }}>
              Rapport d'analyse IA
            </h3>
            <p style={{ color: '#5a5a7a', fontSize: 14, marginBottom: 24, fontWeight: 500 }}>
              Analyse stratégique générée par l'agent IA
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(Array.isArray(analyse.insights) ? analyse.insights : []).map((insight, i) => {
                // Compatibilité string et objet
                if (typeof insight === 'string') {
                  return (
                    <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 20px', background: '#f5f5f8', borderRadius: 12 }}>
                      <div style={{ width: 28, height: 28, background: '#6c63ff', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: '#2a2a38' }}>{insight}</p>
                    </div>
                  )
                }

                // Nouveau format rapport
                const colors = {
                  opportunite: { bg: '#f0fdf4', border: '#86efac', badge: '#16a34a', dot: '#22c55e' },
                  warning: { bg: '#fffbeb', border: '#fde68a', badge: '#d97706', dot: '#f59e0b' },
                  info: { bg: '#eff6ff', border: '#bfdbfe', badge: '#2563eb', dot: '#3b82f6' },
                }
                const c = colors[insight.niveau as keyof typeof colors] ?? colors.info

                return (
                  <div key={i} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 14, padding: 20 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#1a1a2e', flex: 1 }}>
                        {insight.titre}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: c.badge, background: '#fff', border: `1px solid ${c.border}`, borderRadius: 99, padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        {insight.niveau === 'opportunite' ? 'Opportunité' : insight.niveau === 'warning' ? 'Attention' : 'Info'}
                      </span>
                    </div>

                    {/* Résumé */}
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#2a2a38', margin: '0 0 8px 20px', lineHeight: 1.5 }}>
                      {insight.resume}
                    </p>

                    {/* Détail */}
                    <p style={{ fontSize: 13, color: '#4a4a5a', margin: '0 0 0 20px', lineHeight: 1.7 }}>
                      {insight.detail}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {/* ── Démographie tab (placeholder) ── */}
        {/* ── Démographie tab ── */}
        {activeTab === 'demo' && (
          <DemographieTab analyse={analyse} />
        )}
      </div>
    </div>
  )
}