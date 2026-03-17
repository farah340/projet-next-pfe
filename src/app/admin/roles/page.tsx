// src/app/admin/roles/page.tsx
import { requireAdmin } from '@/lib/authutils'
import prisma from '@/lib/bd'
import Link from 'next/link'
import RolesListClient from '@/components/Roleslistclient'

export default async function RolesPage() {
  await requireAdmin()

  const roles = await prisma.customRole.findMany({
    include: {
      permissions: true,
      _count: { select: { users: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const formattedRoles = roles.map(role => ({
    ...role,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  }))

  return <RolesListClient roles={formattedRoles} />
}