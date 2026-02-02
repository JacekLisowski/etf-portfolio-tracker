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
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { q } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Query parameter required' })
    }

    const searchQuery = q.trim().toLowerCase()

    if (searchQuery.length < 2) {
      return res.json({ etfs: [] })
    }

    // Search for ETFs by ticker, name, or ISIN
    const listings = await prisma.etf.findMany({
      where: {
        OR: [
          {
            ticker: {
              contains: searchQuery,
            },
          },
          {
            instrument: {
              name: {
                contains: searchQuery,
              },
            },
          },
          {
            isin: {
              contains: searchQuery,
            },
          },
        ],
      },
      include: {
        instrument: true,
        exchange: true,
      },
      take: 20,
      orderBy: {
        ticker: 'asc',
      },
    })

    // Transform to EtfOption format
    const etfs = listings.map((listing) => ({
      id: listing.id,
      symbol: listing.ticker || listing.isin,
      name: listing.instrument.name,
      isin: listing.isin,
      isinTemporary: listing.instrument.isinTemporary,
      exchange: listing.exchangeId,
      exchangeName: listing.exchange.name,
    }))

    return res.json({ etfs })
  } catch (error) {
    console.error('ETF search error:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
