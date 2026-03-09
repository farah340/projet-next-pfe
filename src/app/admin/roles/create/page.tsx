'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const RESOURCES = ['Utilisateurs'] as const
const ACTIONS = ['voir', 'créer', 'modifier', 'supprimer'] as const

type Action = typeof ACTIONS[number]
type Resource = typeof RESOURCES[number]

type PermMatrix = Record<Resource, Record<Action, boolean>>

function initMatrix(): PermMatrix {
    const m = {} as PermMatrix
    for (const r of RESOURCES) {
        m[r] = { voir: false, créer: false, modifier: false, supprimer: false }
    }
    return m
}

const ACTION_META: Record<Action, { label: string; color: string; icon: string }> = {
    voir:      { label: 'Voir',      color: 'blue',   icon: '👁' },
    créer:     { label: 'Créer',     color: 'emerald', icon: '✚' },
    modifier:  { label: 'Modifier',  color: 'amber',  icon: '✎' },
    supprimer: { label: 'Supprimer', color: 'red',    icon: '✕' },
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; checked: string }> = {
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    checked: 'bg-blue-600 border-blue-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', checked: 'bg-emerald-600 border-emerald-600' },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   checked: 'bg-amber-500 border-amber-500' },
    red:     { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     checked: 'bg-red-600 border-red-600' },
}

export default function CreateRolePage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [matrix, setMatrix] = useState<PermMatrix>(initMatrix())
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const toggle = (resource: Resource, action: Action) => {
        setMatrix(prev => ({
            ...prev,
            [resource]: { ...prev[resource], [action]: !prev[resource][action] },
        }))
    }

    const toggleAll = (resource: Resource) => {
        const allChecked = ACTIONS.every(a => matrix[resource][a])
        setMatrix(prev => ({
            ...prev,
            [resource]: Object.fromEntries(ACTIONS.map(a => [a, !allChecked])) as Record<Action, boolean>,
        }))
    }

    const countChecked = () =>
        RESOURCES.reduce((sum, r) => sum + ACTIONS.filter(a => matrix[r][a]).length, 0)

    const handleSubmit = async () => {
        setError('')
        if (!name.trim()) { setError('Le nom du rôle est requis'); return }

        const permissions = RESOURCES.map(resource => ({
            resource,
            actions: ACTIONS.filter(a => matrix[resource][a]),
        })).filter(p => p.actions.length > 0)

        setLoading(true)
        try {
            const res = await fetch('/api/admin/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, permissions }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Erreur'); return }
            router.push('/admin/roles')
        } catch {
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/roles')}
                        className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Retour aux rôles
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Créer un rôle</h1>
                    <p className="mt-1 text-sm text-slate-500">Définissez un nom et les permissions associées.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                    <span className="text-2xl font-bold text-slate-900">{countChecked()}</span>
                    <span className="text-xs text-slate-400">permission{countChecked() > 1 ? 's' : ''}<br/>sélectionnée{countChecked() > 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* ── Infos du rôle ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Informations</h2>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Nom du rôle <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="ex: Superviseur, Lecteur, Gestionnaire..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Description <span className="text-slate-400 font-normal">(optionnel)</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={2}
                        placeholder="Décrivez brièvement ce rôle..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition resize-none"
                    />
                </div>
            </div>

            {/* ── Matrice de permissions ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-5">Permissions</h2>

                <div className="space-y-4">
                    {RESOURCES.map(resource => {
                        const allChecked = ACTIONS.every(a => matrix[resource][a])
                        const someChecked = ACTIONS.some(a => matrix[resource][a])

                        return (
                            <div key={resource} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                {/* Resource header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                        </span>
                                        <span className="text-sm font-semibold text-slate-800">{resource}</span>
                                        {someChecked && (
                                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                                                {ACTIONS.filter(a => matrix[resource][a]).length}/{ACTIONS.length}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleAll(resource)}
                                        className="text-xs font-medium text-slate-500 hover:text-slate-900 transition underline underline-offset-2"
                                    >
                                        {allChecked ? 'Tout désélectionner' : 'Tout sélectionner'}
                                    </button>
                                </div>

                                {/* Actions grid */}
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {ACTIONS.map(action => {
                                        const meta = ACTION_META[action]
                                        const colors = COLOR_MAP[meta.color]
                                        const checked = matrix[resource][action]

                                        return (
                                            <button
                                                key={action}
                                                type="button"
                                                onClick={() => toggle(resource, action)}
                                                className={`
                                                    flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition
                                                    ${checked
                                                        ? `${colors.bg} ${colors.border} ${colors.text}`
                                                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                                    }
                                                `}
                                            >
                                                {/* Custom checkbox */}
                                                <span className={`
                                                    flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition
                                                    ${checked ? `${colors.checked} text-white` : 'border-slate-300 bg-white'}
                                                `}>
                                                    {checked && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                                                            fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span>{meta.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Erreur + Submit ── */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pb-8">
                <button
                    type="button"
                    onClick={() => router.push('/admin/roles')}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !name.trim()}
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? '⏳ Création...' : 'Créer le rôle'}
                </button>
            </div>
        </div>
    )
}