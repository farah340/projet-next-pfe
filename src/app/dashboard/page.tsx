// app/dashboard/page.tsx
import { requireAuth } from '@/lib/authutils'
import { redirect } from 'next/navigation'
import prisma from '@/lib/bd'
import DashboardClient from '@/components/Dashboardclient'

export default async function DashboardPage() {
    const session = await requireAuth()
    if (session.user.role === 'ADMIN') redirect('/admin')
    if (session.user.firstLogin) redirect('/change-password')

    const userId = session.user.id
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // ── Récupérations parallèles ──────────────────────────────
    const [
        allZones,
        allAnalyses,
        recentZonesRaw,
        heatmapAnalyses,
    ] = await Promise.all([
        // Toutes les zones avec leur dernière analyse (pour stats agrégées)
        prisma.zone.findMany({
            where: { userId },
            select: {
                id: true,
                nom: true,
                analyses: {
                    orderBy: { dateAnalyse: 'desc' },
                    take: 1,
                    select: {
                        scoreTotal: true,
                        activite: true,
                        dateAnalyse: true,
                    },
                },
            },
        }),

        // Toutes les analyses (pour calcul meilleur secteur)
        prisma.analyse.findMany({
            where: { zone: { userId }, scoreTotal: { not: null }, activite: { not: null } },
            select: {
                zoneId: true,
                scoreTotal: true,
                activite: true,
                dateAnalyse: true,
                zone: { select: { nom: true } },
            },
        }),

        // 4 zones récentes enrichies
        prisma.zone.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 4,
            select: {
                id: true,
                nom: true,
                adresse: true,
                createdAt: true,
                analyses: {
                    orderBy: { dateAnalyse: 'desc' },
                    take: 1,
                    select: { scoreTotal: true, activite: true, dateAnalyse: true },
                },
                activites: {
                    take: 1,
                    select: { typeActivite: { select: { nom: true } } },
                },
            },
        }),

        // Heatmap depuis dates des analyses
        prisma.analyse.findMany({
            where: { zone: { userId } },
            select: { dateAnalyse: true },
        }),
    ])

    // ── Calculs des 4 cartes business ─────────────────────────
    let zonesRecommandees = 0   // score ≥ 70
    let zonesAEviter = 0        // score < 50
    let zonesAReanalyser = 0    // pas d'analyse OU analyse > 30 jours

    for (const zone of allZones) {
        const latest = zone.analyses[0]
        if (!latest || latest.scoreTotal == null) {
            zonesAReanalyser++
            continue
        }
        if (new Date(latest.dateAnalyse) < thirtyDaysAgo) {
            zonesAReanalyser++
        }
        if (latest.scoreTotal >= 70) zonesRecommandees++
        else if (latest.scoreTotal < 50) zonesAEviter++
    }

    // ── Meilleur secteur (moyenne de scoreTotal par activité) ──
    const secteurMap = new Map<string, { sum: number; count: number }>()
    for (const a of allAnalyses) {
        if (!a.activite || a.scoreTotal == null) continue
        const existing = secteurMap.get(a.activite)
        if (existing) {
            existing.sum += a.scoreTotal
            existing.count++
        } else {
            secteurMap.set(a.activite, { sum: a.scoreTotal, count: 1 })
        }
    }

    let meilleurSecteur: { nom: string; moyenne: number; nbZones: number } | null = null
    for (const [nom, { sum, count }] of secteurMap.entries()) {
        const moyenne = Math.round(sum / count)
        if (!meilleurSecteur || moyenne > meilleurSecteur.moyenne) {
            meilleurSecteur = { nom, moyenne, nbZones: count }
        }
    }

    // ── Top zones par score (déjà calculé via allAnalyses) ────
    const zoneScoreMap = new Map<
        string,
        { nom: string; activite: string | null; latest: number; previous: number | null }
    >()

    // allAnalyses est trié par dateAnalyse desc dans la requête ? Non, on doit trier
    const sortedAnalyses = [...allAnalyses].sort(
        (a, b) => new Date(b.dateAnalyse).getTime() - new Date(a.dateAnalyse).getTime()
    )

    for (const a of sortedAnalyses) {
        if (a.scoreTotal == null) continue
        const existing = zoneScoreMap.get(a.zoneId)
        if (!existing) {
            zoneScoreMap.set(a.zoneId, {
                nom: a.zone.nom,
                activite: a.activite,
                latest: a.scoreTotal,
                previous: null,
            })
        } else if (existing.previous === null) {
            existing.previous = a.scoreTotal
        }
    }

    const topZones = Array.from(zoneScoreMap.entries())
        .map(([id, v]) => ({
            id,
            nom: v.nom,
            activite: v.activite,
            score: v.latest,
            tendance: v.previous !== null
                ? Math.round((v.latest - v.previous) * 10) / 10
                : null,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

    // ── Heatmap (jour × heure) ────────────────────────────────
    const PLAGES = [6, 9, 12, 15, 18, 21]
    const heatmap: number[][] = PLAGES.map(() => Array(7).fill(0))

    for (const a of heatmapAnalyses) {
        const d = new Date(a.dateAnalyse)
        const dayJs = d.getDay()
        const day = dayJs === 0 ? 6 : dayJs - 1
        const hour = d.getHours()
        let plageIdx = 0
        for (let i = 0; i < PLAGES.length; i++) {
            if (Math.abs(hour - PLAGES[i]) < Math.abs(hour - PLAGES[plageIdx])) {
                plageIdx = i
            }
        }
        heatmap[plageIdx][day]++
    }

    let peakValue = 0
    let peakDay = 0
    let peakHour = 0
    heatmap.forEach((row, i) => {
        row.forEach((v, j) => {
            if (v > peakValue) {
                peakValue = v
                peakHour = PLAGES[i]
                peakDay = j
            }
        })
    })

    // ── Zones récentes enrichies ─────────────────────────────
    const recentZones = recentZonesRaw.map(z => ({
        id: z.id,
        nom: z.nom,
        adresse: z.adresse,
        createdAt: z.createdAt.toISOString(),
        score: z.analyses[0]?.scoreTotal ?? null,
        activite: z.analyses[0]?.activite ?? z.activites[0]?.typeActivite.nom ?? null,
    }))

    return (
        <DashboardClient
            userName={session.user.name ?? ''}
            totalZones={allZones.length}
            zonesRecommandees={zonesRecommandees}
            zonesAEviter={zonesAEviter}
            zonesAReanalyser={zonesAReanalyser}
            meilleurSecteur={meilleurSecteur}
            recentZones={recentZones}
            topZones={topZones}
            heatmap={heatmap}
            heatmapPeak={
                peakValue > 0
                    ? { day: peakDay, hour: peakHour, count: peakValue }
                    : null
            }
        />
    )
}