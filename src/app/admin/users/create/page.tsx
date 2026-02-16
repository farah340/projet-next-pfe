'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateUserPage() {
    const [email, setEmail] = useState('')
    const [nom, setNom] = useState('')
    const [telephone, setTelephone] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('USER')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Générer un mot de passe aléatoire sécurisé
    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
        let pwd = ''
        for (let i = 0; i < 12; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setPassword(pwd)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const response = await fetch('/api/admin/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, nom, telephone, password, role }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Erreur lors de la création')
            } else {
                setSuccess(`✅ Utilisateur créé avec succès !

📧 Identifiants à communiquer :
Email : ${email}
Mot de passe temporaire : ${password}

⚠️ L'utilisateur devra changer ce mot de passe à sa première connexion.`)

                // Reset form après 5 secondes
                setTimeout(() => {
                    setEmail('')
                    setNom('')
                    setTelephone('')
                    setPassword('')
                    setSuccess('')
                }, 5000)
            }
        } catch (error) {
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        const text = `Identifiants de connexion :
Email : ${email}
Mot de passe : ${password}

Lien de connexion : ${window.location.origin}/login

Note : Vous devrez changer ce mot de passe à votre première connexion.`

        navigator.clipboard.writeText(text)
        alert('Copié dans le presse-papier !')
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/admin')}
                        className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                        ← Retour au dashboard
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold mb-6">Créer un Utilisateur</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="utilisateur@exemple.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom complet *
                            </label>
                            <input
                                type="text"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Prénom Nom"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                value={telephone}
                                onChange={(e) => setTelephone(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="+216 12 345 678"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mot de passe temporaire *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                    placeholder="••••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition whitespace-nowrap"
                                >
                                    🎲 Générer
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                💡 L'utilisateur devra changer ce mot de passe à sa première connexion
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rôle *
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="USER">👤 Utilisateur</option>
                                <option value="ADMIN">👑 Administrateur</option>
                            </select>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
                                ❌ {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg">
                                <pre className="whitespace-pre-wrap text-sm font-mono">{success}</pre>
                                <button
                                    type="button"
                                    onClick={copyToClipboard}
                                    className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                                >
                                    📋 Copier les identifiants
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {loading ? '⏳ Création en cours...' : '➕ Créer l\'utilisateur'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}