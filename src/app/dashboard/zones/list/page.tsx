'use client'

import { useEffect, useState } from 'react'
import ZonesListClient from '@/components/zone-analyse/ZonesListClient'

type Zone = {
    id: string
    nom: string
    description: string | null
    adresse: string
    lat: number
    lng: number
    createdAt: string
}

export default function ZonesListPage() {
    const [zones, setZones] = useState<Zone[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const response = await fetch('/api/zones')
                
                if (!response.ok) {
                    throw new Error('Failed to fetch zones')
                }
                
                const data = await response.json()
                setZones(data)
            } catch (err) {
                setError('Erreur lors du chargement des zones')
            } finally {
                setLoading(false)
            }
        }

        fetchZones()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 px-6 py-8">
                <div className="mx-auto max-w-6xl">
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                            <svg className="h-8 w-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            <span className="text-sm">Chargement des zones...</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 px-6 py-8">
                <div className="mx-auto max-w-6xl">
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="text-center">
                            <p className="text-red-500">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return <ZonesListClient zones={zones} />
}
