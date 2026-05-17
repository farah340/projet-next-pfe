import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/bd'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')?.trim()
  const lng = searchParams.get('lng')?.trim()
  const categorieId = searchParams.get('categorieId')   // id depuis table Categorie
  const categorie = searchParams.get('categorie')        // nom lisible (fallback filtre)

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat et lng requis' }, { status: 400 })
  }

  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)

  try {
    // 1. Récupérer le google_type depuis la table Categorie
    let googleType: string | null = null
    if (categorieId) {
      const cat = await prisma.categorie.findUnique({
        where: { id: categorieId },
        select: { google_type: true }
      })
      googleType = cat?.google_type ?? null
    }

    // 2. Chercher les lieux dans un rayon de 5km
    const tousLesLieux: any[] = await prisma.$queryRaw`
      SELECT 
        l.id,
        l."placeId",
        l.nom,
        l.adresse,
        l.lat,
        l.lng,
        l.note,
        l."nbAvis",
        l.types,
        l.categorie,
        l.statut,
        l."zoneId",
        l."collecteLe",
        z.nom as "zoneNom"
      FROM "Lieu" l
      LEFT JOIN "Zone" z ON z.id = l."zoneId"
      WHERE (
        6371000 * acos(
          LEAST(1.0,
            cos(radians(${latNum})) * cos(radians(l.lat)) *
            cos(radians(l.lng) - radians(${lngNum})) +
            sin(radians(${latNum})) * sin(radians(l.lat))
          )
        )
      ) <= 1500
      ORDER BY distance ASC
      LIMIT 200
    `

    // 3. Filtrer par catégorie
    const lieuxFiltres = categorie && categorie !== 'all'
      ? tousLesLieux.filter(l =>
        l.categorie?.toLowerCase() === categorie.toLowerCase() ||
        l.categorie === googleType  // "cafe" matche aussi
      )
      : tousLesLieux

    // 4. Si aucun lieu → déclencher N8N avec google_type (English) au lieu de categorie.name (French)
   if (lieuxFiltres.length <= 10 && categorieId) {
  console.log('🚀 N8N WEBHOOK - Collecte déclenchée:', { latNum, lngNum, categorieId, googleType })

  fetch(process.env.N8N_WEBHOOK_URL_COLLECTE!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lat: latNum,
      lng: lngNum,
      categorieId,
      categorie: googleType ?? 'restaurant',
      google_type: googleType ?? 'restaurant',
      nomZone: searchParams.get('nomZone') ?? '',
    })
  }).catch(err => console.error('❌ N8N WEBHOOK ERROR:', err.message))

  return NextResponse.json({
    lieux: lieuxFiltres,          // ← on renvoie les lieux existants, pas []
    collecteEnCours: true,
    total: lieuxFiltres.length,
    message: lieuxFiltres.length === 0
      ? 'Collecte en cours, réessayez dans 30 secondes'
      : 'Quelques lieux trouvés, collecte complémentaire en cours...'
  })
}

  } catch (error) {
    console.error('Erreur lieux:', error)
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
  }
}