import { prisma } from '../prisma'
import type { Portfolio } from '@/types/portfolio'

/**
 * Get user's portfolio
 */
export async function getUserPortfolio(userId: string): Promise<Portfolio | null> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { userId },
    include: {
      transactions: {
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
      },
    },
  })

  return portfolio
}

/**
 * Get or create user's portfolio
 */
export async function getOrCreatePortfolio(userId: string): Promise<Portfolio> {
  // Try to find existing portfolio
  let portfolio = await prisma.portfolio.findUnique({
    where: { userId },
  })

  // Create if doesn't exist
  if (!portfolio) {
    portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: 'Moje Portfolio',
      },
    })
  }

  return portfolio
}

/**
 * Get portfolio summary (without transactions)
 */
export async function getPortfolioSummary(userId: string): Promise<Portfolio | null> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { userId },
  })

  return portfolio
}
