import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@/lib/auth/session'
import { UnauthorizedError } from '@/lib/errors'

export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getSession(req, res)

      if (!session?.user) {
        throw new UnauthorizedError()
      }

      // Attach user to request for convenience
      ;(req as any).user = session.user

      return handler(req, res)
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return res.status(401).json({
          error: {
            code: error.code,
            message: error.message,
          },
        })
      }
      throw error
    }
  }
}
