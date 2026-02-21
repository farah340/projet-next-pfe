import { auth } from '../../../auth'
import { redirect } from 'next/navigation'
import ChangePasswordForm from './ChangePasswordForm'

export default async function ChangePasswordPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    return <ChangePasswordForm userEmail={session.user.email!} />
}
