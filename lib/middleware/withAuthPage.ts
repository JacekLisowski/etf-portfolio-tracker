import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { getServerSession, Session } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

interface AuthPageProps {
  session: Session
}

/**
 * Check if a session cookie exists (indicates user was previously logged in).
 * NextAuth uses different cookie names based on secure context.
 */
function hasSessionCookie(req: GetServerSidePropsContext['req']): boolean {
  const cookies = req.cookies || {}
  // NextAuth cookie names (secure and non-secure variants)
  return !!(
    cookies['next-auth.session-token'] ||
    cookies['__Secure-next-auth.session-token']
  )
}

/**
 * Higher-order function to protect pages with server-side authentication.
 * Redirects unauthenticated users to signin page with callbackUrl.
 * Detects expired sessions and shows appropriate message.
 *
 * Usage:
 * export const getServerSideProps = withAuthPage(async (context, session) => {
 *   // Your page-specific logic here
 *   return { props: { data } }
 * })
 *
 * Or without additional logic:
 * export const getServerSideProps = withAuthPage()
 */
export function withAuthPage<P extends AuthPageProps = AuthPageProps>(
  handler?: (
    context: GetServerSidePropsContext,
    session: Session
  ) => Promise<GetServerSidePropsResult<P>>
): GetServerSideProps<P> {
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const session = await getServerSession(context.req, context.res, authOptions)

    if (!session) {
      // Preserve the original URL for redirect after login
      const callbackUrl = encodeURIComponent(context.resolvedUrl)

      // Check if session cookie exists but session is null = expired session
      const sessionExpired = hasSessionCookie(context.req)

      const queryParams = sessionExpired
        ? `sessionExpired=true&callbackUrl=${callbackUrl}`
        : `callbackUrl=${callbackUrl}`

      return {
        redirect: {
          destination: `/auth/signin?${queryParams}`,
          permanent: false,
        },
      }
    }

    // If a handler is provided, execute it with session
    if (handler) {
      return handler(context, session)
    }

    // Default: just return session as props
    return {
      props: {
        session,
      } as unknown as P,
    }
  }
}

/**
 * Simple version that just checks auth and returns session.
 * Use this when you don't need additional server-side logic.
 *
 * Usage:
 * export const getServerSideProps = requireAuth
 */
export const requireAuth: GetServerSideProps<AuthPageProps> = withAuthPage()
