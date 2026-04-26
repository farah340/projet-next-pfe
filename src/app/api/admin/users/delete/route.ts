
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/bd'

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
        }

        // Récupérer l'ID soit du body JSON soit des query params
        let id: string | null = null
        try {
            const body = await request.json()
            id = body.id
        } catch {
            // Si pas de body JSON, chercher dans les query params
            const { searchParams } = new URL(request.url)
            id = searchParams.get('id')
        }

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { id },
            select: { id: true },
        })

        if (!existingUser) {
            return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
        }

        await prisma.user.delete({ where: { id } })

        return NextResponse.json({ message: 'Utilisateur supprimé avec succès' }, { status: 200 })
    } catch (error) {
        console.error('Erreur suppression utilisateur:', error)
        return NextResponse.json({ error: 'Erreur serveur lors de la suppression' }, { status: 500 })
    }
}

