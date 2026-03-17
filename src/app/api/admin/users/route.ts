import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/bd'
import bcrypt from 'bcrypt'
import { Role } from '@prisma/client'

const SYSTEM_ROLES = ['ADMIN', 'USER', 'CUSTOM']

// ── GET /api/admin/users/edit  →  lister les utilisateurs ──
export async function GET() {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'ADMIN' && session.user.role !== 'CUSTOM') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                nom: true,
                email: true,
                role: true,
                telephone: true,
                customRoleId: true,
                customRole: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                createdAt: true,
            },
            orderBy: { nom: 'asc' },
        })

        return NextResponse.json(users)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// ── PUT /api/admin/users/edit  →  modifier un utilisateur ──
export async function PUT(request: NextRequest) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
        }

        const { id, email, nom, telephone, password, role } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
        }

        if (!email || !nom) {
            return NextResponse.json(
                { error: 'Email et nom sont requis' },
                { status: 400 }
            )
        }

        // Vérifier que l'utilisateur existe
        const existingUser = await prisma.user.findUnique({ where: { id } })
        if (!existingUser) {
            return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
        }

        // Vérifier email unique (sauf pour lui-même)
        const emailTaken = await prisma.user.findFirst({
            where: { email, NOT: { id } }
        })
        if (emailTaken) {
            return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
        }

        // ── Résoudre le rôle ──────────────────────────────────────
        const isSystemRole = SYSTEM_ROLES.includes(role)
        let customRoleId: string | null = null

        if (!isSystemRole) {
            // C'est un rôle custom → vérifier qu'il existe
            const customRole = await prisma.customRole.findUnique({
                where: { id: role }
            })
            if (!customRole) {
                return NextResponse.json(
                    { error: 'Rôle personnalisé introuvable' },
                    { status: 400 }
                )
            }
            customRoleId = customRole.id
        }

        const prismaRole: Role = isSystemRole
            ? (role as Role)
            : 'CUSTOM'  // ← même correction que dans create

        // ── Construire les données à mettre à jour ────────────────
        const updateData: any = {
            email,
            nom,
            telephone: telephone || null,
            role: prismaRole,
            customRoleId,  // null si rôle système, id si rôle custom
        }

        // Mot de passe optionnel (seulement si fourni)
        if (password && password.length > 0) {
            if (password.length < 6) {
                return NextResponse.json(
                    { error: 'Le mot de passe doit contenir au moins 6 caractères' },
                    { status: 400 }
                )
            }
            updateData.password = await bcrypt.hash(password, 10)
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                nom: true,
                role: true,
                customRoleId: true,
                customRole: {
                    select: {
                        id: true,
                        name: true,
                        permissions: {
                            select: {
                                id: true,
                                action: true,
                                resource: true,
                            }
                        }
                    }
                },
                createdAt: true,
            },
        })

        return NextResponse.json(
            { message: 'Utilisateur modifié avec succès', user },
            { status: 200 }
        )

    } catch (error) {
        console.error('Erreur modification utilisateur:', error)
        return NextResponse.json(
            { error: 'Erreur serveur lors de la modification' },
            { status: 500 }
        )
    }
}