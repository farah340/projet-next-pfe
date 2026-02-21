import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from '@prisma/client/index'
import bcrypt from 'bcrypt'

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const password = await bcrypt.hash('password123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@admin.com' },
        update: {},
        create: {
            email: 'admin@admin.com',
            nom: 'Admin User',
            password,
            role: Role.ADMIN,
        },
    })
    const password2 = await bcrypt.hash('user123', 10)
    const user = await prisma.user.upsert({
        where: { email: 'user@user.com' },
        update: {},
        create: {
            email: 'user@user.com',
            nom: 'User User',
            password: password2,
            role: Role.USER,
        },
    })


    console.log({ admin }, { user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
