import { requireAuth } from '@/lib/authutils'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
    const session = await requireAuth()

    // Rediriger si première connexion
    if (session.user.firstLogin) {
        redirect('/change-password')
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Dashboard Utilisateur</h1>
                        <LogoutButton />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h2 className="text-xl font-semibold mb-2">Bienvenue !</h2>
                        <p className="text-gray-700">
                            Connecté en tant que : <strong>{session.user.email}</strong>
                        </p>
                        <p className="text-gray-700">
                            Nom : <strong>{session.user.name}</strong>
                        </p>
                        <p className="text-gray-700">
                            Rôle : <span className="bg-blue-200 px-2 py-1 rounded">{session.user.role}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Définir une zone géographique</h3>
                            <p className="text-gray-600 text-sm mb-3">
                                Sélectionnez une zone pour analyser le marché
                            </p>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                Nouvelle zone
                            </button>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Mes analyses</h3>
                            <p className="text-gray-600 text-sm mb-3">
                                Consulter vos rapports d'analyse
                            </p>
                            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                                Voir les rapports
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}