import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import bcrypt from 'bcrypt'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const SYSTEM_ROLES = ['ADMIN', 'USER']

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
        }

        const { email, nom, telephone, password, role } = await request.json()

        if (!email || !nom || !password) {
            return NextResponse.json(
                { error: 'Email, nom et mot de passe sont requis' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 6 caractères' },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
        }

        // ── Déterminer si c'est un rôle système ou un rôle custom ──
        const isSystemRole = SYSTEM_ROLES.includes(role)

        // Si rôle custom, vérifier qu'il existe en base
        if (!isSystemRole) {
            const customRole = await prisma.customRole.findUnique({ where: { id: role } })
            if (!customRole) {
                return NextResponse.json({ error: 'Rôle personnalisé introuvable' }, { status: 400 })
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                nom,
                telephone: telephone || null,
                password: hashedPassword,
                // Rôle système : ADMIN ou USER, sinon on met USER par défaut
                role: isSystemRole ? role : 'USER',
                // Rôle custom : lié via customRoleId
                customRoleId: !isSystemRole ? role : null,
                firstLogin: true,
            },
            select: {
                id: true,
                email: true,
                nom: true,
                role: true,
                customRoleId: true,
                customRole: { select: { name: true } },
                firstLogin: true,
                createdAt: true,
            },
        })

        return NextResponse.json(
            { message: 'Utilisateur créé avec succès', user },
            { status: 201 }
        )
    } catch (error) {
        console.error('Erreur création utilisateur:', error)
        return NextResponse.json({ error: 'Erreur serveur lors de la création' }, { status: 500 })
    }
}