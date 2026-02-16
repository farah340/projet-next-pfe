import { DefaultSession } from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: Role
            firstLogin: boolean
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: Role
        firstLogin?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: Role
        firstLogin: boolean
    }
}
