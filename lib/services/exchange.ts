import { prisma } from '../prisma'
import type { Exchange } from '@/types/portfolio'

/**
 * Get all exchanges
 */
export async function getExchanges(): Promise<Exchange[]> {
  const exchanges = await prisma.exchange.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return exchanges
}

/**
 * Get exchange by ID
 */
export async function getExchangeById(id: string): Promise<Exchange | null> {
  const exchange = await prisma.exchange.findUnique({
    where: { id },
  })

  return exchange
}

/**
 * Get exchange by MIC code
 */
export async function getExchangeByMic(mic: string): Promise<Exchange | null> {
  const exchange = await prisma.exchange.findUnique({
    where: { mic },
  })

  return exchange
}
