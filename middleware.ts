import { auth } from './auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
    const token = req.auth
    const path = req.nextUrl.pathname

    // Liste des routes publiques (accessibles sans authentification)
    const publicRoutes = ['/login', '/api/auth']

    // Vérifier si la route est publique
    const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

    if (isPublicRoute) {
        return NextResponse.next()
    }

    // Bloquer si pas authentifié
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // Bloquer /admin si pas ADMIN
    if (path.startsWith('/admin') && token?.user?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Autoriser l'accès
    return NextResponse.next()
})

export const config = {
    matcher: [
        /*
         * Match toutes les routes sauf :
         * - api/auth (NextAuth)
         * - _next/static (fichiers statiques)
         * - _next/image (optimisation d'images)
         * - favicon.ico
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ]
}