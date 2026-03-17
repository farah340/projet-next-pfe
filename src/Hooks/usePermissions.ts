"use client"

import { useSession } from "next-auth/react"
import { hasPermission, hasAnyPermission, Permission } from "@/lib/permissions"

export function usePermissions() {
  const { data: session } = useSession()
  const permissions = session?.user?.permissions ?? []
  const role        = session?.user?.role ?? ""

  return {
    role,
    permissions,
    can:    (p: Permission)   => hasPermission(permissions, p),
    canAny: (ps: Permission[]) => hasAnyPermission(permissions, ps),
    isAdmin: role === "ADMIN",
  }
}