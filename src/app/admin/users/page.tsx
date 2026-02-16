import { requireAdmin } from '@/lib/authutils'

export default async function AdminUsersPage() {
    await requireAdmin()

    return (
        <div>
            <h1>Admin Users Management</h1>
            <p>User management interface coming soon...</p>
        </div>
    )
}
