'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ── Types ──────────────────────────────────────────────────────
type Stats = {
    totalUsers: number
    activeUsers: number
    adminCount: number
    newThisMonth: number
    firstLoginPending: number
    totalZones: number
    zonesLastWeek: number
    zonesPreviousWeek: number
    totalAnalyses: number
    analysesLastWeek: number
    analysesPreviousWeek: number
    customRoleCount: number
    usersWithCustomRole: number
    userCount: number
}
type Alerts = {
    firstLoginPending: number
    inactive30d: number
    emptyCustomRoles: number
}
type ActivityPoint = { date: string; connexions: number; zones: number; analyses: number }
type TopUser = { id: string; nom: string; email: string; zonesCount: number }
type EventItem = {
    type: 'user' | 'zone' | 'analyse'
    title: string
    subtitle: string
    date: string
}
type TopActivity = { name: string; count: number }

interface Props {
    email: string
    stats: Stats
    alerts: Alerts
    activityData: ActivityPoint[]
    topUsers: TopUser[]
    events: EventItem[]
    topActivities: TopActivity[]
}

// ── Helpers ────────────────────────────────────────────────────
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function formatRelative(iso: string) {
    const now = Date.now()
    const then = new Date(iso).getTime()
    const diff = Math.max(0, now - then) / 1000
    if (diff < 60) return 'à l\'instant'
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function initials(name: string) {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

function pctDelta(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
}

// ── Tooltip du graphique ───────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
            <p className="mb-1 text-xs font-medium text-slate-500">{formatDate(label)}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    <span className="font-semibold text-slate-700">{p.value}</span>
                    <span className="text-slate-400">{p.name}</span>
                </p>
            ))}
        </div>
    )
}

// ── Composant principal ────────────────────────────────────────
export default function AdminDashboardClient({
    email, stats, alerts, activityData, topUsers, events, topActivities,
}: Props) {

    const [series, setSeries] = useState<{ connexions: boolean; zones: boolean; analyses: boolean }>({
        connexions: true, zones: true, analyses: true,
    })

    const activeRate = stats.totalUsers > 0
        ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
        : 0

    const zonesDelta = pctDelta(stats.zonesLastWeek, stats.zonesPreviousWeek)
    const analysesDelta = pctDelta(stats.analysesLastWeek, stats.analysesPreviousWeek)

    const tickDates = useMemo(
        () => activityData.filter((_, i) => i % 5 === 0 || i === activityData.length - 1).map(d => d.date),
        [activityData]
    )

    // ── Stat cards ───────────────────────────────────────────
    const cards = [
        {
            label: 'Utilisateurs total',
            value: stats.totalUsers,
            sub: `+${stats.newThisMonth} ce mois`,
            subColor: 'text-emerald-600',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'border-blue-100',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        {
            label: 'Actifs sur 7j',
            value: stats.activeUsers,
            sub: `${activeRate}% du total`,
            subColor: 'text-emerald-600',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            border: 'border-emerald-100',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
            ),
        },
        {
            label: 'Zones créées',
            value: stats.totalZones,
            sub: `${zonesDelta >= 0 ? '↑' : '↓'} ${Math.abs(zonesDelta)}% vs sem. dernière`,
            subColor: zonesDelta >= 0 ? 'text-emerald-600' : 'text-red-600',
            bg: 'bg-violet-50',
            text: 'text-violet-600',
            border: 'border-violet-100',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            ),
        },
        {
            label: 'Analyses lancées',
            value: stats.totalAnalyses,
            sub: `${analysesDelta >= 0 ? '↑' : '↓'} ${Math.abs(analysesDelta)}% vs sem. dernière`,
            subColor: analysesDelta >= 0 ? 'text-emerald-600' : 'text-red-600',
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-100',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                    <line x1="2" y1="20" x2="22" y2="20" />
                </svg>
            ),
        },
        {
            label: 'À 1ʳᵉ connexion',
            value: stats.firstLoginPending,
            sub: 'mots de passe non définis',
            subColor: 'text-slate-400',
            bg: 'bg-orange-50',
            text: 'text-orange-600',
            border: 'border-orange-100',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            ),
        },
        {
            label: 'Rôles personnalisés',
            value: stats.customRoleCount,
            sub: `${stats.usersWithCustomRole} utilisateurs assignés`,
            subColor: 'text-slate-400',
            bg: 'bg-pink-50',
            text: 'text-pink-600',
            border: 'border-pink-100',
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
        },
    ]

    // ── Donut rôles ──────────────────────────────────────────
    const totalForDonut = Math.max(1, stats.userCount + stats.usersWithCustomRole + stats.adminCount)
    const userPct = (stats.userCount / totalForDonut) * 100
    const customPct = (stats.usersWithCustomRole / totalForDonut) * 100
    const adminPct = (stats.adminCount / totalForDonut) * 100
    const CIRC = 2 * Math.PI * 45 // ≈ 282.74

    // ── Event icon helper ────────────────────────────────────
    const eventIcon = (type: EventItem['type']) => {
        const common = "w-4 h-4"
        if (type === 'user') return (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
            </div>
        )
        if (type === 'zone') return (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            </div>
        )
        return (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
            </div>
        )
    }

    const maxTopActivity = Math.max(1, ...topActivities.map(a => a.count))
    const activityColors = ['bg-rose-500', 'bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500']

    return (
        <div className="space-y-6">

            {/* ─── Header ─────────────────────────────────── */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Administrateur</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Connecté en tant que <span className="font-semibold text-slate-700">{email}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/users/create"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Nouvel utilisateur
                    </Link>
                    <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-700">
                        ADMIN
                    </span>
                </div>
            </div>

            {/* ─── KPI cards (6) ────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {cards.map(card => (
                    <div
                        key={card.label}
                        className={`relative overflow-hidden rounded-2xl border ${card.border} bg-white p-4 shadow-sm transition hover:shadow-md`}
                    >
                        <div className={`absolute -right-3 -top-3 h-14 w-14 rounded-full ${card.bg} opacity-60`} />
                        <div className="relative">
                            <div className="flex items-start justify-between">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                    {card.label}
                                </p>
                                <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.bg} ${card.text}`}>
                                    {card.icon}
                                </span>
                            </div>
                            <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                                {card.value.toLocaleString('fr-FR')}
                            </p>
                            <p className={`mt-1 text-[11px] font-medium ${card.subColor}`}>{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── Ligne 2 : Graphique + Donut rôles ─────────── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                {/* Graphique multi-séries */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Activité de la plateforme</h2>
                            <p className="text-xs text-slate-400">30 derniers jours</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {([
                                { key: 'connexions', label: 'Connexions', color: 'bg-blue-500', border: 'border-blue-200' },
                                { key: 'zones', label: 'Zones', color: 'bg-emerald-500', border: 'border-emerald-200' },
                                { key: 'analyses', label: 'Analyses', color: 'bg-amber-500', border: 'border-amber-200' },
                            ] as const).map(s => (
                                <button
                                    key={s.key}
                                    type="button"
                                    onClick={() => setSeries(prev => ({ ...prev, [s.key]: !prev[s.key] }))}
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                                        series[s.key]
                                            ? `${s.border} bg-white text-slate-700`
                                            : 'border-slate-200 bg-slate-50 text-slate-400 line-through'
                                    }`}
                                >
                                    <span className={`h-2 w-2 rounded-full ${s.color}`} />
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={activityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gConnexions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gZones" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gAnalyses" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                ticks={tickDates}
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                            {series.connexions && (
                                <Area type="monotone" dataKey="connexions" name="connexions"
                                    stroke="#3b82f6" strokeWidth={2} fill="url(#gConnexions)"
                                    dot={false} activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
                            )}
                            {series.zones && (
                                <Area type="monotone" dataKey="zones" name="zones"
                                    stroke="#10b981" strokeWidth={2} fill="url(#gZones)"
                                    dot={false} activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
                            )}
                            {series.analyses && (
                                <Area type="monotone" dataKey="analyses" name="analyses"
                                    stroke="#f59e0b" strokeWidth={2} fill="url(#gAnalyses)"
                                    dot={false} activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Donut rôles */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-bold text-slate-900">Répartition des rôles</h2>
                    <p className="mb-4 text-xs text-slate-400">{stats.totalUsers} utilisateurs au total</p>

                    <div className="flex flex-col items-center">
                        <svg viewBox="0 0 120 120" className="h-32 w-32">
                            <circle cx="60" cy="60" r="45" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                            <circle
                                cx="60" cy="60" r="45" fill="none"
                                stroke="#3b82f6" strokeWidth="14"
                                strokeDasharray={`${(userPct / 100) * CIRC} ${CIRC}`}
                                transform="rotate(-90 60 60)"
                                strokeLinecap="butt"
                            />
                            <circle
                                cx="60" cy="60" r="45" fill="none"
                                stroke="#8b5cf6" strokeWidth="14"
                                strokeDasharray={`${(customPct / 100) * CIRC} ${CIRC}`}
                                strokeDashoffset={`-${(userPct / 100) * CIRC}`}
                                transform="rotate(-90 60 60)"
                                strokeLinecap="butt"
                            />
                            <circle
                                cx="60" cy="60" r="45" fill="none"
                                stroke="#64748b" strokeWidth="14"
                                strokeDasharray={`${(adminPct / 100) * CIRC} ${CIRC}`}
                                strokeDashoffset={`-${((userPct + customPct) / 100) * CIRC}`}
                                transform="rotate(-90 60 60)"
                                strokeLinecap="butt"
                            />
                            <text x="60" y="58" textAnchor="middle" className="fill-slate-900"
                                fontSize="20" fontWeight="700">{stats.totalUsers}</text>
                            <text x="60" y="72" textAnchor="middle" className="fill-slate-400" fontSize="9">utilisateurs</text>
                        </svg>

                        <div className="mt-4 w-full space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                                    <span className="font-medium text-slate-700">USER</span>
                                </span>
                                <span className="tabular-nums text-slate-500">{stats.userCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
                                    <span className="font-medium text-slate-700">CUSTOM</span>
                                </span>
                                <span className="tabular-nums text-slate-500">{stats.usersWithCustomRole}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-slate-500" />
                                    <span className="font-medium text-slate-700">ADMIN</span>
                                </span>
                                <span className="tabular-nums text-slate-500">{stats.adminCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Ligne 3 : Top users + Feed événements ────── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                {/* Top utilisateurs */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Top utilisateurs</h2>
                            <p className="text-xs text-slate-400">Par nombre de zones créées</p>
                        </div>
                        <Link href="/admin/users" className="text-xs font-medium text-blue-600 hover:text-blue-800">
                            Voir tout →
                        </Link>
                    </div>

                    {topUsers.length === 0 ? (
                        <div className="py-8 text-center text-sm text-slate-400">
                            Aucun utilisateur n'a encore créé de zone
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {topUsers.map((u, idx) => (
                                <div key={u.id}
                                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-600">
                                        {idx + 1}
                                    </span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                                        {initials(u.nom)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-900">{u.nom}</p>
                                        <p className="truncate text-xs text-slate-400">{u.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold tabular-nums text-slate-900">{u.zonesCount}</p>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400">zones</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Feed événements */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Activité récente</h2>
                            <p className="text-xs text-slate-400">Dernières actions sur la plateforme</p>
                        </div>
                    </div>

                    {events.length === 0 ? (
                        <div className="py-8 text-center text-sm text-slate-400">
                            Aucune activité récente
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {events.map((e, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    {eventIcon(e.type)}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-900">{e.title}</p>
                                        <p className="truncate text-xs text-slate-500">{e.subtitle}</p>
                                    </div>
                                    <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                        {formatRelative(e.date)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Ligne 4 : Alertes + Top activités ─────────── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                {/* Alertes opérationnelles */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <h2 className="text-base font-bold text-slate-900">Alertes opérationnelles</h2>
                    </div>

                    <div className="space-y-2">
                        {alerts.firstLoginPending > 0 && (
                            <Link href="/admin/users"
                                className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 transition hover:bg-amber-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-amber-900">
                                            {alerts.firstLoginPending} utilisateur{alerts.firstLoginPending > 1 ? 's' : ''} sans mot de passe défini
                                        </p>
                                        <p className="text-xs text-amber-700">Première connexion en attente</p>
                                    </div>
                                </div>
                                <span className="text-amber-700">→</span>
                            </Link>
                        )}

                        {alerts.inactive30d > 0 && (
                            <Link href="/admin/users"
                                className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 transition hover:bg-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900">
                                            {alerts.inactive30d} compte{alerts.inactive30d > 1 ? 's' : ''} inactif{alerts.inactive30d > 1 ? 's' : ''} depuis +30j
                                        </p>
                                        <p className="text-xs text-blue-700">À relancer ou désactiver</p>
                                    </div>
                                </div>
                                <span className="text-blue-700">→</span>
                            </Link>
                        )}

                        {alerts.emptyCustomRoles > 0 && (
                            <Link href="/admin/roles"
                                className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 transition hover:bg-red-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            <line x1="9" y1="9" x2="15" y2="15" />
                                            <line x1="15" y1="9" x2="9" y2="15" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-red-900">
                                            {alerts.emptyCustomRoles} rôle{alerts.emptyCustomRoles > 1 ? 's' : ''} sans utilisateur
                                        </p>
                                        <p className="text-xs text-red-700">À supprimer ou assigner</p>
                                    </div>
                                </div>
                                <span className="text-red-700">→</span>
                            </Link>
                        )}

                        {alerts.firstLoginPending === 0 && alerts.inactive30d === 0 && alerts.emptyCustomRoles === 0 && (
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-900">Tout est en ordre</p>
                                    <p className="text-xs text-emerald-700">Aucune action requise</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top activités analysées */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-slate-900">Activités les plus analysées</h2>
                        <p className="text-xs text-slate-400">Top 5 des secteurs étudiés par vos utilisateurs</p>
                    </div>

                    {topActivities.length === 0 ? (
                        <div className="py-8 text-center text-sm text-slate-400">
                            Aucune analyse encore réalisée
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topActivities.map((a, idx) => {
                                const pct = (a.count / maxTopActivity) * 100
                                return (
                                    <div key={a.name}>
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <span className="text-sm font-medium capitalize text-slate-700">
                                                {a.name}
                                            </span>
                                            <span className="text-xs font-semibold tabular-nums text-slate-500">
                                                {a.count.toLocaleString('fr-FR')}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full ${activityColors[idx % activityColors.length]} transition-all duration-700`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}