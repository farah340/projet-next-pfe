import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/authutils'
import prisma from '@/lib/bd'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const body = await req.json()
    const { name, description, permissions, userIds } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Nom du rôle requis' }, { status: 400 })
    }

    const permRows = (permissions ?? [])
      .filter((p: any) => p && typeof p.action === 'string' && typeof p.resource === 'string')
      .map((p: any) => ({ resource: p.resource, action: p.action }))

    const role = await prisma.customRole.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        permissions: { create: permRows },
      },
      include: { permissions: true },
    })

    if (Array.isArray(userIds) && userIds.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { customRoleId: role.id },
      })
    }

    return NextResponse.json(role, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Un rôle avec ce nom existe déjà' }, { status: 409 })
    }
    console.error('ERREUR POST ROLE:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
  try {
    await requireAdmin()

    const PERMISSION_NAMES = ['modifier', 'supprimer', 'consulter']

    const roles = await prisma.customRole.findMany({
      where: {
        NOT: { name: { in: PERMISSION_NAMES } }
      },
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
