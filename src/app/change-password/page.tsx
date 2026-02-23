import { auth } from '../../lib/auth'
import { redirect } from 'next/navigation'
import ChangePasswordForm from './ChangePasswordForm'


export default async function ChangePasswordPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    return (

        <div className="min-h-screen bg-gray-100" >
            <ChangePasswordForm userEmail={session.user.email!} />
        </div>
    )
}
