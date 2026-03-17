'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export type EditableUser = {
    id: string; email: string; nom: string
    telephone: string | null
    role: 'ADMIN' | 'USER' | 'CUSTOM'
    customRoleId: string | null
    firstLogin: boolean
}

type CustomRole = { id: string; name: string }

export default function EditUserForm({ user }: { user: EditableUser }) {
    const router = useRouter()
    const [email, setEmail]         = useState(user.email)
    const [nom, setNom]             = useState(user.nom)
    const [telephone, setTelephone] = useState(user.telephone ?? '')
    // Si CUSTOM → on met le customRoleId, sinon le role système
    const [role, setRole]           = useState(
        user.role === 'CUSTOM' && user.customRoleId
            ? user.customRoleId
            : user.role
    )
    const [firstLogin, setFirstLogin] = useState(user.firstLogin)
    const [customRoles, setCustomRoles] = useState<CustomRole[]>([])
    const [loading, setLoading]     = useState(false)
    const [error, setError]         = useState('')
    const [success, setSuccess]     = useState('')

    // ── Charger les rôles custom ──────────────────────────────
    useEffect(() => {
        fetch('/api/admin/roles')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setCustomRoles(data) })
            .catch(() => {})
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(''); setSuccess(''); setLoading(true)
        try {
            const res  = await fetch('/api/admin/users/edit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, email, nom, telephone, role, firstLogin }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) { setError(data?.error || 'Erreur lors de la modification'); return }
            setSuccess('Modifications enregistrées')
            router.refresh()
            setTimeout(() => { router.push('/admin/users'); router.refresh() }, 800)
        } catch { setError('Erreur de connexion au serveur') }
        finally  { setLoading(false) }
    }

    const inputCls = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
    const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-2xl mx-auto">

                {/* ── Header ── */}
                <div className="flex items-center gap-4 mb-8">
                    <button type="button" onClick={() => router.push('/admin/users')}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">Modifier un utilisateur</h1>
                        <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                    </div>
                </div>

                {/* ── Formulaire ── */}
                <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                required className={inputCls} />
                        </div>

                        <div>
                            <label className={labelCls}>Nom complet <span className="text-red-500">*</span></label>
                            <input type="text" value={nom} onChange={e => setNom(e.target.value)}
                                required className={inputCls} />
                        </div>

                        <div>
                            <label className={labelCls}>Téléphone</label>
                            <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
                                className={inputCls} />
                        </div>

                        {/* ── Sélecteur de rôle avec custom roles ── */}
                        <div>
                            <label className={labelCls}>Rôle <span className="text-red-500">*</span></label>
                            <select value={role} onChange={e => setRole(e.target.value)} className={inputCls}>
                                <optgroup label="Rôles système">
                                    <option value="USER">Utilisateur</option>
                                    <option value="ADMIN">Administrateur</option>
                                </optgroup>
                                {customRoles.length > 0 && (
                                    <optgroup label="Rôles personnalisés">
                                        {customRoles.map(cr => (
                                            <option key={cr.id} value={cr.id}>{cr.name}</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>

                        <div className="flex items-center gap-3 py-1">
                            <input id="firstLogin" type="checkbox" checked={firstLogin}
                                onChange={e => setFirstLogin(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="firstLogin" className="text-sm text-slate-600">
                                Forcer le changement de mot de passe à la prochaine connexion
                            </label>
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
                                <svg className="w-4 h-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {success}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => router.push('/admin/users')}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition">
                                Annuler
                            </button>
                            <button type="submit" disabled={loading}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}