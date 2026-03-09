import { requireAdmin } from '@/lib/authutils'
import prisma from '@/lib/bd'
import AdminDashboardClient from '@/components/AdminDashboardClient'

export default async function AdminPage() {
    const session = await requireAdmin()

    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 29)

    // ── Stats globales ──
    const [totalUsers, activeUsers, adminCount, newThisMonth] = await Promise.all([
        prisma.user.count(),
        prisma.user.count(),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(now.getFullYear(), now.getMonth(), 1),
                },
            },
        }),
    ])

    // ── Connexions par jour sur 30 jours ──
    const logins = await prisma.user.findMany({
        where: {
            lastLogin: {
                not: null,
                gte: thirtyDaysAgo,
            },
        },
        select: { lastLogin: true },
    })

    // Construire un tableau jour par jour
    const loginsByDay: Record<string, number> = {}
    for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo)
        d.setDate(thirtyDaysAgo.getDate() + i)
        const key = d.toISOString().slice(0, 10)
        loginsByDay[key] = 0
    }
    for (const u of logins) {
        if (!u.lastLogin) continue
        const key = u.lastLogin.toISOString().slice(0, 10)
        if (key in loginsByDay) loginsByDay[key]++
    }

    const activityData = Object.entries(loginsByDay).map(([date, count]) => ({
        date,
        count,
    }))

    return (
        <AdminDashboardClient
            email={session.user.email ?? ''}
            stats={{ totalUsers, activeUsers, adminCount, newThisMonth }}
            activityData={activityData}
        />
    )
}