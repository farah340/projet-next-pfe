'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
const MapZone = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => (
        <div className="flex h-[600px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
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
        <div className="min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto max-w-6xl space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/dashboard"
                            className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Définir une zone</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Recherchez une ville ou région, puis enregistrez-la pour vos analyses.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/zones/list"
                        className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                            <path d="M8 2v16M16 6v16" />
                        </svg>
                        Mes zones
                    </Link>
                </div>

                <MapZone center={[48.8566, 2.3522]} lieux={[]} />
            </div>
        </div>
    )
}