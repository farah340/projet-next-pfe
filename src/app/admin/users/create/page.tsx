'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import  Retour   from '@/components/Retour'
import { IoCreateOutline } from "react-icons/io5";
import { RiAiGenerate } from "react-icons/ri";
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
        <div className="min-h-screen bg-gray-100">
           <Retour />
            <div className="max-w-6xl mx-auto px-6 py-10">
                <div className="flex items-start gap-4 mb-8">
                    <div className="h-14 w-14 rounded-xl bg-green-800 shadow flex items-center justify-center text-white text-2xl">
                        <IoCreateOutline className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-black leading-tight">Créer un utilisateur</h1>
                        <p className="text-gray-600">Ajouter un nouveau compte à la plateforme</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-black mb-2">
                                    Nom complet <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black placeholder:text-gray-400"
                                    placeholder="Prénom Nom"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-black mb-2">
                                    Ajouter un email <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-2">Numéro de téléphone</label>
                            <input
                                type="tel"
                                value={telephone}
                                onChange={(e) => setTelephone(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black placeholder:text-gray-400"
                                placeholder="+216 12 345 678"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-2">
                                Rôle <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black"
                            >
                                <option value="USER">Utilisateur</option>
                                <option value="ADMIN">Administrateur</option>
                            </select>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-xl font-bold text-black">Mot de passe temporaire</h2>
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-yellow-100 text-yellow-700 text-sm">
                                    
                                </span>
                            </div>

                            <label className="block text-sm font-semibold text-black mb-2">
                                Mot de passe <span className="text-red-600">*</span>
                            </label>

                            <div className="flex flex-col md:flex-row gap-3">
                                <input
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent text-black placeholder:text-gray-400"
                                    placeholder="Entrez un mot de passe"
                                />
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="px-6 py-3 rounded-lg bg-yellow-700 text-white hover:bg-yellow-800 transition font-semibold whitespace-nowrap flex items-center gap-2"
                                >
                                    <RiAiGenerate className="h-5 w-5" />
                                    Générer
                                </button>
                            </div>

                            <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-lg">
                                L'utilisateur devra changer ce mot de passe lors de sa première connexion
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg">
                                <pre className="whitespace-pre-wrap text-sm font-mono">{success}</pre>
                                <button
                                    type="button"
                                    onClick={copyToClipboard}
                                    className="mt-3 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm"
                                >
                                    Copier les identifiants
                                </button>
                            </div>
                        )}

                        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/users')}
                                className="w-full border border-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-800 text-white py-3 rounded-lg hover:bg-green-900 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                {loading ? 'Création...' : "Créer l'utilisateur"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}