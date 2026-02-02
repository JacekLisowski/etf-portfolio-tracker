import { prisma } from '../prisma'
import { NotFoundError } from '../errors'

/**
 * Search ETFs/Listings by ticker, ISIN, or instrument name
 */
export async function searchEtfs(params: {
  search?: string
  exchangeId?: string
  limit?: number
  offset?: number
}): Promise<{ etfs: any[]; total: number }> {
  const { search, exchangeId, limit = 50, offset = 0 } = params

  const where: any = {}

  // Filter by exchange if provided
  if (exchangeId) {
    where.exchangeId = exchangeId
  }

  // Search by ticker, ISIN, or instrument name
  if (search && search.trim() !== '') {
    const searchTerm = search.trim().toUpperCase()
    where.OR = [
      { ticker: { contains: searchTerm, mode: 'insensitive' } },
      { isin: { contains: searchTerm, mode: 'insensitive' } },
      {
        instrument: {
          name: { contains: search.trim(), mode: 'insensitive' },
        },
      },
    ]
  }

  const [etfs, total] = await Promise.all([
    prisma.etf.findMany({
      where,
      include: {
        exchange: true,
        instrument: true,
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
 * Get ETF/Listing by ID
 */
export async function getEtfById(id: string) {
  const etf = await prisma.etf.findUnique({
    where: { id },
    include: {
      exchange: true,
      instrument: true,
    },
  })

  return etf
}

/**
 * Get ETF/Listing by ISIN and Exchange
 */
export async function getEtfByIsinAndExchange(isin: string, exchangeId: string) {
  const etf = await prisma.etf.findUnique({
    where: {
      isin_exchangeId: {
        isin,
        exchangeId,
      },
    },
    include: {
      exchange: true,
      instrument: true,
    },
  })

  return etf
}

/**
 * Create or get existing instrument by ISIN
 */
export async function upsertInstrument(params: {
  isin: string
  name: string
  nameSource?: 'ESMA_FIRDS' | 'FCA_FIRDS' | 'SIX' | 'FALLBACK'
  classification?: string
  isinTemporary?: boolean
}) {
  const { isin, name, nameSource = 'FALLBACK', classification, isinTemporary = false } = params

  return await prisma.instrument.upsert({
    where: { isin },
    update: {
      lastSeenAt: new Date(),
      // Update name if source is higher priority (optional logic)
    },
    create: {
      isin,
      name,
      nameSource,
      classification,
      isinTemporary,
    },
  })
}

/**
 * Create or get existing listing (ETF on specific exchange)
 */
export async function upsertListing(params: {
  isin: string
  exchangeId: string
  ticker?: string
  tradingCurrency?: string
  status?: 'ACTIVE' | 'TERMINATED' | 'CANCELLED' | 'SUSPENDED'
  sourceSystem?: string
}) {
  const {
    isin,
    exchangeId,
    ticker,
    tradingCurrency = 'USD',
    status = 'ACTIVE',
    sourceSystem = 'FALLBACK',
  } = params

  return await prisma.etf.upsert({
    where: {
      isin_exchangeId: {
        isin,
        exchangeId,
      },
    },
    update: {
      ticker,
      tradingCurrency,
      status,
      sourceSystem,
      lastSeenAt: new Date(),
    },
    create: {
      isin,
      exchangeId,
      ticker,
      tradingCurrency,
      status,
      sourceSystem,
    },
    include: {
      instrument: true,
      exchange: true,
    },
  })
}

/**
 * Get all listings for an instrument (by ISIN)
 */
export async function getListingsByIsin(isin: string) {
  return await prisma.etf.findMany({
    where: { isin },
    include: {
      exchange: true,
      instrument: true,
    },
  })
}

/**
 * Get or create ETF (Listing + Instrument)
 * Legacy function for backwards compatibility
 */
export async function getOrCreateEtf(data: {
  isin: string
  exchangeId: string
  ticker?: string
  tradingCurrency?: string
  instrumentName?: string
  nameSource?: 'ESMA_FIRDS' | 'FCA_FIRDS' | 'SIX' | 'FALLBACK'
  status?: 'ACTIVE' | 'TERMINATED' | 'CANCELLED' | 'SUSPENDED'
  sourceSystem?: string
}) {
  // Ensure instrument exists
  const instrument = await prisma.instrument.upsert({
    where: { isin: data.isin },
    update: {
      lastSeenAt: new Date(),
    },
    create: {
      isin: data.isin,
      name: data.instrumentName || `ETF ${data.ticker || data.isin}`,
      nameSource: data.nameSource || 'FALLBACK',
      isinTemporary: data.isin.startsWith('TEMP-'),
    },
  })

  // Get or create listing
  const listing = await upsertListing({
    isin: data.isin,
    exchangeId: data.exchangeId,
    ticker: data.ticker,
    tradingCurrency: data.tradingCurrency,
    status: data.status,
    sourceSystem: data.sourceSystem,
  })

  return listing
}
