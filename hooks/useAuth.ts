import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    isAdmin: session?.user?.role === 'ADMIN',
    isPremium: session?.user?.tier === 'PREMIUM',
    session,
  }
}
