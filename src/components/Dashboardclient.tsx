'use client'

import Link from 'next/link'

type RecentZone = {
    id: string
    nom: string
    adresse: string
    createdAt: string
    score: number | null
    activite: string | null
}

type TopZone = {
    id: string
    nom: string
    activite: string | null
    score: number
    tendance: number | null
}

interface Props {
    userName: string
    totalZones: number
    zonesRecommandees: number
    zonesAEviter: number
    zonesAReanalyser: number
    meilleurSecteur: { nom: string; moyenne: number; nbZones: number } | null
    recentZones: RecentZone[]
    topZones: TopZone[]
    heatmap: number[][]
    heatmapPeak: { day: number; hour: number; count: number } | null
}

// ── Helpers couleurs par activité/secteur ──
const SECTOR_STYLE: Record<string, { bg: string; text: string }> = {
    Services:    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    Restauration:{ bg: 'bg-violet-100',  text: 'text-violet-700'  },
    Commerce:    { bg: 'bg-amber-100',   text: 'text-amber-700'   },
    Service:     { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    Industrie:   { bg: 'bg-red-100',     text: 'text-red-700'     },
    Résidentiel: { bg: 'bg-cyan-100',    text: 'text-cyan-700'    },
}

const sectorBadge = (sector: string | null) => {
    if (!sector) return { bg: 'bg-slate-100', text: 'text-slate-600' }
    return SECTOR_STYLE[sector] || { bg: 'bg-slate-100', text: 'text-slate-600' }
}

const scoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500'
    if (score >= 70) return 'bg-blue-500'
    if (score >= 60) return 'bg-amber-500'
    return 'bg-red-500'
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const HOURS = ['06h', '09h', '12h', '15h', '18h', '21h']

// ── Configuration des 4 cartes business (Alternative B) ──
const businessCards = (
    totalZones: number,
    recommandees: number,
    aEviter: number,
    aReanalyser: number,
    meilleurSecteur: { nom: string; moyenne: number; nbZones: number } | null,
) => [
    {
        label: 'Zones recommandées',
        value: recommandees,
        sub: totalZones > 0
            ? `Score ≥ 70 · ${Math.round((recommandees / totalZones) * 100)}% de vos zones`
            : 'Aucune zone analysée',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
            </svg>
        ),
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        href: '/dashboard/zones',
    },
    {
        label: 'Zones à éviter',
        value: aEviter,
        sub: aEviter > 0
            ? `Score < 50 · ${aEviter > 1 ? 'à reconsidérer' : 'à reconsidérer'}`
            : 'Aucune zone problématique',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-100',
        href: '/dashboard/zones',
    },
    {
        label: 'À ré-analyser',
        value: aReanalyser,
        sub: aReanalyser > 0
            ? 'Données manquantes ou anciennes (+30j)'
            : 'Vos analyses sont à jour',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
        ),
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        href: '/dashboard/zones/list',
    },
    {
        label: 'Meilleur secteur',
        value: meilleurSecteur ? meilleurSecteur.nom : '—',
        sub: meilleurSecteur
            ? `Score moyen ${meilleurSecteur.moyenne}/100 · ${meilleurSecteur.nbZones} analyse${meilleurSecteur.nbZones > 1 ? 's' : ''}`
            : 'Pas encore de données',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
        ),
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        href: '/dashboard/comparaison',
        isText: true, // Pour styler différemment (le value est du texte, pas un nombre)
    },
]

export default function DashboardClient({
    userName,
    totalZones,
    zonesRecommandees,
    zonesAEviter,
    zonesAReanalyser,
    meilleurSecteur,
    recentZones,
    topZones,
    heatmap,
    heatmapPeak,
}: Props) {
    const cards = businessCards(totalZones, zonesRecommandees, zonesAEviter, zonesAReanalyser, meilleurSecteur)
    const firstName = userName.split(' ')[0]
    const heatmapMax = Math.max(1, ...heatmap.flat())

    return (
        <div className="space-y-8">

            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Bonjour <span className="font-semibold text-slate-700">{firstName}</span> — vue d&apos;ensemble de vos analyses géographiques.
                </p>
            </div>

            {/* ── Stat cards business ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(card => (
                    <div key={card.label}
                        className={`group relative overflow-hidden rounded-2xl border ${card.border} bg-white p-5 shadow-sm`}>
                        <div className={`absolute -right-3 -top-3 h-16 w-16 rounded-full ${card.bg} opacity-50`} />
                        <div className="relative flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{card.label}</p>
                                <p className={`mt-2 font-bold text-slate-900 ${
                                    card.isText
                                        ? 'text-xl truncate'
                                        : 'text-4xl tabular-nums'
                                }`}>
                                    {card.value}
                                </p>
                                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{card.sub}</p>
                            </div>
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                                {card.icon}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Top zones par score + Activité de la semaine ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Top zones par score */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Top zones par score</h2>
                            <p className="text-xs text-slate-400">
                                Classement de vos {totalZones} emplacement{totalZones > 1 ? 's' : ''} suivi{totalZones > 1 ? 's' : ''}
                            </p>
                        </div>
                        <Link href="/dashboard/comparaison"
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition">
                            Comparer →
                        </Link>
                    </div>

                    {topZones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center">
                            <p className="text-sm text-slate-400">Aucune analyse pour l&apos;instant</p>
                            <Link href="/dashboard/recherche-zone"
                                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">
                                Analyser une zone
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:grid grid-cols-9 gap-3 px-2 pb-3 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                <div className="col-span-4">Zone</div>
                                <div className="col-span-3">Secteur</div>
                                <div className="col-span-2">Score</div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {topZones.map(zone => {
                                    const badge = sectorBadge(zone.activite)
                                    return (
                                        <Link
                                            key={zone.id}
                                            href={`/dashboard/analyse/${zone.id}`}
                                            className="grid grid-cols-9 gap-3 items-center px-2 py-4 hover:bg-slate-50 transition rounded-lg"
                                        >
                                            <div className="col-span-12 md:col-span-4">
                                                <p className="text-sm font-semibold text-slate-900 line-clamp-2">{zone.nom}</p>
                                            </div>

                                            <div className="col-span-12 md:col-span-3">
                                                {zone.activite && (
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
                                                        {zone.activite}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="col-span-12 md:col-span-2 flex items-center gap-3">
                                                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${scoreBarColor(zone.score)}`}
                                                        style={{ width: `${Math.min(100, zone.score)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-slate-900 tabular-nums w-8 text-right">
                                                    {zone.score}
                                                </span>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Activité de la semaine */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-slate-900">Activité de la semaine</h2>
                        <p className="text-xs text-slate-400">Heures de pointe sur vos zones</p>
                    </div>

                    <div className="flex gap-1.5 text-[10px]">
                        <div className="flex flex-col gap-1.5 pt-5 pr-1 text-slate-400 font-medium">
                            {HOURS.map(h => (
                                <div key={h} className="h-7 flex items-center">{h}</div>
                            ))}
                        </div>

                        <div className="flex-1 grid grid-cols-7 gap-1.5">
                            {DAYS.map(day => (
                                <div key={day} className="text-center text-slate-400 font-medium h-5">{day}</div>
                            ))}

                            {heatmap.flatMap((row, plageIdx) =>
                                row.map((value, dayIdx) => {
                                    const intensity = value / heatmapMax
                                    let bg = 'bg-slate-100'
                                    if (intensity > 0.66) bg = 'bg-blue-600'
                                    else if (intensity > 0.33) bg = 'bg-blue-400'
                                    else if (intensity > 0) bg = 'bg-blue-200'
                                    return (
                                        <div
                                            key={`${plageIdx}-${dayIdx}`}
                                            className={`h-7 rounded-md ${bg} transition`}
                                            title={`${DAYS[dayIdx]} ${HOURS[plageIdx]} : ${value} analyse${value > 1 ? 's' : ''}`}
                                        />
                                    )
                                })
                            )}
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded bg-slate-100" />
                                <span className="text-slate-500">Faible</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded bg-blue-400" />
                                <span className="text-slate-500">Moyen</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded bg-blue-600" />
                                <span className="text-slate-500">Pic</span>
                            </span>
                        </div>
                        {heatmapPeak && (
                            <div className="text-right">
                                <p className="text-slate-400">Pic :</p>
                                <p className="font-semibold text-slate-700">
                                    {DAYS[heatmapPeak.day].toLowerCase()} {heatmapPeak.hour}h
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Zones récentes + Actions rapides ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Zones récentes</h2>
                            <p className="text-xs text-slate-400">Vos dernières analyses enregistrées</p>
                        </div>
                        <Link href="/dashboard/zones"
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition">
                            Voir tout →
                        </Link>
                    </div>

                    {recentZones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                className="mb-3 text-slate-300">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <p className="text-sm text-slate-400">Aucune zone enregistrée</p>
                            <Link href="/dashboard/recherche-zone"
                                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">
                                + Créer une zone
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentZones.map(zone => {
                                const badge = sectorBadge(zone.activite)
                                return (
                                    <Link
                                        key={zone.id}
                                        href={`/dashboard/analyse/${zone.id}`}
                                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:bg-blue-50 hover:border-blue-100"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${badge.bg} ${badge.text}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-slate-800 truncate">{zone.nom}</p>
                                                    {zone.activite && (
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.bg} ${badge.text}`}>
                                                            {zone.activite}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{zone.adresse}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0 ml-3">
                                            {zone.score !== null && (
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-slate-900 tabular-nums leading-tight">{zone.score}</p>
                                                    <p className="text-[10px] text-slate-400 leading-tight">/100</p>
                                                </div>
                                            )}
                                            <span className="text-xs text-slate-400 tabular-nums">
                                                {new Date(zone.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}