'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    {
        href: '/admin/users/create',
        label: 'Créer un utilisateur',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
        ),
    },
    {
        href: '/admin/users',
        label: 'Gérer les utilisateurs',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        href: '/admin/roles',
        label: 'Rôles & Permissions',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="10" y1="10" x2="14" y2="10" />
            </svg>
        ),
    },
    {
        href: '/admin/stats',
        label: 'Statistiques',
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
]

export default function AdminSidebar({ topRight }: { topRight?: ReactNode }) {
    const [expanded, setExpanded] = useState(true)
    const pathname = usePathname()

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
                                <p className="text-[10px] text-slate-400 leading-tight">Administration</p>
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

                {/* ── Nav ───────────────────────────────────── */}
                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 pt-3">

                    {/* Dashboard */}
                    <Link
                        href="/admin"
                        title={!expanded ? 'Dashboard' : undefined}
                        className={`
                            group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                            transition-colors duration-150
                            ${pathname === '/admin'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                            ${!expanded ? 'justify-center' : ''}
                        `}
                    >
                        <span className={`flex-shrink-0 ${pathname === '/admin' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                        </span>
                        {expanded && <span className="truncate">Dashboard</span>}
                    </Link>

                    {/* Séparateur */}
                    <div className="my-1 border-t border-slate-100" />

                    {/* Nav items */}
                    {navItems.map((item) => {
                        const active = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={!expanded ? item.label : undefined}
                                className={`
                                    group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                                    transition-colors duration-150
                                    ${active
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
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
                </nav>

                {/* ── Footer logout ──────────────────────────── */}
                {topRight && (
                    <div className={`border-t border-slate-200/60 p-3 ${!expanded ? 'flex justify-center' : ''}`}>
                        {topRight}
                    </div>
                )}
            </aside>

            {/* Spacer */}
            <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${expanded ? 'w-60' : 'w-[68px]'}`} />
        </>
    )
}