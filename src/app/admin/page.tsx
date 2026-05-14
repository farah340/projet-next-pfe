import { requireAdmin } from '@/lib/authutils'
import prisma from '@/lib/bd'
import AdminDashboardClient from '@/components/AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const session = await requireAdmin()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7)
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 29)
    const previousWeekStart = new Date(now); previousWeekStart.setDate(now.getDate() - 14)
    const previousWeekEnd = new Date(now); previousWeekEnd.setDate(now.getDate() - 7)

    // ──────────────────────────────────────────────────────────────
    // 1. KPI principaux
    // ──────────────────────────────────────────────────────────────
    const [
        totalUsers,
        activeUsers,                 // ✅ vraiment actifs (connectés < 7j)
        adminCount,
        newThisMonth,
        firstLoginPending,           // alertes : utilisateurs n'ayant jamais changé leur mdp
        totalZones,
        zonesLastWeek,
        zonesPreviousWeek,
        totalAnalyses,
        analysesLastWeek,
        analysesPreviousWeek,
        customRoleCount,
        usersWithCustomRole,
        inactive30d,                 // alertes : comptes inactifs +30j
        emptyCustomRoles,            // alertes : rôles sans utilisateurs
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { lastLogin: { gte: sevenDaysAgo } } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.user.count({ where: { firstLogin: true } }),
        prisma.zone.count(),
        prisma.zone.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.zone.count({ where: { createdAt: { gte: previousWeekStart, lt: previousWeekEnd } } }),
        prisma.analyse.count(),
        prisma.analyse.count({ where: { dateAnalyse: { gte: sevenDaysAgo } } }),
        prisma.analyse.count({ where: { dateAnalyse: { gte: previousWeekStart, lt: previousWeekEnd } } }),
        prisma.customRole.count(),
        prisma.user.count({ where: { role: 'CUSTOM' } }),
        prisma.user.count({
            where: {
                OR: [
                    { lastLogin: { lt: thirtyDaysAgo } },
                    { lastLogin: null },
                ],
                firstLogin: false,
            },
        }),
        prisma.customRole.count({ where: { users: { none: {} } } }),
    ])

    // ──────────────────────────────────────────────────────────────
    // 2. Répartition par rôle
    // ──────────────────────────────────────────────────────────────
    const userCount = totalUsers - adminCount - usersWithCustomRole

    // ──────────────────────────────────────────────────────────────
    // 3. Série temporelle sur 30 jours (connexions / zones / analyses)
    // ──────────────────────────────────────────────────────────────
    const [logins30d, zones30d, analyses30d] = await Promise.all([
        prisma.user.findMany({
            where: { lastLogin: { not: null, gte: thirtyDaysAgo } },
            select: { lastLogin: true },
        }),
        prisma.zone.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
        }),
        prisma.analyse.findMany({
            where: { dateAnalyse: { gte: thirtyDaysAgo } },
            select: { dateAnalyse: true },
        }),
    ])

    // Construire un map jour par jour
    const byDay: Record<string, { connexions: number; zones: number; analyses: number }> = {}
    for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo)
        d.setDate(thirtyDaysAgo.getDate() + i)
        const key = d.toISOString().slice(0, 10)
        byDay[key] = { connexions: 0, zones: 0, analyses: 0 }
    }
    for (const u of logins30d) {
        const k = u.lastLogin?.toISOString().slice(0, 10)
        if (k && k in byDay) byDay[k].connexions++
    }
    for (const z of zones30d) {
        const k = z.createdAt.toISOString().slice(0, 10)
        if (k in byDay) byDay[k].zones++
    }
    for (const a of analyses30d) {
        const k = a.dateAnalyse.toISOString().slice(0, 10)
        if (k in byDay) byDay[k].analyses++
    }
    const activityData = Object.entries(byDay).map(([date, v]) => ({ date, ...v }))

    // ──────────────────────────────────────────────────────────────
    // 4. Top utilisateurs (par nombre de zones)
    // ──────────────────────────────────────────────────────────────
    const topUsersRaw = await prisma.user.findMany({
        where: { role: { not: 'ADMIN' } },
        select: {
            id: true,
            nom: true,
            email: true,
            _count: { select: { zones: true } },
        },
        orderBy: { zones: { _count: 'desc' } },
        take: 5,
    })
    const topUsers = topUsersRaw
        .filter(u => u._count.zones > 0)
        .map(u => ({
            id: u.id,
            nom: u.nom,
            email: u.email,
            zonesCount: u._count.zones,
        }))

    // ──────────────────────────────────────────────────────────────
    // 5. Feed d'activité récente (création users + zones + analyses)
    // ──────────────────────────────────────────────────────────────
    const [recentUsers, recentZones, recentAnalyses] = await Promise.all([
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 6,
            select: { id: true, nom: true, email: true, createdAt: true },
        }),
        prisma.zone.findMany({
            orderBy: { createdAt: 'desc' },
            take: 6,
            select: {
                id: true, nom: true, createdAt: true,
                user: { select: { nom: true } },
            },
        }),
        prisma.analyse.findMany({
            orderBy: { dateAnalyse: 'desc' },
            take: 6,
            select: {
                id: true, nomZone: true, activite: true, dateAnalyse: true,
                zone: { select: { user: { select: { nom: true } } } },
            },
        }),
    ])

    type Event = {
        type: 'user' | 'zone' | 'analyse'
        title: string
        subtitle: string
        date: string
    }
    const events: Event[] = [
        ...recentUsers.map(u => ({
            type: 'user' as const,
            title: `Nouveau compte créé`,
            subtitle: `${u.nom} (${u.email})`,
            date: u.createdAt.toISOString(),
        })),
        ...recentZones.map(z => ({
            type: 'zone' as const,
            title: `Zone créée : ${z.nom}`,
            subtitle: `par ${z.user?.nom ?? 'inconnu'}`,
            date: z.createdAt.toISOString(),
        })),
        ...recentAnalyses.map(a => ({
            type: 'analyse' as const,
            title: `Analyse lancée : ${a.nomZone ?? 'zone'}`,
            subtitle: `${a.activite ?? 'activité'} • par ${a.zone?.user?.nom ?? 'inconnu'}`,
            date: a.dateAnalyse.toISOString(),
        })),
    ]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8)

    // ──────────────────────────────────────────────────────────────
    // 6. Top activités analysées
    // ──────────────────────────────────────────────────────────────
    const activityGroups = await prisma.analyse.groupBy({
        by: ['activite'],
        _count: { activite: true },
        where: { activite: { not: null } },
        orderBy: { _count: { activite: 'desc' } },
        take: 5,
    })
    const topActivities = activityGroups
        .filter(g => g.activite)
        .map(g => ({
            name: g.activite as string,
            count: g._count.activite,
        }))

    return (
        <AdminDashboardClient
            email={session.user.email ?? ''}
            stats={{
                totalUsers,
                activeUsers,
                adminCount,
                newThisMonth,
                firstLoginPending,
                totalZones,
                zonesLastWeek,
                zonesPreviousWeek,
                totalAnalyses,
                analysesLastWeek,
                analysesPreviousWeek,
                customRoleCount,
                usersWithCustomRole,
                userCount,
            }}
            alerts={{
                firstLoginPending,
                inactive30d,
                emptyCustomRoles,
            }}
            activityData={activityData}
            topUsers={topUsers}
            events={events}
            topActivities={topActivities}
        />
    )
}