export type Permission = "voir" | "modifier" | "créer" | "supprimer"

// Côté client (composants)
export function hasPermission(
  permissions: string[] | undefined,
  permission: Permission
): boolean {
  return permissions?.includes(permission) ?? false
}

export function hasAnyPermission(
  permissions: string[] | undefined,
  required: Permission[]
): boolean {
  return required.some(p => hasPermission(permissions, p))
}