// app/dashboard/page.tsx
import { requireAuth } from '@/lib/authutils'
import { redirect } from 'next/navigation'
import prisma from '@/lib/bd'
import DashboardClient from '@/components/Dashboardclient'

export default async function DashboardPage() {
    const session = await requireAuth()
    if (session.user.role === 'ADMIN') redirect('/admin')
    if (session.user.firstLogin) redirect('/change-password')

    // Stats de l'utilisateur
    const [totalZones, recentZones] = await Promise.all([
        prisma.zone.count({ where: { userId: session.user.id } }),
        prisma.zone.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 4,
            select: { id: true, nom: true, adresse: true, createdAt: true },
        }),
    ])

    return (
        <DashboardClient
            userName={session.user.name ?? ''}
            totalZones={totalZones}
            recentZones={recentZones.map(z => ({
                ...z,
                createdAt: z.createdAt.toISOString(),
            }))}
        />
    )
}