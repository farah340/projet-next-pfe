'use client'

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

type Stats = {
    totalUsers: number
    activeUsers: number
    adminCount: number
    newThisMonth: number
}

type ActivityPoint = { date: string; count: number }

interface Props {
    email: string
    stats: Stats
    activityData: ActivityPoint[]
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                <p className="text-xs font-medium text-slate-500">{formatDate(label)}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                    {payload[0].value}
                    <span className="ml-1 text-xs font-normal text-slate-400">connexion{payload[0].value > 1 ? 's' : ''}</span>
                </p>
            </div>
        )
    }
    return null
}

const statCards = (stats: Stats) => [
    {
        label: 'Utilisateurs total',
        value: stats.totalUsers,
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        color: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-100',
    },
    {
        label: 'Utilisateurs actifs',
        value: stats.activeUsers,
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
        color: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-100',
    },
    {
        label: 'Administrateurs',
        value: stats.adminCount,
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        color: 'from-violet-500 to-violet-600',
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        border: 'border-violet-100',
    },
    {
        label: 'Nouveaux ce mois',
        value: stats.newThisMonth,
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        ),
        color: 'from-amber-500 to-amber-600',
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-100',
    },
]

export default function AdminDashboardClient({ email, stats, activityData }: Props) {
    const cards = statCards(stats)
    const activeRate = stats.totalUsers > 0
        ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
        : 0

    // Tick labels : afficher seulement toutes les 5 entrées pour éviter le surencombrement
    const tickDates = activityData
        .filter((_, i) => i % 5 === 0 || i === activityData.length - 1)
        .map(d => d.date)

    return (
        <div className="space-y-8">

            {/* ── Header ── */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Dashboard Administrateur
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Connecté en tant que <span className="font-semibold text-slate-700">{email}</span>
                    </p>
                </div>
                <span className="inline-flex items-center self-start rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-700 sm:self-auto">
                    ADMIN
                </span>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className={`relative overflow-hidden rounded-2xl border ${card.border} bg-white p-5 shadow-sm transition hover:shadow-md`}
                    >
                        {/* Cercle décoratif en fond */}
                        <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${card.bg} opacity-60`} />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    {card.label}
                                </p>
                                <p className="mt-2 text-4xl font-bold tabular-nums text-slate-900">
                                    {card.value.toLocaleString('fr-FR')}
                                </p>
                            </div>
                            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} ${card.text}`}>
                                {card.icon}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Taux d'activité ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Taux d'utilisateurs actifs</p>
                    <span className="text-sm font-bold text-emerald-600">{activeRate}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                        style={{ width: `${activeRate}%` }}
                    />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                    {stats.activeUsers} actifs sur {stats.totalUsers} utilisateurs
                </p>
            </div>

            {/* ── Graphique connexions ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Activité des connexions</h2>
                        <p className="text-xs text-slate-400">Connexions par jour — 30 derniers jours</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <span className="text-xs text-slate-500">Connexions / jour</span>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={activityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorConnexions" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            fill="url(#colorConnexions)"
                            dot={false}
                            activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

        </div>
    )
}