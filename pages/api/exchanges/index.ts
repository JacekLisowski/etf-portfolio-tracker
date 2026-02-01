import type { NextApiHandler } from 'next'
import { getExchanges } from '@/lib/services/exchange'
import type { ExchangesResponse } from '@/types/portfolio'

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const exchanges = await getExchanges()

      const response: ExchangesResponse = {
        exchanges,
      }

      return res.status(200).json(response)
    } catch (error) {
      console.error('Error fetching exchanges:', error)
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Wystąpił błąd podczas pobierania giełd',
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

export default handler
