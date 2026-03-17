import { requireAdmin } from '@/lib/authutils'
import prisma from '@/lib/bd'
import UsersTable, { type AdminUserRow } from '../../../components/UsersTable'

export default async function AdminUsersPage() {
    await requireAdmin()

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            nom: true,
            telephone: true,
            role: true,
            firstLogin: true,
            createdAt: true,
            customRole: {          // ← ajouté
                select: {
                    id: true,
                    name: true,
                }
            }
        },
    })

    const rows: AdminUserRow[] = users.map((u) => ({
        ...u,
        createdAt:      u.createdAt.toISOString(),
        customRoleName: u.customRole?.name ?? null,  // ← ajouté
    }))

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-black mb-6">
                    Gestion des utilisateurs
                </h1>
                <UsersTable users={rows} />
            </div>
        </div>
    )
}