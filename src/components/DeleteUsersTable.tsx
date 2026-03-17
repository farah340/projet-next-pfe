'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export type AdminUserRow = {
    id:             string
    nom:            string
    email:          string
    telephone:      string | null
    role:           string
    customRoleName: string | null
    firstLogin:     boolean
    createdAt:      string
}

function RoleBadge({ role, customRoleName }: { role: string; customRoleName: string | null }) {
    if (role === 'ADMIN') return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            Admin
        </span>
    )
    if (role === 'CUSTOM' && customRoleName) return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            {customRoleName}
        </span>
    )
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            Utilisateur
        </span>
    )
}

export default function DeleteUsersTable({
    users,
    permissions = [],
    isAdmin = false,
}: {
    users:       AdminUserRow[]
    permissions?: string[]
    isAdmin?:     boolean
}) {
    const router = useRouter()
    const [search, setSearch]   = useState('')
    const [deleting, setDeleting] = useState<string | null>(null)

    // ── Droits ────────────────────────────────────────────────
    const canEdit   = isAdmin || permissions.includes('modifier')
    const canDelete = isAdmin || permissions.includes('supprimer')

    const filtered = users.filter(u =>
        u.nom.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async (id: string, nom: string) => {
        if (!confirm(`Supprimer définitivement ${nom} ?`)) return
        setDeleting(id)
        try {
            await fetch(`/api/admin/users/delete?id=${id}`, { method: 'DELETE' })
            router.refresh()
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">

            {/* ── Barre de recherche ── */}
            <div className="p-4 border-b border-gray-100">
                <div className="relative max-w-sm">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Rechercher par nom..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    />
                    {search && (
                        <button onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                    {filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* ── Table ── */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {['Nom', 'Email', 'Téléphone', 'Rôle', '1ère connexion', 'Actions'].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        ) : filtered.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{user.nom}</td>
                                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 text-gray-500">{user.telephone ?? '—'}</td>
                                <td className="px-6 py-4">
                                    <RoleBadge role={user.role} customRoleName={user.customRoleName} />
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {user.firstLogin ? 'Oui' : 'Non'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">

                                        {/* ── Modifier — inactif si pas la permission ── */}
                                        <button
                                            onClick={() => canEdit
                                                ? router.push(`/admin/users/edit/${user.id}`)
                                                : undefined
                                            }
                                            disabled={!canEdit}
                                            title={!canEdit ? "Vous n'avez pas la permission de modifier" : undefined}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition
                                                ${canEdit
                                                    ? 'bg-amber-500 text-white hover:bg-amber-600 cursor-pointer'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                }
                                            `}
                                        >
                                            Modifier
                                        </button>

                                        {/* ── Supprimer — actif car on est sur la page delete ── */}
                                        <button
                                            onClick={() => handleDelete(user.id, user.nom)}
                                            disabled={!canDelete || deleting === user.id}
                                            title={!canDelete ? "Vous n'avez pas la permission de supprimer" : undefined}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition
                                                ${canDelete
                                                    ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                }
                                                ${deleting === user.id ? 'opacity-50' : ''}
                                            `}
                                        >
                                            {deleting === user.id ? '...' : 'Supprimer'}
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}