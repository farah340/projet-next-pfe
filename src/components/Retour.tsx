'use client'
import { useRouter } from 'next/navigation'
import { IoReturnUpBackSharp } from "react-icons/io5";
export default function Retour() {
    const router = useRouter()
    return (
     <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <button
                        type="button"
                        onClick={() => router.push('/admin')}
                        className="text-gray-700 hover:text-black flex items-center gap-2"
                    >
                         <IoReturnUpBackSharp className="h-5 w-5 text-gray-700" />
                         <span className="font-medium ">Retour</span>
                    </button>
                </div>
            </div>
    )
}