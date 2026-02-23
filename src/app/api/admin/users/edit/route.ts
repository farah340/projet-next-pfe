
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/bd'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
        }

        const { id, email, nom, telephone, role, firstLogin } = await request.json()

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
        }

        if (!nom || typeof nom !== 'string') {
            return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { id },
            select: { id: true },
        })

        if (!existingUser) {
            return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
        }

        const dataToUpdate: {
            email?: string
            nom: string
            telephone?: string | null
            role?: 'ADMIN' | 'USER'
            firstLogin?: boolean
        } = {
            nom,
        }

        if (email !== undefined) {
            if (typeof email !== 'string' || !email.includes('@')) {
                return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
            }
            dataToUpdate.email = email
        }

        if (telephone !== undefined) {
            if (telephone === '' || telephone === null) {
                dataToUpdate.telephone = null
            } else if (typeof telephone === 'string') {
                dataToUpdate.telephone = telephone
            } else {
                return NextResponse.json({ error: 'Téléphone invalide' }, { status: 400 })
            }
        }

        if (role !== undefined) {
            if (role !== 'ADMIN' && role !== 'USER') {
                return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
            }
            dataToUpdate.role = role
        }

        if (firstLogin !== undefined) {
            if (typeof firstLogin !== 'boolean') {
                return NextResponse.json({ error: 'firstLogin invalide' }, { status: 400 })
            }
            dataToUpdate.firstLogin = firstLogin
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
            select: {
                id: true,
                email: true,
                nom: true,
                telephone: true,
                role: true,
                firstLogin: true,
                createdAt: true,
            },
        })

        return NextResponse.json(
            { message: 'Utilisateur modifié avec succès', user: updatedUser },
            { status: 200 }
        )
    } catch (error: any) {
        const prismaCode = error?.code

        if (prismaCode === 'P2002') {
            return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
        }

        console.error('Erreur modification utilisateur:', error)
        return NextResponse.json({ error: 'Erreur serveur lors de la modification' }, { status: 500 })
    }
}

