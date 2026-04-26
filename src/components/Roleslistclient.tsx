'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Permission = { id: string; resource: string; action: string }
type Role = {
    id: string
    name: string
    description: string | null
    permissions: Permission[]
    _count: { users: number }
    createdAt: string
}

const ACTION_COLORS: Record<string, string> = {
    voir:      'bg-blue-50 text-blue-700 border-blue-200',
    créer:     'bg-emerald-50 text-emerald-700 border-emerald-200',
    modifier:  'bg-amber-50 text-amber-700 border-amber-200',
    supprimer: 'bg-red-50 text-red-700 border-red-200',
}

export default function RolesListClient({ roles: initial }: { roles: Role[] }) {
    const router = useRouter()
    const [roles, setRoles] = useState(initial)
    const [deleting, setDeleting] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce rôle ? Les utilisateurs associés perdront ce rôle.')) return
        setDeleting(id)
        try {
            const res = await fetch(`/api/admin/roles?id=${id}`, { method: 'DELETE' })
            if (res.ok) setRoles(prev => prev.filter(r => r.id !== id))
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rôles & Permissions</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {roles.length} rôle{roles.length > 1 ? 's' : ''} personnalisé{roles.length > 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => router.push('/admin/roles/create')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5a51e0]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nouveau rôle
                </button>
            </div>

            {/* ── ADMIN badge fixe ── */}
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="text-violet-700">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </span>
                    <div>
                        <p className="text-sm font-bold text-violet-900">ADMIN</p>
                        <p className="text-xs text-violet-600">Accès total — toutes les permissions sur toutes les ressources</p>
                    </div>
                </div>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                    Système
                </span>
            </div>

            {/* ── Liste des rôles ── */}
            {roles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <p className="text-sm text-slate-400">Aucun rôle créé pour l'instant.</p>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/roles/create')}
                        className="mt-4 text-sm font-medium text-slate-900 underline underline-offset-2 hover:text-slate-600"
                    >
                        Créer le premier rôle →
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {roles.map(role => (
                        <div key={role.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-base font-bold text-slate-900">{role.name}</h3>
                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-500">
                                            {role._count.users} utilisateur{role._count.users > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    {role.description && (
                                        <p className="mt-1 text-sm text-slate-500">{role.description}</p>
                                    )}

                                    {/* Permissions tags */}
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {role.permissions.length === 0 ? (
                                            <span className="text-xs text-slate-400 italic">Aucune permission</span>
                                        ) : (
                                            role.permissions.map(p => (
                                                <span key={p.id}
                                                    className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${ACTION_COLORS[p.action] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                    {p.resource} · {p.action}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/admin/roles/${role.id}/edit`)}
                                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                                        title="Modifier"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(role.id)}
                                        disabled={deleting === role.id}
                                        className="rounded-lg border border-red-200 bg-white p-2 text-red-400 shadow-sm transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                                        title="Supprimer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                            <path d="M10 11v6M14 11v6" />
                                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}