'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import UserDropdown from '@/components/UserDropdown'

type User = { id: string; nom: string; email: string }

type PermissionState = {
  voir: boolean
  creer: boolean
  modifier: boolean
  supprimer: boolean
}

type UserPermState = {
  modifier: string[]
  supprimer: string[]
}

const PERMISSION_LABELS: Record<string, string> = {
  voir: 'Voir',
  creer: 'Creer',
  modifier: 'Modifier',
  supprimer: 'Supprimer',
}

export default function CreateRolePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState<PermissionState>({
    voir: false, creer: false, modifier: false, supprimer: false,
  })
  const [userPerms, setUserPerms] = useState<UserPermState>({
    modifier: [], supprimer: [],
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => setUsers(data))
      .catch(() => setUsers([]))
  }, [])

  const totalSelected = Object.values(permissions).filter(Boolean).length

  const togglePerm = (key: keyof PermissionState) => {
    setPermissions(p => {
      const next = { ...p, [key]: !p[key] }
      if (p[key] && (key === 'modifier' || key === 'supprimer')) {
        setUserPerms(u => ({ ...u, [key]: [] }))
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Le nom du rôle est requis.'); return }
    setLoading(true)
    setError('')

    const permList = (Object.keys(permissions) as (keyof PermissionState)[])
      .filter(action => permissions[action])
      .map(action => ({
        resource: 'utilisateurs',
        action: action,
        userIds: (action === 'modifier' || action === 'supprimer')
          ? userPerms[action]
          : [],
      }))

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          permissions: permList,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la création.')
        return
      }

      router.push('/admin/roles')
    } catch {
      setError('Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  // Permissions simples (Voir, Créer) — affichées en grille 2 colonnes
  const simplePerms = (['voir', 'creer'] as const)
  // Permissions avec dropdown (Modifier, Supprimer) — affichées en pleine largeur
  const dropdownPerms = (['modifier', 'supprimer'] as const)

  return (

    <div className="min-h-screen bg-gray-50 py-6 px-2">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        
        <div className="flex items-start justify-between mb-2">
          <button
            onClick={() => router.push('/admin/roles')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux rôles
          </button>
        </div>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Créer un rôle</h1>
            <p className="text-sm text-gray-500 mt-1">Définissez un nom et les permissions associées.</p>
          </div>
          {totalSelected > 0 && (
            <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg font-medium">
              {totalSelected} permission{totalSelected > 1 ? 's' : ''} sélectionnée{totalSelected > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Informations
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ">
                Nom du rôle <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ex: Superviseur, Lecteur, Gestionnaire..."
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Décrivez brièvement ce rôle..."
                rows={3}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none text-black"
              />
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Permissions
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Utilisateurs
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {totalSelected}/4
              </span>
            </div>
          </div>

          <div className="space-y-3">

            {/* Voir + Créer — grille 2 colonnes, sans dropdown */}
            <div className="grid grid-cols-2 gap-3">
              {simplePerms.map(key => {
                const checked = permissions[key]
                return (
                  <div
                    key={key}
                    onClick={() => togglePerm(key)}
                    className={`rounded-xl border p-3 cursor-pointer transition-all
                      ${checked
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 select-none">
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all
                        ${checked ? 'bg-amber-500' : 'border-2 border-gray-300 bg-white'}`}
                      >
                        {checked && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${checked ? 'text-amber-800' : 'text-gray-700'}`}>
                        {PERMISSION_LABELS[key]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modifier + Supprimer — pleine largeur, avec liste utilisateurs */}
            {dropdownPerms.map(key => {
              const checked = permissions[key]
              return (
                <div
                  key={key}
                  className={`rounded-xl border transition-all
                    ${checked
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  {/* Header de la carte — cliquable pour cocher */}
                  <div
                    onClick={() => togglePerm(key)}
                    className="flex items-center gap-2.5 p-3 cursor-pointer select-none"
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all
                      ${checked ? 'bg-amber-500' : 'border-2 border-gray-300 bg-white'}`}
                    >
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${checked ? 'text-amber-800' : 'text-gray-700'}`}>
                      {PERMISSION_LABELS[key]}
                    </span>
                    {checked && (
                      <span className="ml-auto text-xs text-amber-600 font-medium">
                        {userPerms[key].length} utilisateur{userPerms[key].length !== 1 ? 's' : ''} sélectionné{userPerms[key].length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Liste utilisateurs — visible uniquement si coché */}
                  {checked && (
                    <div className="px-3 pb-3">
                      <UserDropdown
                        label={PERMISSION_LABELS[key]}
                        users={users}
                        selectedUsers={userPerms[key]}
                        onChange={ids => setUserPerms(u => ({ ...u, [key]: ids }))}
                      />
                    </div>
                  )}
                </div>
              )
            })}

          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#6c63ff] rounded-lg hover:bg-[#5a51e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Création...' : 'Créer le rôle'}
          </button>
        </div>

      </div>
    </div>
  )
}