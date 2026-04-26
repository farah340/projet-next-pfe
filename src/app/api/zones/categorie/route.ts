import { NextResponse } from 'next/server'
import { prisma } from '@/lib/bd'

export async function GET() {
  try {
    const categories = await prisma.categorie.findMany({
      include: {
        typeActivite: true,
      },
      orderBy: { name: 'asc' },
    })

    // Format de sortie clean
    const formatted = categories.map((c) => ({
      id: c.id,
      nom: c.name,        // "Café", "Barbier"
      google_type: c.google_type, // "cafe", "hair_salon"
      keywords: c.keywords ?? [], // ["coffee"], ["barbe"]
      type_id: c.typeActiviteId,
      type_nom: c.typeActivite.nom,       // "Restauration", "Beauté"
      type_emoji: c.typeActivite.icone,   
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Erreur API categories:', error)
    return NextResponse.json(
      { error: 'Erreur récupération catégories' },
      { status: 500 }
    )
  }
}