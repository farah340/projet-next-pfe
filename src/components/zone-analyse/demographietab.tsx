'use client'

import type { AnalyseResult } from '@/types/analyse'

// ── Barre de progression ──────────────────────────────────────────
function ProgressBar({ value, color = '#6c63ff' }: { value: number; color?: string }) {
  return (
    <div style={{ height: 6, background: '#ebebf0', borderRadius: 99, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ height: '100%', width: `${Math.min(100, value)}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────
type Props = {
  analyse: AnalyseResult
}

export default function DemographieTab({ analyse }: Props) {
  const transports    = analyse.donnees?.transports
  const infra         = analyse.donnees?.infrastructure
  const attractivite  = analyse.donnees?.attractivite

  const infraIcons:  Record<string, string> = { commerce: '🛍️', sante: '🏥', education: '🎓', services: '🏦' }
  const infraColors: Record<string, string> = { commerce: '#6c63ff', sante: '#22c55e', education: '#f59e0b', services: '#ff6584' }
  const infraLabels: Record<string, string> = { commerce: 'Commerce', sante: 'Santé', education: 'Éducation', services: 'Services' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Cartes résumé ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {[
          {
            label: 'Transports & Parkings',
            value: (transports?.transports_publics_count ?? 0) + (transports?.parkings_count ?? 0),
            sub: `Plus proche : ${transports?.plus_proche_transport_m ?? '—'}m`,
            color: '#6c63ff',
          },
          {
            label: 'Commerces & Services',
            value: (infra?.par_categorie?.commerce?.count ?? 0) + (infra?.par_categorie?.services?.count ?? 0),
            sub: `Santé : ${infra?.par_categorie?.sante?.count ?? 0} établissements`,
            color: '#22c55e',
          },
          {
            label: 'Éducation',
            value: infra?.par_categorie?.education?.count ?? 0,
            sub: 'Établissements scolaires',
            color: '#f59e0b',
          },
          {
            label: 'Attracteurs',
            value: attractivite?.total_attracteurs ?? 0,
            sub: `Prix moyen : ${attractivite?.prix_moyen_tnd ?? '—'} TND`,
            color: '#ff6584',
          },
        ].map((card, i) => (
          <div key={i} style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, color: '#7a7a9a', marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: card.color }}>
              {card.value}
            </div>
            <div style={{ fontSize: 12, color: '#9a9ab0', marginTop: 4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Grille 2 colonnes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ── Transports ── */}
        <div style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4, color: '#1a1a2e' }}>
            🚌 Transports & Accessibilité
          </h3>
          <p style={{ fontSize: 13, color: '#7a7a9a', marginBottom: 16 }}>
            {transports?.total ?? 0} points de transport dans la zone
          </p>

          {transports?.by_type
            ? Object.entries(transports.by_type).map(([key, t]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: '#2a2a38' }}>{t.display}</span>
                    <span style={{ color: '#6c63ff', fontWeight: 700 }}>{t.count} · {t.closest_m}m</span>
                  </div>
                  <ProgressBar value={t.count * 15} color="#6c63ff" />
                  {t.examples?.slice(0, 2).map((ex, j) => (
                    <div key={j} style={{ fontSize: 11, color: '#9a9ab0', marginTop: 3, paddingLeft: 8 }}>
                      → {ex.name} ({ex.distance_m}m{ex.rating ? ` · ★${ex.rating}` : ''})
                    </div>
                  ))}
                </div>
              ))
            : <p style={{ color: '#9a9ab0', fontSize: 13 }}>Données non disponibles</p>
          }
        </div>

        {/* ── Infrastructure ── */}
        <div style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4, color: '#1a1a2e' }}>
            🏗️ Infrastructure locale
          </h3>
          <p style={{ fontSize: 13, color: '#7a7a9a', marginBottom: 16 }}>
            {infra?.within_1km ?? 0} établissements dans 1km
          </p>

          {infra?.par_categorie
            ? Object.entries(infra.par_categorie).map(([key, cat]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: '#2a2a38' }}>
                      {infraIcons[key] ?? '📍'} {infraLabels[key] ?? key}
                    </span>
                    <span style={{ color: infraColors[key] ?? '#6c63ff', fontWeight: 700 }}>
                      {cat.count} établissements
                    </span>
                  </div>
                  <ProgressBar value={cat.count * 12} color={infraColors[key] ?? '#6c63ff'} />
                  {cat.top_3?.slice(0, 2).map((item, j) => (
                    <div key={j} style={{ fontSize: 11, color: '#9a9ab0', marginTop: 3, paddingLeft: 8 }}>
                      → {item.name} ({item.distance_m}m{item.rating ? ` · ★${item.rating}` : ''})
                    </div>
                  ))}
                </div>
              ))
            : <p style={{ color: '#9a9ab0', fontSize: 13 }}>Données non disponibles</p>
          }
        </div>

        {/* ── Top attracteurs ── */}
        <div style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4, color: '#1a1a2e' }}>
            ✨ Top attracteurs
          </h3>
          <p style={{ fontSize: 13, color: '#7a7a9a', marginBottom: 16 }}>
            Zone {attractivite?.niveau_zone ?? '—'} · Prix moyen {attractivite?.prix_moyen_tnd ?? '—'} TND
          </p>

          {attractivite?.top_5_attracteurs?.length
            ? attractivite.top_5_attracteurs.map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 4 ? '1px solid #f0f0f5' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: '#9a9ab0' }}>{a.type} · {a.distance_m}m</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {a.rating && <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>★ {a.rating}</div>}
                    {a.prix_tnd && <div style={{ fontSize: 11, color: '#7a7a9a' }}>{a.prix_tnd} TND</div>}
                  </div>
                </div>
              ))
            : <p style={{ color: '#9a9ab0', fontSize: 13 }}>Données non disponibles</p>
          }
        </div>

        {/* ── Analyse IA ── */}
        <div style={{ background: '#fff', border: '1.5px solid #ebebf0', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#1a1a2e' }}>
            📊 Analyse IA de la zone
          </h3>

          {analyse.pointsForts && analyse.pointsForts.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#22c55e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                ✅ Points forts
              </div>
              {analyse.pointsForts.map((p, i) => (
                <div key={i} style={{ fontSize: 13, color: '#2a2a38', padding: '6px 0', borderBottom: '1px solid #f0f0f5', display: 'flex', gap: 8 }}>
                  <span style={{ color: '#22c55e' }}>→</span> {p}
                </div>
              ))}
            </div>
          )}

          {analyse.pointsFaibles && analyse.pointsFaibles.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                ⚠️ Points faibles
              </div>
              {analyse.pointsFaibles.map((p, i) => (
                <div key={i} style={{ fontSize: 13, color: '#2a2a38', padding: '6px 0', borderBottom: '1px solid #f0f0f5', display: 'flex', gap: 8 }}>
                  <span style={{ color: '#ef4444' }}>→</span> {p}
                </div>
              ))}
            </div>
          )}

          {analyse.recommandation && (
            <div style={{ background: '#f0f0ff', borderRadius: 10, padding: 12, fontSize: 13, color: '#3730a3', lineHeight: 1.6 }}>
              💡 {analyse.recommandation}
            </div>
          )}

          {!analyse.pointsForts?.length && !analyse.pointsFaibles?.length && !analyse.recommandation && (
            <p style={{ color: '#9a9ab0', fontSize: 13 }}>Analyse non disponible</p>
          )}
        </div>

      </div>
    </div>
  )
}