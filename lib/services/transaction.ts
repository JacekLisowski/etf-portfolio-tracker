import { prisma } from '../prisma'
import { NotFoundError, ForbiddenError, AppError } from '../errors'
import { validateTransactionData, validateUpdateTransactionData } from '../validation/transaction'
import { getOrCreatePortfolio } from './portfolio'
import { getOrCreateEtf, getEtfById } from './etf'
import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  GetTransactionsRequest,
} from '@/types/portfolio'

/**
 * Create a new transaction
 */
export async function createTransaction(
  userId: string,
  data: CreateTransactionRequest
): Promise<Transaction> {
  // Validate input
  validateTransactionData(data)

  // Get or create user's portfolio
  const portfolio = await getOrCreatePortfolio(userId)

  // Get or create ETF
  let etf
  if (data.etfId) {
    etf = await getEtfById(data.etfId)
    if (!etf) {
      throw new NotFoundError('ETF nie znaleziony')
    }
  } else if (data.etf) {
    etf = await getOrCreateEtf(data.etf)
  } else {
    throw new NotFoundError('ETF jest wymagany')
  }

  // Validate SELL transactions - check if user has enough quantity
  if (data.type === 'SELL') {
    // Get all transactions for this ETF in this portfolio
    const existingTransactions = await prisma.transaction.findMany({
      where: {
        portfolioId: portfolio.id,
        etfId: etf.id,
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Calculate current holdings
    let currentQuantity = 0
    for (const tx of existingTransactions) {
      if (tx.type === 'BUY') {
        currentQuantity += Number(tx.quantity)
      } else if (tx.type === 'SELL') {
        currentQuantity -= Number(tx.quantity)
      }
    }

    // Check if trying to sell more than owned
    if (data.quantity > currentQuantity) {
      throw new AppError(
        'INSUFFICIENT_QUANTITY',
        `Nie możesz sprzedać ${data.quantity} jednostek. Posiadasz tylko ${currentQuantity}.`,
        400,
        { available: currentQuantity, requested: data.quantity }
      )
    }
  }

  // Calculate total amount
  const fees = data.fees || 0
  const totalAmount = data.quantity * data.pricePerUnit + fees

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      portfolioId: portfolio.id,
      etfId: etf.id,
      type: data.type,
      date: new Date(data.date),
      quantity: data.quantity,
      pricePerUnit: data.pricePerUnit,
      totalAmount,
      currency: data.currency,
      fees,
      notes: data.notes || null,
    },
    include: {
      etf: {
        include: {
          exchange: true,
        },
      },
      portfolio: true,
    },
  })

  return transaction
}

/**
 * Get user's transactions with filters
 */
export async function getUserTransactions(
  userId: string,
  params: GetTransactionsRequest = {}
): Promise<{ transactions: Transaction[]; total: number }> {
  const { etfId, type, startDate, endDate, limit = 50, offset = 0 } = params

  // First get user's portfolio
  const portfolio = await getUserPortfolio(userId)
  if (!portfolio) {
    return { transactions: [], total: 0 }
  }

  // Build where clause
  const where: any = {
    portfolioId: portfolio.id,
  }

  if (etfId) {
    where.etfId = etfId
  }

  if (type) {
    where.type = type
  }

  if (startDate || endDate) {
    where.date = {}
    if (startDate) {
      where.date.gte = new Date(startDate)
    }
    if (endDate) {
      where.date.lte = new Date(endDate)
    }
  }

  // Query transactions
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        etf: {
          include: {
            exchange: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
      skip: offset,
    }),
    prisma.transaction.count({ where }),
  ])

  return { transactions, total }
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(
  userId: string,
  transactionId: string
): Promise<Transaction> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      etf: {
        include: {
          exchange: true,
        },
      },
      portfolio: true,
    },
  })

  if (!transaction) {
    throw new NotFoundError('Transakcja nie znaleziona')
  }

  // Check ownership
  if (transaction.portfolio.userId !== userId) {
    throw new ForbiddenError('Brak dostępu do tej transakcji')
  }

  return transaction
}

/**
 * Update transaction
 */
export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: UpdateTransactionRequest
): Promise<Transaction> {
  // Validate input
  validateUpdateTransactionData(data)

  // Get existing transaction and check ownership
  const existing = await getTransactionById(userId, transactionId)

  // Prepare update data
  const updateData: any = {}

  if (data.type !== undefined) updateData.type = data.type
  if (data.date !== undefined) updateData.date = new Date(data.date)
  if (data.quantity !== undefined) updateData.quantity = data.quantity
  if (data.pricePerUnit !== undefined) updateData.pricePerUnit = data.pricePerUnit
  if (data.currency !== undefined) updateData.currency = data.currency
  if (data.fees !== undefined) updateData.fees = data.fees
  if (data.notes !== undefined) updateData.notes = data.notes

  // Recalculate totalAmount if relevant fields changed
  if (data.quantity !== undefined || data.pricePerUnit !== undefined || data.fees !== undefined) {
    const quantity = data.quantity ?? existing.quantity
    const pricePerUnit = data.pricePerUnit ?? existing.pricePerUnit
    const fees = data.fees ?? existing.fees
    updateData.totalAmount = quantity * pricePerUnit + fees
  }

  // Update transaction
  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
    include: {
      etf: {
        include: {
          exchange: true,
        },
      },
      portfolio: true,
    },
  })

  return updated
}

/**
 * Delete transaction
 */
export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  // Get transaction and check ownership
  await getTransactionById(userId, transactionId)

  // Delete transaction
  await prisma.transaction.delete({
    where: { id: transactionId },
  })
}

/**
 * Helper to get user's portfolio (internal use)
 */
async function getUserPortfolio(userId: string) {
  return prisma.portfolio.findUnique({
    where: { userId },
  })
}
