import type { NextApiHandler } from 'next'
import { withAuth } from '@/lib/middleware/withAuth'
import { getUserPortfolio } from '@/lib/services/portfolio'
import { AppError } from '@/lib/errors'
import type { PortfolioResponse } from '@/types/portfolio'

const handler: NextApiHandler = async (req, res) => {
  const user = (req as any).user

  if (req.method === 'GET') {
    try {
      const portfolio = await getUserPortfolio(user.id)

      if (!portfolio) {
        return res.status(200).json({
          portfolio: null,
          transactions: [],
        })
      }

      const response: PortfolioResponse = {
        portfolio: {
          id: portfolio.id,
          userId: portfolio.userId,
          name: portfolio.name,
          createdAt: portfolio.createdAt,
          updatedAt: portfolio.updatedAt,
        },
        transactions: portfolio.transactions || [],
      }

      return res.status(200).json(response)
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        })
      }

      console.error('Error fetching portfolio:', error)
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Wystąpił błąd podczas pobierania portfolio',
        },
      })
    }
  }

  return res.status(405).json({
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Metoda nie jest dozwolona',
    },
  })
}

export default withAuth(handler)
