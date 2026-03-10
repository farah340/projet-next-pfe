'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const MapSearch = dynamic(() => import('@/components/MapSearch'), {
    ssr: false,
    loading: () => (
        <div className="flex h-[480px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex flex-col items-center gap-3 text-slate-400">
                <svg className="h-8 w-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-sm">Chargement de la carte...</span>
            </div>
        </div>
    ),
})

export default function MapPage() {
    return (
        <div className="space-y-6 bg-gray-100">

            {/* Bouton retour */}
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Retour au dashboard
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recherche de zone</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Recherchez une ville ou une adresse pour la localiser sur la carte.
                    </p>
                </div>
                <span className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className="text-emerald-500">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    OpenStreetMap · Nominatim
                </span>
            </div>

            <MapSearch />
        </div>
    )
}