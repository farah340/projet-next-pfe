import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/bd'

// ─── GET : récupère une zone par ID ─────────────────────────────
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params 
  try {
    const zone = await prisma.zone.findUnique({
      where: { id }
    })

    if (!zone) {
      return NextResponse.json({ error: 'Zone introuvable' }, { status: 404 })
    }

    return NextResponse.json(zone)
  } catch (e) {
    console.error('[GET /api/zones/:id]', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── POST : analyse via n8n ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { zoneId, activite } = await req.json()

    // 1. Récupère la zone depuis ta DB (comme ton GET existant)
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId }
    })
    if (!zone) return NextResponse.json({ error: 'Zone introuvable' }, { status: 404 })

    // 2. Envoie à n8n avec toutes les données nécessaires
    const n8nResponse = await fetch(`${process.env.N8N_WEBHOOK_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zoneId:          zone.id,
        nom_zone:        zone.nom,
        latitude:        zone.lat,
        longitude:       zone.lng,
	      type_activite:   activite,
        google_api_key:  process.env.GOOGLE_MAPS_API_KEY
      })
    })

    if (!n8nResponse.ok) throw new Error('Erreur n8n')

    const result = await n8nResponse.json()
    return NextResponse.json(result)

  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}