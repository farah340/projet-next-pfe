// app/dashboard/layout.tsx
import { requireAuth } from '@/lib/authutils'
import { redirect } from 'next/navigation'
import UserSidebar from '@/components/Usersidebar'
import type { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await requireAuth()

    if (session.user.role === 'ADMIN') redirect('/admin')
    if (session.user.firstLogin) redirect('/change-password')

    return (
        <div className="flex min-h-screen bg-slate-50">
            <UserSidebar
                userName={session.user.name ?? ''}
                userEmail={session.user.email ?? ''}
            />
            <main className="flex-1 px-6 py-8">
                <div className="mx-auto max-w-5xl">
                    {children}
                </div>
            </main>
        </div>
    )
}