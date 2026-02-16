import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../../auth'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import bcrypt from 'bcrypt'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export async function POST(request: NextRequest) {
    try {
        // Vérifier que l'utilisateur est admin
        const session = await auth()

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 403 }
            )
        }

        const { email, nom, telephone, password, role } = await request.json()

        // Validation
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

        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Cet email est déjà utilisé' },
                { status: 400 }
            )
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10)

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                email,
                nom,
                telephone: telephone || null,
                password: hashedPassword,
                role: role || 'USER',
                firstLogin: true,  // Force le changement de mot de passe
            },
            select: {
                id: true,
                email: true,
                nom: true,
                role: true,
                firstLogin: true,
                createdAt: true,
            }
        })

        return NextResponse.json(
            {
                message: 'Utilisateur créé avec succès',
                user
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Erreur création utilisateur:', error)
        return NextResponse.json(
            { error: 'Erreur serveur lors de la création' },
            { status: 500 }
        )
    }
}