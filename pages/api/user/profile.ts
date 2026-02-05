import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const updateProfileSchema = z.object({
  name: z.string().max(100).optional().nullable(),
  language: z.enum(['PL', 'EN']).optional(),
})

type ProfileResponse = {
  id: string
  email: string
  name: string | null
  language: 'PL' | 'EN'
  tier: 'FREE' | 'PREMIUM'
}

type ApiError = {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProfileResponse | ApiError>
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' }
    })
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          language: true,
          tier: true,
        },
      })

      if (!user) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Użytkownik nie znaleziony' }
        })
      }

      return res.json(user)
    } catch (error) {
      console.error('Profile fetch failed:', error)
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Wystąpił nieoczekiwany błąd' }
      })
    }
  }

  if (req.method === 'PUT') {
    const parseResult = updateProfileSchema.safeParse(req.body)

    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nieprawidłowe dane wejściowe',
          details: { zodError: parseResult.error.flatten() }
        }
      })
    }

    const data = parseResult.data

    try {
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          language: true,
          tier: true,
        },
      })

      return res.json(user)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Użytkownik nie znaleziony' }
          })
        }
      }
      console.error('Profile update failed:', error)
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Wystąpił nieoczekiwany błąd' }
      })
    }
  }

  res.setHeader('Allow', ['GET', 'PUT'])
  return res.status(405).json({
    error: { code: 'METHOD_NOT_ALLOWED', message: 'Metoda niedozwolona' }
  })
}
