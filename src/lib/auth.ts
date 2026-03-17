import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from '@prisma/client/index'
import bcrypt from 'bcrypt'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60,
    },
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email:    { label: 'Email',    type: 'email'    },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                    select: {
                        id: true, email: true, password: true,
                        nom: true, role: true, firstLogin: true,
                        customRole: {
                            select: {
                                id: true, name: true,
                                permissions: {
                                    select: { id: true, action: true, resource: true }
                                }
                            }
                        }
                    }
                })

                if (!user) return null

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string, user.password
                )
                if (!isPasswordValid) return null

                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLogin: new Date() },
                })

                let permissions: string[] = []
                if (user.role === 'ADMIN') {
                    permissions = ['voir', 'creer', 'modifier', 'supprimer']
                } else if (user.role === 'CUSTOM' && user.customRole) {
                    permissions = user.customRole.permissions.map(
                        (p: { id: string; action: string; resource: string }) =>
                            p.action.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
                    )
                }

                return {
                    id: user.id, email: user.email, name: user.nom,
                    role: user.role, firstLogin: user.firstLogin, permissions,
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id          = user.id
                token.role        = (user as any).role
                token.permissions = (user as any).permissions
                token.firstLogin  = (user as any).firstLogin
            }
            if (trigger === 'update' && session?.firstLogin !== undefined) {
                token.firstLogin = session.firstLogin
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id          = token.id as string
                session.user.role        = token.role as Role
                session.user.permissions = token.permissions as string[]
                session.user.firstLogin  = token.firstLogin as boolean
            }
            return session
        }
    },
    pages: { signIn: '/login' },
})