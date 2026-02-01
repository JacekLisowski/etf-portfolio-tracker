import type { NextApiHandler } from 'next'
import { withAuth } from '@/lib/middleware/withAuth'
import { createTransaction, getUserTransactions } from '@/lib/services/transaction'
import { AppError } from '@/lib/errors'
import type {
  TransactionsResponse,
  TransactionResponse,
  CreateTransactionRequest,
  GetTransactionsRequest,
} from '@/types/portfolio'

const handler: NextApiHandler = async (req, res) => {
  const user = (req as any).user

  if (req.method === 'POST') {
    try {
      const data: CreateTransactionRequest = req.body

      const transaction = await createTransaction(user.id, data)

      const response: TransactionResponse = {
        transaction,
      }

      return res.status(201).json(response)
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

      console.error('Error creating transaction:', error)
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Wystąpił błąd podczas tworzenia transakcji',
        },
      })
    }
  }

  if (req.method === 'GET') {
    try {
      const { etfId, type, startDate, endDate, limit, offset } = req.query

      const params: GetTransactionsRequest = {
        etfId: etfId as string | undefined,
        type: type as 'BUY' | 'SELL' | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      }

      const { transactions, total } = await getUserTransactions(user.id, params)

      const response: TransactionsResponse = {
        transactions,
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

      console.error('Error fetching transactions:', error)
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Wystąpił błąd podczas pobierania transakcji',
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
