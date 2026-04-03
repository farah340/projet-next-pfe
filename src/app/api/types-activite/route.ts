import { NextResponse } from 'next/server'
import prisma from '@/lib/bd'
 
export async function GET() {
  try {
    const types = await prisma.typeActivite.findMany({
      where: { actif: true },
      include: {
        categories: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { nom: 'asc' }
    })
    return NextResponse.json({ types })
  } catch (error) {
    console.error('Erreur types-activite:', error)
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
  }
}
 