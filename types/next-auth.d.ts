import { Role, SubscriptionTier } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: Role
      tier: SubscriptionTier
    }
  }

  interface User {
    role: Role
    tier: SubscriptionTier
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: Role
    tier?: SubscriptionTier
  }
}
