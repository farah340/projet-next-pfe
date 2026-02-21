import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60, // 7 jours
    },

    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                    select: {
                        id: true,
                        email: true,
                        password: true,
                        nom: true,
                        role: true,
                        firstLogin: true,
                    }
                })

                if (!user) {
                    return null
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.nom,
                    role: user.role,
                    firstLogin: user.firstLogin,
                }
            }
        })
    ],

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                if (user.role) token.role = user.role
                if (user.id) token.id = user.id
                if (user.firstLogin !== undefined) token.firstLogin = user.firstLogin
            }

            // Mettre à jour le token après changement de mot de passe
            if (trigger === 'update' && session?.firstLogin !== undefined) {
                token.firstLogin = session.firstLogin
            }

            return token
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as Role
                session.user.id = token.id as string
                session.user.firstLogin = token.firstLogin as boolean
            }
            return session
        }
    },

    pages: {
        signIn: '/login',
    },
})