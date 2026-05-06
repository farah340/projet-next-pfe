'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import type { ConcurrentItem } from '@/types/analyse'

interface Props {
  concurrents: ConcurrentItem[]
}

// ── Tranches de distance ─────────────────────────────────────
// Chaque tranche = un libellé + une fonction qui dit si une distance y appartient
const TRANCHES = [
  { label: '0-200m',   min: 0,    max: 200,    color: '#dc2626' },  // rouge — très proche
  { label: '200-500m', min: 200,  max: 500,    color: '#f59e0b' },  // orange
  { label: '500m-1km', min: 500,  max: 1000,   color: '#eab308' },  // jaune
  { label: '1-2km',    min: 1000, max: 2000,   color: '#84cc16' },  // vert clair
  { label: '2km+',     min: 2000, max: Infinity, color: '#22c55e' }, // vert
] as const

// ── Tooltip personnalisé ─────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #ebebf0',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,.08)',
      minWidth: 160,
    }}>
      <div style={{ fontSize: 12, color: '#7a7a9a', marginBottom: 4 }}>
        Tranche {d.label}
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a2e', marginBottom: 4 }}>
        {d.count} concurrent{d.count > 1 ? 's' : ''}
      </div>
      {d.menaceMoy > 0 && (
        <div style={{ fontSize: 12, color: '#5a5a7a' }}>
          Menace moy. : <strong style={{ color: d.color }}>{d.menaceMoy}/100</strong>
        </div>
      )}
      {d.pct > 0 && (
        <div style={{ fontSize: 12, color: '#5a5a7a' }}>
          {d.pct}% du total
        </div>
      )}
    </div>
  )
}

export default function ConcurrentsDistanceChart({ concurrents }: Props) {
  // ── Grouper les concurrents par tranche ─────────────────────
  const data = TRANCHES.map(tranche => {
    const inRange = concurrents.filter(c => {
      const d = Number(c.distance_m ?? 0)
      return d >= tranche.min && d < tranche.max
    })

    const count = inRange.length
    const menaceMoy = count > 0
      ? Math.round(
          inRange.reduce((s, c) => s + (Number(c.menace_score) || 0), 0) / count
        )
      : 0

    return {
      label: tranche.label,
      count,
      menaceMoy,
      color: tranche.color,
      pct: 0, // calculé après
    }
  })

  // ── Calcul des pourcentages ────────────────────────────────
  const total = data.reduce((s, d) => s + d.count, 0)
  data.forEach(d => {
    d.pct = total > 0 ? Math.round((d.count / total) * 100) : 0
  })

  // ── Stats résumées (affichées sous le graphe) ──────────────
  const dans500m = data[0].count + data[1].count
  const dans1km = dans500m + data[2].count
  const menaceMoyGlobale = total > 0
    ? Math.round(
        concurrents.reduce((s, c) => s + (Number(c.menace_score) || 0), 0) / total
      )
    : 0

  // ── État vide ──────────────────────────────────────────────
  if (total === 0) {
    return (
      <div style={{
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9a9ab0',
        fontSize: 13,
        background: '#f9f9fb',
        borderRadius: 12,
      }}>
        Aucun concurrent détecté dans la zone
      </div>
    )
  }

  return (
    <div>
      {/* ── Graphe ── */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, bottom: 5, left: -20 }}
          barCategoryGap="20%"
        >
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#7a7a9a', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#7a7a9a' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,99,255,.06)' }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              style={{ fill: '#1a1a2e', fontSize: 12, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* ── Stats résumées sous le graphe ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 14,
        borderTop: '1px solid #ebebf0',
        gap: 8,
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 10, color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4, fontWeight: 600 }}>
            Dans 500m
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: '#dc2626' }}>
            {dans500m}
          </div>
        </div>
        <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid #ebebf0', borderRight: '1px solid #ebebf0' }}>
          <div style={{ fontSize: 10, color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4, fontWeight: 600 }}>
            Dans 1km
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>
            {dans1km}
          </div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 10, color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4, fontWeight: 600 }}>
            Menace moy.
          </div>
          <div style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 18,
            fontWeight: 800,
            color: menaceMoyGlobale >= 70 ? '#dc2626' : menaceMoyGlobale >= 40 ? '#f59e0b' : '#22c55e',
          }}>
            {menaceMoyGlobale}<span style={{ fontSize: 11, color: '#9a9ab0', fontWeight: 500 }}>/100</span>
          </div>
        </div>
      </div>
    </div>
  )
}