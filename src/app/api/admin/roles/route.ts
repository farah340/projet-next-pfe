// app/api/admin/roles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/authutils'
import prisma from '@/lib/bd'

// ── POST /api/admin/roles  →  créer un rôle ──
export async function POST(req: NextRequest) {
    try {
        await requireAdmin()

        const { name, description, permissions } = await req.json()
        // permissions: { resource: string, actions: string[] }[]

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'Nom du rôle requis' }, { status: 400 })
        }

        // Aplatir les permissions en lignes individuelles
        const permRows: { resource: string; action: string }[] = []
        for (const p of permissions ?? []) {
            for (const action of p.actions ?? []) {
                permRows.push({ resource: p.resource, action })
            }
        }

        const role = await prisma.customRole.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                permissions: {
                    create: permRows,
                },
            },
            include: { permissions: true },
        })

        return NextResponse.json(role, { status: 201 })
    } catch (err: any) {
        if (err?.code === 'P2002') {
            return NextResponse.json({ error: 'Un rôle avec ce nom existe déjà' }, { status: 409 })
        }
        console.error(err)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// ── GET /api/admin/roles  →  lister tous les rôles ──
export async function GET() {
    try {
        await requireAdmin()

        const roles = await prisma.customRole.findMany({
            include: {
                permissions: true,
                _count: { select: { users: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(roles)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

// ── DELETE /api/admin/roles?id=xxx  →  supprimer un rôle ──
export async function DELETE(req: NextRequest) {
    try {
        await requireAdmin()

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

        await prisma.customRole.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}