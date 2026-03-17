'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import LogoutButton from '@/components/LogoutButton'

export default function ChangePasswordForm({ userEmail }: { userEmail: string }) {
    const [newPassword, setNewPassword]         = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError]                     = useState('')
    const [loading, setLoading]                 = useState(false)
    const { update } = useSession()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas')
            return
        }
        if (newPassword.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères')
            return
        }

        setLoading(true)
        try {
            const res  = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            })
            const data = await res.json()
            if (res.ok) {
                await update({ firstLogin: false })
                window.location.replace('/dashboard')
            } else {
                setError(data.error || 'Erreur lors du changement de mot de passe')
            }
        } catch {
            setError('Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    const inputCls = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
    const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* ── Card ── */}
                <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">

                    {/* ── Header card ── */}
                    <div className="px-6 pt-6 pb-5 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            {/* Logo */}
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                                    M&M
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 leading-tight">MarketMap</p>
                                    <p className="text-[10px] text-slate-400">Analyses géographiques</p>
                                </div>
                            </div>
                            {/* Déconnexion */}
                            
                        </div>

                        {/* Icône + titre */}
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                    fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-slate-900">Changer votre mot de passe</h1>
                                <p className="text-xs text-slate-400 mt-0.5">{userEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div className="px-6 py-5">

                        {/* Bandeau première connexion */}
                        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                            <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            <p className="text-xs text-amber-700 leading-relaxed">
                                Première connexion détectée. Veuillez définir un nouveau mot de passe pour continuer.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="newPassword" className={labelCls}>
                                    Nouveau mot de passe
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    placeholder="Min. 6 caractères"
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className={labelCls}>
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Répétez le mot de passe"
                                    className={inputCls}
                                />
                            </div>

                            {/* Indicateur de correspondance */}
                            {confirmPassword && (
                                <div className={`flex items-center gap-2 text-xs ${
                                    newPassword === confirmPassword
                                        ? 'text-emerald-600'
                                        : 'text-red-500'
                                }`}>
                                    {newPassword === confirmPassword ? (
                                        <>
                                            <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Les mots de passe correspondent
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                            </svg>
                                            Les mots de passe ne correspondent pas
                                        </>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" y1="8" x2="12" y2="12"/>
                                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? 'Enregistrement...' : 'Changer le mot de passe'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}