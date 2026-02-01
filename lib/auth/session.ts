import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import type { NextApiRequest, NextApiResponse } from 'next'

export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  return await getServerSession(req, res, authOptions)
}

export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res)

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  return session
}

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res)

  if (session.user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }

  return session
}
