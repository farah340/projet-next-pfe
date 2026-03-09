import type { ReactNode } from 'react'
import { requireAdmin } from '@/lib/authutils'
import LogoutButton from '@/components/LogoutButton'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }: { children: ReactNode }) {
    await requireAdmin()

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