import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from '../src/generated/prisma/client'
import bcrypt from 'bcrypt'
import * as readline from 'readline'

const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Interface pour poser des questions dans le terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function question(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve))
}

async function addUser() {
    console.log('\n🔧 Ajout d\'un utilisateur manuellement\n')

    // Demander les informations
    const email = await question('Email : berrichefarah38@gmail.com')
    const nom = await question('Nom complet : Farah Berriche')
    const telephone = await question('Téléphone (optionnel) : 0550123456')
    const password = await question('Mot de passe : farah123')
    const roleInput = await question('Rôle (USER/ADMIN) [USER] :user ')

    const role = roleInput.toUpperCase() === 'ADMIN' ? Role.ADMIN : Role.USER

    console.log('\n⏳ Création de l\'utilisateur...')

    try {
        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            console.error('❌ Erreur : Cet email est déjà utilisé')
            rl.close()
            await prisma.$disconnect()
            process.exit(1)
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
                role,
                firstLogin: true,
            }
        })

        console.log('\n✅ Utilisateur créé avec succès !')
        console.log('\n📋 Détails :')
        console.log(`ID       : ${user.id}`)
        console.log(`Email    : ${user.email}`)
        console.log(`Nom      : ${user.nom}`)
        console.log(`Rôle     : ${user.role}`)
        console.log(`Password : ${password} (mot de passe temporaire)`)
        console.log(`\n⚠️  L'utilisateur devra changer ce mot de passe à la première connexion.\n`)

    } catch (error) {
        console.error('❌ Erreur lors de la création :', error)
    } finally {
        rl.close()
        await prisma.$disconnect()
    }
}

addUser()