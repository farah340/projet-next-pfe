import { auth } from './src/lib/auth'
import { NextResponse } from 'next/server'

const PERMISSION_ROUTES: Record<string, string> = {
     '/admin/users/create':      'creer',
    '/admin/users/edit':        'modifier',
    '/admin/users/delete':      'supprimer',
    '/dashboard/users/create':  'creer',
    '/dashboard/users/edit':    'modifier',
    '/dashboard/users/delete':  'supprimer', 
}

export default auth((req) => {
    const token = req.auth
    const path  = req.nextUrl.pathname

    const publicRoutes = ['/login', '/api/auth']
    const isPublicRoute = publicRoutes.some(route => path.startsWith(route))
    if (isPublicRoute) return NextResponse.next()

    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (path.startsWith('/admin')) {
        const userRole        = token?.user?.role
        const userPermissions = (token?.user?.permissions ?? []) as string[]

        if (userRole === 'ADMIN') {
            return NextResponse.next()
        }

        if (userRole === 'CUSTOM') {
            const requiredPermission = Object.entries(PERMISSION_ROUTES).find(
                ([route]) => path.startsWith(route)
            )?.[1]

            console.log('=== MIDDLEWARE DEBUG ===')
            console.log('path:', path)
            console.log('requiredPermission:', requiredPermission)
            console.log('userPermissions:', userPermissions)
            console.log('hasPermission:', requiredPermission && userPermissions.includes(requiredPermission))
            console.log('========================')

            // Temporaire: autoriser l'accès à /admin/users/create
            if (path === '/admin/users/create') {
                console.log('Accès temporairement autorisé à /admin/users/create')
                return NextResponse.next()
            }

            if (requiredPermission && userPermissions.includes(requiredPermission)) {
                return NextResponse.next()
            }

            return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ]
}