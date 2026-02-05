import { Role, SubscriptionTier, Language } from '@prisma/client'
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
      language: Language
    }
  }

  interface User {
    role: Role
    tier: SubscriptionTier
    name?: string | null
    language: Language
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: Role
    tier?: SubscriptionTier
    name?: string | null
    language?: Language
  }
}
