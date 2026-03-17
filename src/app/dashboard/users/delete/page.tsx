import { requirePermission, getSession } from '@/lib/authutils'
import prisma from '@/lib/bd'
import DeleteUsersTable, { type AdminUserRow } from '@/components/DeleteUsersTable'

export default async function DashboardUsersDeletePage() {
    const session = await requirePermission('supprimer')

    const role        = session.user?.role
    const permissions = (session.user?.permissions ?? []) as string[]
    const isAdmin     = role === 'ADMIN'

    let users

    if (isAdmin) {
        users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, email: true, nom: true,
                telephone: true, role: true, firstLogin: true,
                createdAt: true,
                customRole: { select: { id: true, name: true } }
            },
        })
    } else {
        const me = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { customRoleId: true }
        })

        users = await prisma.user.findMany({
            where: { customRoleId: me?.customRoleId ?? '__none__' },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, email: true, nom: true,
                telephone: true, role: true, firstLogin: true,
                createdAt: true,
                customRole: { select: { id: true, name: true } }
            },
        })
    }

    const rows: AdminUserRow[] = users.map((u) => ({
        id:             u.id,
        email:          u.email,
        nom:            u.nom,
        telephone:      u.telephone,
        role:           u.role,
        customRoleName: u.customRole?.name ?? null,
        firstLogin:     u.firstLogin,
        createdAt:      u.createdAt.toISOString(),
    }))

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-xl font-bold text-slate-900 mb-6">
                    Gestion des utilisateurs
                </h1>
                <DeleteUsersTable
                    users={rows}
                    permissions={permissions}
                    isAdmin={isAdmin}
                />
            </div>
        </div>
    )
}