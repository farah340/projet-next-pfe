import { auth } from '../../lib/auth'
import { redirect } from 'next/navigation'
import ChangePasswordForm from '../../components/ChangePasswordForm'


export default async function ChangePasswordPage() {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }if(session.user.firstLogin === false) {
        redirect('/dashboard')
    }
    return (

        <div className="min-h-screen bg-gray-100" >
            <ChangePasswordForm userEmail={session.user.email!} />
        </div>
    )
}
