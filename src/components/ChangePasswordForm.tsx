'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import LogoutButton from '@/components/LogoutButton'

interface ChangePasswordFormProps {
    userEmail: string
}

export default function ChangePasswordForm({ userEmail }: ChangePasswordFormProps) {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { update } = useSession()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas')
            return
        }

        if (newPassword.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            })

            const data = await response.json()

            if (response.ok) {
                // Met à jour le token JWT avec firstLogin: false
                await update({ firstLogin: false })
                // Rechargement complet pour que le middleware/page voit la nouvelle session
                window.location.replace('/dashboard')
            } else {
                setError(data.error || 'Erreur lors du changement de mot de passe')
            }
        } catch {
            setError('Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex justify-end mb-4">
                    <LogoutButton />
                </div>
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Changer votre mot de passe
                </h1>

                <p className="text-gray-600 mb-6 text-center">
                    C'est votre première connexion. Veuillez définir un nouveau mot de passe.
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmer le nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Chargement...' : 'Changer le mot de passe'}
                    </button>
                </form>
            </div>
        </div>
    )
}