import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

type CheckEmailResponse =
  | { available: true }
  | { error: string; message: string }

/**
 * Check if email is available for registration.
 *
 * Note: Rate limiting for Magic Links is handled in NextAuth's sendVerificationRequest,
 * not here. This endpoint is a read-only check that doesn't consume rate limit tokens.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckEmailResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed',
    })
  }

  const { email } = req.body

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      error: 'INVALID_EMAIL',
      message: 'Email jest wymagany',
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'INVALID_EMAIL_FORMAT',
      message: 'Nieprawidłowy format email',
    })
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    })

    if (existingUser) {
      return res.status(409).json({
        error: 'EMAIL_EXISTS',
        message: 'Ten email jest już zarejestrowany',
      })
    }

    return res.status(200).json({ available: true })
  } catch {
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Wystąpił błąd serwera',
    })
  }
}
