// app/api/zones/sauvegarder/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/bd'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { zone, categorieId, categorie, typeActiviteId, lieux } = body

    if (!zone || !categorieId || !lieux?.length) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // 1. Créer ou retrouver la zone
    let zoneRecord = await prisma.zone.findFirst({
      where: {
        AND: [
          { userId: session.user.id },
          { lat: { gte: zone.lat - 0.001, lte: zone.lat + 0.001 } },
          { lng: { gte: zone.lng - 0.001, lte: zone.lng + 0.001 } },
        ]
      }
    })

    if (!zoneRecord) {
      zoneRecord = await prisma.zone.create({
        data: {
          nom: zone.nom.split(',')[0],
          adresse: zone.adresse || zone.nom,
          lat: zone.lat,
          lng: zone.lng,
          userId: session.user.id,
        }
      })
    }

    // 2. Créer la liaison ZoneActivite si elle n'existe pas
    if (typeActiviteId) {
      await prisma.zoneActivite.upsert({
        where: {
          zoneId_typeActiviteId: {
            zoneId: zoneRecord.id,
            typeActiviteId,
          }
        },
        update: {},
        create: {
          zoneId: zoneRecord.id,
          typeActiviteId,
        }
      })
    }

    // 3. Upsert tous les lieux
    for (const lieu of lieux) {
      if (!lieu.placeId) continue
      await prisma.lieu.upsert({
        where: { placeId: lieu.placeId },
        update: {
          nom: lieu.nom,
          adresse: lieu.adresse,
          note: lieu.note,
          nbAvis: lieu.nbAvis,
          types: lieu.types,
          statut: lieu.statut || 'OPERATIONAL',
          updatedAt: new Date(),
        },
        create: {
          placeId: lieu.placeId,
          nom: lieu.nom,
          adresse: lieu.adresse,
          lat: lieu.lat,
          lng: lieu.lng,
          note: lieu.note,
          nbAvis: lieu.nbAvis ?? 0,
          types: lieu.types || '',
          categorie: lieu.categorie || categorie,
          statut: lieu.statut || 'OPERATIONAL',
          zoneId: zoneRecord.id,
        }
      })
    }

    return NextResponse.json({
      success: true,
      zoneId: zoneRecord.id,
      lieuxSauvegardes: lieux.length,
    })

  } catch (error) {
    console.error('Erreur sauvegarde:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}