'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

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
        href: '/dashboard/map',
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
        href: '/dashboard/zones',
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
        href: '/dashboard/analyses',
        label: 'Analyses',
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

export default function UserSidebar({ userName, userEmail }: { userName: string; userEmail: string }) {
    const [expanded, setExpanded] = useState(true)
    const pathname = usePathname()

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
                {/* Header */}
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

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 pt-3">
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
                </nav>

                {/* User + Logout */}
                <div className={`border-t border-slate-200/60 p-3 ${!expanded ? 'flex flex-col items-center gap-2' : ''}`}>
                    {expanded ? (
                        <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-slate-800">{userName}</p>
                                <p className="truncate text-[10px] text-slate-400">{userEmail}</p>
                            </div>
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