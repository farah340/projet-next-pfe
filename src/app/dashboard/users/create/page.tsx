'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type CustomRole = { id: string; name: string }

export default function CreateUserPage() {
    const [email, setEmail]         = useState('')
    const [nom, setNom]             = useState('')
    const [telephone, setTelephone] = useState('')
    const [password, setPassword]   = useState('')
    const [role, setRole]           = useState('USER')
    const [customRoles, setCustomRoles] = useState<CustomRole[]>([])
    const [error, setError]         = useState('')
    const [success, setSuccess]     = useState('')
    const [loading, setLoading]     = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetch('/api/admin/roles')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setCustomRoles(data) })
            .catch(() => {})
    }, [])

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
        setPassword(Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(''); setSuccess(''); setLoading(true)
        try {
            const res  = await fetch('/api/admin/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, nom, telephone, password, role }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Erreur lors de la création')
            } else {
                setSuccess(`Utilisateur créé avec succès !\nEmail : ${email}\nMot de passe : ${password}`)
                setTimeout(() => { setEmail(''); setNom(''); setTelephone(''); setPassword(''); setSuccess('') }, 5000)
            }
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
                    <button
                        type="button"
                        onClick={() => router.push('/admin/users')}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">Créer un utilisateur</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Ajouter un nouveau compte à la plateforme</p>
                    </div>
                </div>

                {/* ── Formulaire ── */}
                <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Nom complet <span className="text-red-500">*</span></label>
                                <input type="text" value={nom} onChange={e => setNom(e.target.value)}
                                    required placeholder="Prénom Nom" className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    required className={inputCls} />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Téléphone</label>
                            <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
                                placeholder="+216 12 345 678" className={inputCls} />
                        </div>

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

                        {/* ── Mot de passe ── */}
                        <div className="pt-2 border-t border-slate-100">
                            <label className={labelCls}>
                                Mot de passe temporaire <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input type="text" value={password} onChange={e => setPassword(e.target.value)}
                                    required minLength={6} placeholder="Entrez un mot de passe"
                                    className={inputCls} />
                                <button type="button" onClick={generatePassword}
                                    className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition">
                                    Générer
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                                L'utilisateur devra changer ce mot de passe à sa première connexion.
                            </p>
                        </div>

                        {/* ── Messages ── */}
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
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
                                <p className="font-semibold mb-1">✓ Utilisateur créé avec succès</p>
                                <pre className="whitespace-pre-wrap text-xs text-emerald-600 font-mono">{success}</pre>
                                <button type="button"
                                    onClick={() => navigator.clipboard.writeText(`Email: ${email}\nMot de passe: ${password}`)}
                                    className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">
                                    Copier les identifiants
                                </button>
                            </div>
                        )}

                        {/* ── Actions ── */}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => router.push('/admin/users')}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition">
                                Annuler
                            </button>
                            <button type="submit" disabled={loading}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Création...' : "Créer l'utilisateur"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}