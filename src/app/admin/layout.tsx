import type { ReactNode } from 'react'
import { requireAdmin } from '@/lib/authutils'
import LogoutButton from '@/components/LogoutButton'
import AdminSidebar from '@/components/AdminSidebar'
import { getSession } from '@/lib/authutils'
import { redirect } from 'next/navigation'
export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await getSession()

    // Non authentifié → login
    if (!session) redirect('/login')

    const role        = session.user?.role
    const permissions = (session.user?.permissions ?? []) as string[]

    // Ni ADMIN ni CUSTOM avec permissions → dashboard
    const isAdmin  = role === 'ADMIN'
    const isCustom = role === 'CUSTOM' && permissions.length > 0

    if (!isAdmin && !isCustom) redirect('/dashboard')

    return (
        <div className="flex min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            <AdminSidebar topRight={<LogoutButton />} />

            {/* Le margin-left est géré côté client via CSS variable ou classe dynamique */}
            {/* On utilise une astuce : le sidebar pousse le contenu via padding */}
            <main className="flex-1 pl-[68px] transition-all duration-300 ease-in-out" id="admin-main">
                <div className="mx-auto w-full max-w-5xl px-6 py-10">
                    {children}
                </div>
            </main>
        </div>
    )
}