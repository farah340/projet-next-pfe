'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type EditableUser = {
    id: string
    email: string
    nom: string
    telephone: string | null
    role: 'ADMIN' | 'USER'
    firstLogin: boolean
}

export default function EditUserForm({ user }: { user: EditableUser }) {
    const router = useRouter()
    const [email, setEmail] = useState(user.email)
    const [nom, setNom] = useState(user.nom)
    const [telephone, setTelephone] = useState(user.telephone ?? '')
    const [role, setRole] = useState<'ADMIN' | 'USER'>(user.role)
    const [firstLogin, setFirstLogin] = useState<boolean>(user.firstLogin)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const res = await fetch('/api/admin/users/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    email,
                    nom,
                    telephone,
                    role,
                    firstLogin,
                }),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                setError(data?.error || 'Erreur lors de la modification')
                return
            }

            setSuccess('Utilisateur modifié avec succès')
            router.refresh()

            setTimeout(() => {
                router.push('/admin/users')
                router.refresh()
            }, 600)
        } catch {
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/users')}
                        className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                        ← Retour à la liste
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold mb-6">Modifier un utilisateur</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                            <input
                                type="text"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                            <input
                                type="tel"
                                value={telephone}
                                onChange={(e) => setTelephone(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rôle *</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as 'ADMIN' | 'USER')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="USER">Utilisateur</option>
                                <option value="ADMIN">Administrateur</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                id="firstLogin"
                                type="checkbox"
                                checked={firstLogin}
                                onChange={(e) => setFirstLogin(e.target.checked)}
                                className="h-4 w-4"
                            />
                            <label htmlFor="firstLogin" className="text-sm text-gray-700">
                                Forcer le changement de mot de passe à la prochaine connexion
                            </label>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {loading ? '⏳ Enregistrement...' : '💾 Enregistrer'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
