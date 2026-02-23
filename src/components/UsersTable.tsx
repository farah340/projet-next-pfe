'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type AdminUserRow = {
    id: string
    email: string
    nom: string
    telephone: string | null
    role: 'ADMIN' | 'USER'
    firstLogin: boolean
    createdAt: string
}

export default function UsersTable({ users }: { users: AdminUserRow[] }) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [error, setError] = useState('')

    const handleDelete = async (id: string) => {
        const ok = window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')
        if (!ok) return

        setError('')
        setDeletingId(id)
        try {
            const res = await fetch('/api/admin/users/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                setError(data?.error || 'Erreur lors de la suppression')
                return
            }

            router.refresh()
        } catch {
            setError('Erreur de connexion au serveur')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {error && (
                <div className="bg-red-50 border-b border-red-200 text-red-800 px-4 py-3">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nom
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Téléphone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rôle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                1ère connexion
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {u.nom}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {u.telephone || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <span
                                        className={
                                            u.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-800 px-2 py-1 rounded font-semibold text-xs'
                                                : 'bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold text-xs'
                                        }
                                    >
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {u.firstLogin ? 'Oui' : 'Non'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/admin/users/edit/${u.id}`}
                                            className="px-3 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition text-sm"
                                        >
                                            Modifier
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(u.id)}
                                            disabled={deletingId === u.id}
                                            className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition text-sm disabled:opacity-50"
                                        >
                                            {deletingId === u.id ? 'Suppression...' : 'Supprimer'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {users.length === 0 && (
                            <tr>
                                <td className="px-6 py-6 text-sm text-gray-600" colSpan={6}>
                                    Aucun utilisateur.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
