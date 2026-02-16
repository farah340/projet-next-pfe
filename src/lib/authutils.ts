import { auth } from '../../auth'
import { redirect } from 'next/navigation'

export async function getSession() {
    return await auth()
}

export async function requireAuth() {
    const session = await getSession()
    if (!session) redirect('/login')
    return session
}

export async function requireAdmin() {
    const session = await requireAuth()
    if (session.user?.role !== 'ADMIN') redirect('/dashboard')
    return session
}

export async function isAdmin() {
    const session = await getSession()
    return session?.user?.role === 'ADMIN'
}