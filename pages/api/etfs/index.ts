import type { NextApiHandler } from 'next'
import { withAuth } from '@/lib/middleware/withAuth'
import { searchEtfs } from '@/lib/services/etf'
import { AppError } from '@/lib/errors'
import type { EtfsResponse, SearchEtfsRequest } from '@/types/portfolio'

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const { search, exchangeId, limit, offset } = req.query

      const params: SearchEtfsRequest = {
        search: search as string | undefined,
        exchangeId: exchangeId as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      }

      const { etfs, total } = await searchEtfs(params)

      const response: EtfsResponse = {
        etfs,
        total,
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

      console.error('Error searching ETFs:', error)
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Wystąpił błąd podczas wyszukiwania ETF',
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
