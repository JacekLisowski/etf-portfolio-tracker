import { prisma } from '../prisma'
import { NotFoundError } from '../errors'
import { validateEtfData } from '../validation/etf'
import type { Etf, CreateEtfRequest, SearchEtfsRequest } from '@/types/portfolio'

/**
 * Search ETFs by ticker, ISIN, or name
 */
export async function searchEtfs(params: SearchEtfsRequest): Promise<{ etfs: Etf[]; total: number }> {
  const { search, exchangeId, limit = 50, offset = 0 } = params

  const where: any = {}

  // Filter by exchange if provided
  if (exchangeId) {
    where.exchangeId = exchangeId
  }

  // Search by ticker, ISIN, or name
  if (search && search.trim() !== '') {
    const searchTerm = search.trim().toUpperCase()
    where.OR = [
      { ticker: { contains: searchTerm } },
      { isin: { contains: searchTerm } },
      { name: { contains: search.trim(), mode: 'insensitive' } },
    ]
  }

  const [etfs, total] = await Promise.all([
    prisma.etf.findMany({
      where,
      include: {
        exchange: true,
      },
      orderBy: {
        ticker: 'asc',
      },
      take: limit,
      skip: offset,
    }),
    prisma.etf.count({ where }),
  ])

  return { etfs, total }
}

/**
 * Get ETF by ID
 */
export async function getEtfById(id: string): Promise<Etf | null> {
  const etf = await prisma.etf.findUnique({
    where: { id },
    include: {
      exchange: true,
    },
  })

  return etf
}

/**
 * Create new ETF
 */
export async function createEtf(data: CreateEtfRequest): Promise<Etf> {
  // Validate input
  validateEtfData(data)

  // Check if ETF already exists for this exchange
  const existing = await prisma.etf.findUnique({
    where: {
      isin_exchangeId: {
        isin: data.isin,
        exchangeId: data.exchangeId,
      },
    },
  })

  if (existing) {
    return existing
  }

  // Create new ETF
  const etf = await prisma.etf.create({
    data: {
      isin: data.isin,
      exchangeId: data.exchangeId,
      ticker: data.ticker.toUpperCase(),
      name: data.name,
      currency: data.currency,
    },
    include: {
      exchange: true,
    },
  })

  return etf
}

/**
 * Get or create ETF (upsert logic)
 */
export async function getOrCreateEtf(data: CreateEtfRequest): Promise<Etf> {
  // Try to find existing ETF
  const existing = await prisma.etf.findUnique({
    where: {
      isin_exchangeId: {
        isin: data.isin,
        exchangeId: data.exchangeId,
      },
    },
    include: {
      exchange: true,
    },
  })

  if (existing) {
    return existing
  }

  // Create new ETF if not found
  return createEtf(data)
}

/**
 * Get ETF by ISIN and exchange ID
 */
export async function getEtfByIsinAndExchange(
  isin: string,
  exchangeId: string
): Promise<Etf | null> {
  const etf = await prisma.etf.findUnique({
    where: {
      isin_exchangeId: {
        isin,
        exchangeId,
      },
    },
    include: {
      exchange: true,
    },
  })

  return etf
}
