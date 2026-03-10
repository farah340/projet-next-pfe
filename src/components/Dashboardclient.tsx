'use client'

import Link from 'next/link'

type RecentZone = {
    id: string
    nom: string
    adresse: string
    createdAt: string
}

interface Props {
    userName: string
    totalZones: number
    recentZones: RecentZone[]
}

const statCards = (totalZones: number) => [
    {
        label: 'Zones analysées',
        value: totalZones,
        sub: totalZones > 0 ? `${totalZones} zone${totalZones > 1 ? 's' : ''} enregistrée${totalZones > 1 ? 's' : ''}` : 'Aucune zone encore',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
            </svg>
        ),
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        href: '/dashboard/zones',
    },
    {
        label: 'Recherches actives',
        value: '—',
        sub: 'Bientôt disponible',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        border: 'border-violet-100',
        href: '/dashboard/map',
    },
    {
        label: 'Analyses',
        value: '—',
        sub: 'Bientôt disponible',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <line x1="2" y1="20" x2="22" y2="20" />
            </svg>
        ),
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        href: '/dashboard/analyses',
    },
    {
        label: 'Rapports',
        value: '—',
        sub: 'Bientôt disponible',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        href: '/dashboard/rapports',
    },
]

export default function DashboardClient({ userName, totalZones, recentZones }: Props) {
    const cards = statCards(totalZones)
    const firstName = userName.split(' ')[0]

    return (
        <div className="space-y-8">

            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Bonjour <span className="font-semibold text-slate-700">{firstName}</span> — vue d'ensemble de vos analyses géographiques.
                </p>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(card => (
                    <Link key={card.label} href={card.href}
                        className={`group relative overflow-hidden rounded-2xl border ${card.border} bg-white p-5 shadow-sm transition hover:shadow-md`}>
                        <div className={`absolute -right-3 -top-3 h-16 w-16 rounded-full ${card.bg} opacity-50`} />
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{card.label}</p>
                                <p className="mt-2 text-4xl font-bold tabular-nums text-slate-900">{card.value}</p>
                                <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
                            </div>
                            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                                {card.icon}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ── Deux colonnes ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Zones récentes */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Zones récentes</h2>
                            <p className="text-xs text-slate-400">Vos dernières zones enregistrées</p>
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
                            <Link href="/dashboard/map"
                                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">
                                + Créer une zone
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentZones.map(zone => (
                                <div key={zone.id}
                                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:bg-blue-50 hover:border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{zone.nom}</p>
                                            <p className="text-xs text-slate-400 line-clamp-1">{zone.adresse}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(zone.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions rapides */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-base font-bold text-slate-900">Actions rapides</h2>
                    <div className="space-y-2">
                        {[
                            { href: '/dashboard/map', label: 'Nouvelle zone', icon: '🗺️', color: 'bg-blue-600 text-white hover:bg-blue-700' },
                            { href: '/dashboard/zones', label: 'Mes zones', icon: '📍', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
                            { href: '/dashboard/analyses', label: 'Analyses', icon: '📊', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
                            { href: '/dashboard/rapports', label: 'Rapports', icon: '📄', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
                        ].map(action => (
                            <Link key={action.href} href={action.href}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${action.color}`}>
                                <span>{action.icon}</span>
                                {action.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}