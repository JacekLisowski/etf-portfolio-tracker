import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session || !session.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { id: portfolioId } = req.query

    if (!portfolioId || typeof portfolioId !== 'string') {
      return res.status(400).json({ message: 'Portfolio ID required' })
    }

    // Verify portfolio belongs to user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: user.id,
      },
    })

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' })
    }

    // Calculate holdings from transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        portfolioId,
      },
      include: {
        etf: {
          include: {
            instrument: true,
            exchange: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Group transactions by etf
    const holdingsMap = new Map<string, any>()

    for (const tx of transactions) {
      const etfId = tx.etfId
      const existing = holdingsMap.get(etfId)

      if (!existing) {
        holdingsMap.set(etfId, {
          etfId,
          instrument: tx.etf.instrument,
          etf: tx.etf,
          quantity: 0,
          totalCost: 0,
          transactions: [],
        })
      }

      const holding = holdingsMap.get(etfId)!

      if (tx.type === 'BUY') {
        holding.quantity += Number(tx.quantity)
        holding.totalCost += Number(tx.quantity) * Number(tx.pricePerUnit) + Number(tx.fees || 0)
      } else if (tx.type === 'SELL') {
        holding.quantity -= Number(tx.quantity)
        holding.totalCost -= Number(tx.quantity) * Number(tx.pricePerUnit) - Number(tx.fees || 0)
      }

      holding.transactions.push(tx)
    }

    // Filter out holdings with zero quantity and calculate metrics
    const holdings = Array.from(holdingsMap.values())
      .filter((h) => h.quantity > 0)
      .map((h) => {
        const avgPrice = h.totalCost / h.quantity
        const currentPrice = avgPrice // TODO: Fetch real-time price
        const marketValue = h.quantity * currentPrice
        const gainLoss = marketValue - h.totalCost
        const gainLossPercent = (gainLoss / h.totalCost) * 100

        return {
          id: h.etfId,
          instrument: h.instrument,
          etf: h.etf,
          quantity: h.quantity,
          avgPrice,
          currentPrice,
          marketValue,
          totalCost: h.totalCost,
          gainLoss,
          gainLossPercent,
          currency: h.etf.tradingCurrency || 'EUR',
          lastUpdate: new Date(),
          allocation: 0, // Will be calculated after totals
        }
      })

    // Calculate total market value for allocation percentages
    const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0)

    holdings.forEach((h) => {
      h.allocation = totalMarketValue > 0 ? (h.marketValue / totalMarketValue) * 100 : 0
    })

    return res.json({ holdings })
  } catch (error) {
    console.error('Holdings fetch error:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
