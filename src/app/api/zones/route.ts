// app/api/zones/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/bd'

// ── GET /api/zones  →  lister les zones de l'utilisateur ──
export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }
 
        const { searchParams } = new URL(req.url)
        const withAnalyses = searchParams.get('withAnalyses') === '1'
        const activite = searchParams.get('activite')
 
        const analysesFilter =
            withAnalyses || activite
                ? { some: activite ? { activite } : {} }
                : undefined
 
        const zones = await prisma.zone.findMany({
            where: {
                userId: session.user.id,
                ...(analysesFilter ? { analyses: analysesFilter } : {}),
            },
            orderBy: { createdAt: 'desc' },
            include: {
                activites: {
                    include: {
                        typeActivite: true,
                    },
                },
                // Récupère la dernière analyse de chaque zone (pour les metrics du front)
                analyses: {
                    take: 1,
                    orderBy: { dateAnalyse: 'desc' },
                    ...(activite ? { where: { activite } } : {}),
                },
                _count: {
                    select: { analyses: true },
                },
            },
        })
 
        return NextResponse.json(zones)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// ── POST /api/zones  →  créer une zone ──
export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const { nom, description, adresse, lat, lng, geojson } = await req.json()

        if (!nom?.trim() || !adresse || lat === undefined || lng === undefined) {
            return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
        }

        const zone = await prisma.zone.create({
            data: {
                nom: nom.trim(),
                description: description?.trim() || null,
                adresse,
                lat,
                lng,
                geojson: geojson || null,
                userId: session.user.id,
            },
        })

        return NextResponse.json(zone, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// ── DELETE /api/zones?id=xxx  →  supprimer une zone ──
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

        // Vérifier que la zone appartient à l'utilisateur
        const zone = await prisma.zone.findFirst({
            where: { id, userId: session.user.id },
        })

        if (!zone) {
            return NextResponse.json({ error: 'Zone introuvable' }, { status: 404 })
        }

        await prisma.zone.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}