import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/bd'
 
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
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
      ) <= 5000
      ORDER BY l."collecteLe" DESC
      LIMIT 200
    `
 
    // 3. Filtrer par catégorie
    const lieuxFiltres = categorie && categorie !== 'all'
      ? tousLesLieux.filter(l => l.categorie === categorie)
      : tousLesLieux
 
    // 4. Si aucun lieu → déclencher N8N avec categorieId
    if (lieuxFiltres.length === 0 && categorieId) {
      console.log('🚀 N8N WEBHOOK - Collecte déclenchée:', { latNum, lngNum, categorieId, googleType })
 
      fetch('http://localhost:5678/webhook/marketmap/collecte-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: latNum,
          lng: lngNum,
          categorieId,
          categorie: categorie ?? '',
          google_type: googleType ?? 'restaurant',
        })
      }).catch(err => console.error('❌ N8N WEBHOOK ERROR:', err.message))
 
      return NextResponse.json({
        lieux: [],
        collecteEnCours: true,
        message: 'Collecte en cours, réessayez dans 30 secondes'
      })
    }
 
    return NextResponse.json({
      lieux: lieuxFiltres,
      collecteEnCours: false,
      total: lieuxFiltres.length
    })
 
  } catch (error) {
    console.error('Erreur lieux:', error)
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
  }
}