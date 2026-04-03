import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/bd'

export async function GET(
  req: NextRequest,
  { params }: { params: { zoneId: string } }
) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const nom = searchParams.get('nom')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  try {
    // Tous les lieux dans un rayon de 5km
    const lieux: any[] = await prisma.$queryRaw`
      SELECT 
        l.categorie,
        l.types,
        l.note,
        l."nbAvis",
        l.nom,
        l.lat,
        l.lng
      FROM "Lieu" l
      WHERE (
        6371000 * acos(
          cos(radians(${parseFloat(lat)})) * cos(radians(l.lat)) *
          cos(radians(l.lng) - radians(${parseFloat(lng)})) +
          sin(radians(${parseFloat(lat)})) * sin(radians(l.lat))
        )
      ) <= 5000
    `

    // Stats par catégorie
    const parCategorie: Record<string, number> = {}
    lieux.forEach(l => {
      const cat = l.categorie || 'Autre'
      parCategorie[cat] = (parCategorie[cat] || 0) + 1
    })

    // Note moyenne
    const avecNote = lieux.filter(l => l.note !== null)
    const noteMoyenne = avecNote.length > 0
      ? avecNote.reduce((sum, l) => sum + parseFloat(l.note), 0) / avecNote.length
      : null

    // Catégorie dominante
    const categorieDominante = Object.entries(parCategorie)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Aucune'

    // Détection opportunités
    const opportunites: Array<{
      categorie: string
      message: string
      niveau: string
    }> = []
    const categories = ['Restauration', 'Santé', 'Finance', 'Commerce', 'Sport', 'Éducation']
    categories.forEach(cat => {
      if (!parCategorie[cat] || parCategorie[cat] < 2) {
        opportunites.push({
          categorie: cat,
          message: `Peu de ${cat.toLowerCase()} dans cette zone — opportunité potentielle`,
          niveau: 'haute'
        })
      }
    })

    return NextResponse.json({
      zone: { nom, lat: parseFloat(lat), lng: parseFloat(lng) },
      stats: {
        totalLieux: lieux.length,
        parCategorie,
        noteMoyenne: noteMoyenne ? Math.round(noteMoyenne * 10) / 10 : null,
        categorieDominante,
      },
      opportunites,
      lieux: lieux.slice(0, 50)
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur analyse' }, { status: 500 })
  }
}