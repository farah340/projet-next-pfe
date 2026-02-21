import { requireAuth } from '@/lib/authutils'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
    try {
        const session = await requireAuth()

        // Rediriger si première connexion (temporairement désactivé pour tester)
        // if (session.user.firstLogin) {
        //     redirect('/change-password')
        // }

        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-10 sm:px-6">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
                        <div className="flex flex-col gap-4 border-b border-slate-200/60 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                    Dashboard Utilisateur
                                </h1>
                                <p className="mt-1 text-sm text-slate-600">
                                    Accédez rapidement à vos zones, analyses et rapports.
                                </p>
                            </div>
                            <div className="shrink-0">
                                <LogoutButton />
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">Bienvenue !</h2>
                                        <p className="mt-1 text-sm text-slate-700">
                                            Vous êtes connecté en tant que{' '}
                                            <span className="font-semibold text-slate-900">{session.user.email}</span>
                                        </p>
                                        <p className="mt-1 text-sm text-slate-700">
                                            Nom : <span className="font-semibold text-slate-900">{session.user.name}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center">
                                        <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                            {session.user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                                    Actions rapides
                                </h3>

                                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="group rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="text-base font-semibold text-slate-900">
                                                    Définir une zone géographique
                                                </h4>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    Sélectionnez une zone pour analyser le marché
                                                </p>
                                            </div>
                                            <div className="h-10 w-10 rounded-lg bg-blue-50 ring-1 ring-blue-100" />
                                        </div>
                                        <div className="mt-4">
                                            <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                                                Nouvelle zone
                                            </button>
                                        </div>
                                    </div>

                                    <div className="group rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="text-base font-semibold text-slate-900">Mes analyses</h4>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    Consulter vos rapports d'analyse
                                                </p>
                                            </div>
                                            <div className="h-10 w-10 rounded-lg bg-slate-50 ring-1 ring-slate-200" />
                                        </div>
                                        <div className="mt-4">
                                            <button className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2">
                                                Voir les rapports
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        console.error('Dashboard error:', error)
        redirect('/login')
    }
}