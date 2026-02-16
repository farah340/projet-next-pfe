import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import bcrypt from 'bcrypt'
export const runtime = "nodejs";

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const { newPassword } = await request.json()

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 6 caractères' },
                { status: 400 }
            )
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Mettre à jour le mot de passe et firstLogin
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                password: hashedPassword,
                firstLogin: false,  // Plus besoin de changer
            }
        })

        return NextResponse.json(
            { message: 'Mot de passe changé avec succès' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Erreur changement mot de passe:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}