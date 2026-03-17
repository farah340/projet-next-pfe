import { auth } from './auth'
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

export async function requirePermission(permission: string) {
    const session = await requireAuth()
    const role        = session.user?.role
    const permissions = (session.user?.permissions ?? []) as string[]
    if (role === 'ADMIN') return session
    if (role === 'CUSTOM' && permissions.includes(permission)) return session
    redirect('/dashboard')
}

export async function isAdmin() {
    const session = await getSession()
    return session?.user?.role === 'ADMIN'
}

export async function hasPermission(permission: string): Promise<boolean> {
    const session = await getSession()
    if (!session) return false
    const role        = session.user?.role
    const permissions = (session.user?.permissions ?? []) as string[]
    if (role === 'ADMIN') return true
    if (role === 'CUSTOM') return permissions.includes(permission)
    return false
}