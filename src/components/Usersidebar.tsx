'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import LogoutButton from '@/components/LogoutButton'

// ── Types ──────────────────────────────────────────────────────
type Permission = 'voir' | 'modifier' | 'creer' | 'supprimer'

// ── Nav principale (tous les utilisateurs) ─────────────────────
const navItems = [
    {
        href: '/dashboard',
        label: 'Tableau de bord',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        href: '/dashboard/recherche-zone',
        label: 'Rechercher une zone',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
    },
    {
        href: '/dashboard/zones/list',
        label: 'Mes zones',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
            </svg>
        ),
    },
    {
        href: '/dashboard/comparaison',
        label: 'Comparaison',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <line x1="2" y1="20" x2="22" y2="20" />
            </svg>
        ),
    },
    {
        href: '/dashboard/rapports',
        label: 'Rapports',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
]

// ── Actions utilisateurs (conditionnelles selon permission) ─────
const userActionItems = [
    {
        permission: 'creer' as Permission,
        href: '/dashboard/users/create',
        label: 'Créer utilisateur',
        color: 'text-emerald-600',
        hoverBg: 'hover:bg-emerald-50',
        dotColor: 'bg-emerald-500',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
        ),
    },
    {
        permission: 'modifier' as Permission,
        href: '/dashboard/users/edit',
        label: 'Modifier utilisateurs',
        color: 'text-blue-600',
        hoverBg: 'hover:bg-blue-50',
        dotColor: 'bg-blue-500',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
        ),
    },
    {
        permission: 'supprimer' as Permission,
        href: '/dashboard/users/delete',
        label: 'Supprimer utilisateurs',
        color: 'text-red-600',
        hoverBg: 'hover:bg-red-50',
        dotColor: 'bg-red-500',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
        ),
    },
]

// ── Composant ──────────────────────────────────────────────────
export default function UserSidebar({ userName, userEmail }: { userName: string; userEmail: string }) {
    const [expanded, setExpanded] = useState(true)
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()
    const { data: session } = useSession()

    useEffect(() => {
        setMounted(true)
    }, [])

    // ── Permissions depuis la session ──────────────────────────
    const permissions: Permission[] = (session?.user?.permissions as Permission[]) ?? []
    const can = (p: Permission) => permissions.includes(p)
    const showUserActions = mounted && (can('creer') || can('modifier') || can('supprimer'))

    const initials = userName
        ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?'

    return (
        <>
            <aside className={`
                fixed left-0 top-0 z-40 flex h-full flex-col
                border-r border-slate-200/70 bg-white shadow-sm
                transition-all duration-300 ease-in-out
                ${expanded ? 'w-60' : 'w-[68px]'}
            `}>

                {/* ── Header ────────────────────────────────── */}
                <div className={`flex h-16 items-center border-b border-slate-200/60 px-3 ${expanded ? 'justify-between' : 'justify-center'}`}>
                    {expanded && (
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                                M&M
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 leading-tight">MarketMap</p>
                                <p className="text-[10px] text-slate-400 leading-tight">Analyses géographiques</p>
                            </div>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => setExpanded(v => !v)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        aria-label={expanded ? 'Réduire' : 'Agrandir'}
                    >
                        {expanded ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* ── Nav principale ─────────────────────────── */}
                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 pt-3">
                    {navItems.map((item) => {
                        const active = mounted && pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={!expanded ? item.label : undefined}
                                className={`
                                    group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                                    transition-colors duration-150
                                    ${active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                                    ${!expanded ? 'justify-center' : ''}
                                `}
                            >
                                <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                    {item.icon}
                                </span>
                                {expanded && <span className="truncate">{item.label}</span>}
                            </Link>
                        )
                    })}

                    {/* ── Section permissions utilisateurs ─────── */}
                    {showUserActions && (
                        <div className="mt-2">
                            {/* Séparateur avec label */}
                            {expanded ? (
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <div className="h-px flex-1 bg-slate-200" />
                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                        Utilisateurs
                                    </span>
                                    <div className="h-px flex-1 bg-slate-200" />
                                </div>
                            ) : (
                                <div className="mx-3 my-2 h-px bg-slate-200" />
                            )}

                            {/* Boutons conditionnels */}
                            {userActionItems.map((action) => {
                                if (!can(action.permission)) return null
                                const active = mounted && pathname === action.href

                                return (
                                    <Link
                                        key={action.href}
                                        href={action.href}
                                        title={!expanded ? action.label : undefined}
                                        className={`
                                            group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                                            transition-colors duration-150
                                            ${active
                                                ? 'bg-slate-100 ' + action.color
                                                : action.color + ' ' + action.hoverBg
                                            }
                                            ${!expanded ? 'justify-center' : ''}
                                        `}
                                    >
                                        <span className="flex-shrink-0">{action.icon}</span>
                                        {expanded && (
                                            <span className="truncate">{action.label}</span>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </nav>

                {/* ── Footer : user + badge rôle + logout ─────── */}
                <div className={`border-t border-slate-200/60 p-3 ${!expanded ? 'flex flex-col items-center gap-2' : ''}`}>
                    {expanded ? (
                        <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                                {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-slate-800">{userName}</p>
                                <p className="truncate text-[10px] text-slate-400">{userEmail}</p>
                            </div>
                            {/* Badge rôle */}
                            {session?.user?.role && (
                                <span className="flex-shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                    {session.user.role as string}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700 mb-1">
                            {initials}
                        </div>
                    )}
                    <LogoutButton />
                </div>
            </aside>

            {/* Spacer */}
            <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${expanded ? 'w-60' : 'w-[68px]'}`} />
        </>
    )
}