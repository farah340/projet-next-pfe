import { requireAdmin } from '@/lib/authutils'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'

export default async function AdminPage() {
    const session = await requireAdmin()

   

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Dashboard Administrateur</h1>
                        <LogoutButton />
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                        <h2 className="text-xl font-semibold mb-2">Panneau Admin</h2>
                        <p className="text-gray-700">
                            Connecté en tant que : <strong>{session.user.email}</strong>
                        </p>
                        <p className="text-gray-700">
                            Rôle : <span className="bg-purple-200 px-2 py-1 rounded font-semibold">ADMIN</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/admin/users/create">
                            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                                <h3 className="font-semibold mb-2">➕ Créer un utilisateur</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    Ajouter un nouveau compte utilisateur
                                </p>
                                <div className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center">
                                    Accéder
                                </div>
                            </div>
                        </Link>

                        <Link href="/admin/users">
                            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                                <h3 className="font-semibold mb-2">👥 Gérer les utilisateurs</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    Voir, modifier, supprimer les utilisateurs
                                </p>
                                <div className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full text-center">
                                    Accéder
                                </div>
                            </div>
                        </Link>

                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                            <h3 className="font-semibold mb-2">📊 Statistiques globales</h3>
                            <p className="text-gray-600 text-sm mb-3">
                                Voir les stats de la plateforme
                            </p>
                            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full">
                                Accéder
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}