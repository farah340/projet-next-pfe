'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Zone = {
    id: string
    nom: string
    description: string | null
    adresse: string
    lat: number
    lng: number
    createdAt: string
}

export default function ZonesListClient({ zones: initial }: { zones: Zone[] }) {
    const router = useRouter()
    const [zones, setZones] = useState(initial)
    const [deleting, setDeleting] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette zone ?')) return
        setDeleting(id)
        try {
            const res = await fetch(`/api/zones?id=${id}`, { method: 'DELETE' })
            if (res.ok) setZones(prev => prev.filter(z => z.id !== id))
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/dashboard"
                        className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mes zones</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {zones.length} zone{zones.length > 1 ? 's' : ''} enregistrée{zones.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href="/dashboard/map"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nouvelle zone
                </Link>
            </div>

            {/* Liste vide */}
            {zones.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                            className="text-slate-400">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-600">Aucune zone enregistrée</p>
                    <p className="mt-1 text-sm text-slate-400">Commencez par définir votre première zone géographique.</p>
                    <Link
                        href="/dashboard/map"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        Créer une zone
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {zones.map(zone => (
                        <div key={zone.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

                            {/* Icon + nom */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">{zone.nom}</h3>
                                        <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{zone.adresse}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(zone.id)}
                                    disabled={deleting === zone.id}
                                    className="flex-shrink-0 rounded-lg border border-red-100 p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                        <path d="M10 11v6M14 11v6" />
                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                    </svg>
                                </button>
                            </div>

                            {/* Description */}
                            {zone.description && (
                                <p className="mt-3 text-xs text-slate-500 line-clamp-2">{zone.description}</p>
                            )}

                            {/* Coordonnées */}
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                                {new Date(zone.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                <span className="mx-1">·</span>
                                {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                            </div>

                            {/* Action */}
                            <Link
                                href={`/dashboard/map?zoneId=${zone.id}`}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                                    <path d="M8 2v16M16 6v16" />
                                </svg>
                                Voir sur la carte
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}