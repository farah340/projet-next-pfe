import { requireAdmin } from '@/lib/authutils'
import prisma from '@/lib/bd'
import EditUserForm, { type EditableUser } from './EditUserForm'

export default async function EditUserPage({ params }: { params: { id: string } }) {
    await requireAdmin()

    const { id } = params

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            nom: true,
            telephone: true,
            role: true,
            customRoleId: true,
            firstLogin: true,
        },
    })

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold mb-2">Utilisateur introuvable</h1>
                    <a className="text-blue-600 hover:underline" href="/admin/users">
                        ← Retour à la liste
                    </a>
                </div>
            </div>
        )
    }

    const editable: EditableUser = {
        ...user,
        role: user.customRoleId ? 'CUSTOM' : (user.role as 'ADMIN' | 'USER'),
    }

    return <EditUserForm user={editable} />
}
