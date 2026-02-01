import type { NextApiHandler } from 'next'
import { withAuth } from '@/lib/middleware/withAuth'
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from '@/lib/services/transaction'
import { AppError } from '@/lib/errors'
import type { TransactionResponse, UpdateTransactionRequest } from '@/types/portfolio'

const handler: NextApiHandler = async (req, res) => {
  const user = (req as any).user
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: 'ID transakcji jest nieprawidłowe',
      },
    })
  }

  if (req.method === 'GET') {
    try {
      const transaction = await getTransactionById(user.id, id)

      const response: TransactionResponse = {
        transaction,
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

      console.error('Error fetching transaction:', error)
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Wystąpił błąd podczas pobierania transakcji',
        },
      })
    }
  }

  if (req.method === 'PUT') {
    try {
      const data: UpdateTransactionRequest = req.body

      const transaction = await updateTransaction(user.id, id, data)

      const response: TransactionResponse = {
        transaction,
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

      console.error('Error updating transaction:', error)
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Wystąpił błąd podczas aktualizacji transakcji',
        },
      })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await deleteTransaction(user.id, id)

      return res.status(204).end()
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

      console.error('Error deleting transaction:', error)
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Wystąpił błąd podczas usuwania transakcji',
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
