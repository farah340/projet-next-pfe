import { requireAdmin } from '@/lib/authutils'
import prisma from '@/lib/bd'
import UsersTable, { type AdminUserRow } from '../../../components/UsersTable'
import Retour from '../../../components/Retour'

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
        },
    })

    const rows: AdminUserRow[] = users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
    }))

    return (
        <div className="min-h-screen bg-gray-100">
            <Retour />
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-black">Gestion des utilisateurs</h1>
                    </div>

                    <UsersTable users={rows} />
                </div>
            </div>
        </div>
    )
}
