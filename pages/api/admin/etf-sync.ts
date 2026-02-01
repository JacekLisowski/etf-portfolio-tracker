import type { NextApiHandler } from 'next'
import { withAuth } from '@/lib/middleware/withAuth'
import { syncEtfsFromTwelveData } from '@/lib/services/etf-sync'
import { ForbiddenError, AppError } from '@/lib/errors'
import type { EtfSyncRequest, EtfSyncResponse } from '@/types/portfolio'

const handler: NextApiHandler = async (req, res) => {
  const user = (req as any).user

  // Check if user is admin
  if (user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required')
  }

  if (req.method === 'POST') {
    try {
      const request: EtfSyncRequest = req.body

      const config = request.config || {
        rateLimit: 60, // Max rate for Twelve Data
      }

      console.log('🚀 ETF Sync triggered by admin:', user.email)
      console.log('Config:', config)

      // Start sync (runs synchronously for now - could be async job later)
      const stats = await syncEtfsFromTwelveData(config)

      const response: EtfSyncResponse = {
        progress: {
          id: 'sync-' + Date.now(),
          status: 'completed',
          totalExchanges: config.exchanges?.length || 9,
          processedExchanges: config.exchanges?.length || 9,
          totalEtfs: stats.totalEtfs,
          processedEtfs: stats.totalEtfs,
          createdInstruments: stats.createdInstruments,
          createdListings: stats.createdListings,
          errors: stats.errors,
          startedAt: new Date(),
          completedAt: new Date(),
          lastError: stats.errorMessages[0],
        },
        message: `Sync completed. Processed ${stats.totalEtfs} ETFs, created ${stats.createdInstruments} instruments and ${stats.createdListings} listings.`,
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

      console.error('Error syncing ETFs:', error)
      return res.status(500).json({
        error: {
          code: 'SYNC_ERROR',
          message: 'Wystąpił błąd podczas synchronizacji ETF',
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
