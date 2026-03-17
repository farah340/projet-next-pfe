
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/bd'

// api/admin/users/edit/route.ts

export async function PUT(request: NextRequest) {  // ✅ was POST
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

        // ✅ Determine if role value is a system role or a custom role UUID
        const isSystemRole = role === 'ADMIN' || role === 'USER'

        const dataToUpdate: {
            email?: string
            nom: string
            telephone?: string | null
            role?: 'ADMIN' | 'USER' | 'CUSTOM'
            customRoleId?: string | null
            firstLogin?: boolean
        } = { nom }

        if (email !== undefined) {
            if (typeof email !== 'string' || !email.includes('@')) {
                return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
            }
            dataToUpdate.email = email
        }

        if (telephone !== undefined) {
            dataToUpdate.telephone = telephone === '' || telephone === null ? null : telephone
        }

        if (role !== undefined) {
            if (isSystemRole) {
                // ✅ System role: set role, clear customRoleId
                dataToUpdate.role = role as 'ADMIN' | 'USER'
                dataToUpdate.customRoleId = null
            } else if (typeof role === 'string') {
                // ✅ Custom role UUID: keep role as 'USER', set customRoleId
                dataToUpdate.role = 'CUSTOM'
                dataToUpdate.customRoleId = role
            } else {
                return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
            }
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
                id: true, email: true, nom: true,
                telephone: true, role: true,
                customRoleId: true, firstLogin: true, createdAt: true,
            },
        })

        return NextResponse.json(
            { message: 'Utilisateur modifié avec succès', user: updatedUser },
            { status: 200 }
        )
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
        }
        console.error('Erreur modification utilisateur:', error)
        return NextResponse.json({ error: 'Erreur serveur lors de la modification' }, { status: 500 })
    }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
      },
      orderBy: { nom: 'asc' },
    })

    return NextResponse.json(users)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}