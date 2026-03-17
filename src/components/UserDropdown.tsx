'use client'

type User = { id: string; nom: string; email: string }

type Props = {
  selectedUsers: string[]
  onChange: (ids: string[]) => void
  label: string
  users: User[]
}

const initials = (nom: string) =>
  nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export default function UserDropdown({ selectedUsers, onChange, label, users }: Props) {
  const toggle = (id: string) => {
    onChange(
      selectedUsers.includes(id)
        ? selectedUsers.filter(u => u !== id)
        : [...selectedUsers, id]
    )
  }

  return (
    <div className="mt-3 border-t border-amber-200 pt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
          Accès {label} ({selectedUsers.length}/{users.length})
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(users.map(u => u.id))}
            className="text-xs text-amber-600 hover:text-amber-800 font-medium"
          >
            Tous
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Aucun
          </button>
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
        {users.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-3">
            Aucun utilisateur trouvé
          </p>
        ) : (
          users.map(user => {
            const selected = selectedUsers.includes(user.id)
            return (
              <div
                key={user.id}
                onClick={() => toggle(user.id)}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors
                  ${selected ? 'bg-amber-100' : 'hover:bg-gray-50'}`}
              >
                {/* Checkbox */}
                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all
                  ${selected ? 'bg-amber-500' : 'border-2 border-gray-300 bg-white'}`}>
                  {selected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                  ${selected ? 'bg-amber-500' : 'bg-gray-400'}`}>
                  {initials(user.nom)}
                </div>

                {/* Nom + email */}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium truncate ${selected ? 'text-amber-900' : 'text-gray-700'}`}>
                    {user.nom}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}