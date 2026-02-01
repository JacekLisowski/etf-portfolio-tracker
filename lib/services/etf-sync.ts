import { prisma } from '../prisma'
import type {
  TwelveDataETF,
  EtfSyncConfig,
  EtfSyncProgress,
  NameSource,
  ListingStatus,
} from '@/types/portfolio'
import { enrichWithOpenFIGI, type EnrichmentRequest } from './openfigi'

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || 'demo'
const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com'

/**
 * ETF Sync Service - syncs ETF data from Twelve Data API
 */

interface SyncStats {
  totalEtfs: number
  createdInstruments: number
  updatedInstruments: number
  createdListings: number
  updatedListings: number
  enrichedWithOpenFIGI: number
  temporaryISINs: number
  errors: number
  errorMessages: string[]
}

/**
 * Generate temporary ISIN for ETFs without real ISIN
 * Format: TEMP-{ticker}-{MIC}
 */
function generateTemporaryISIN(ticker: string, micCode: string): string {
  return `TEMP-${ticker}-${micCode}`
}

/**
 * Fetch ETFs from Twelve Data for a specific exchange (MIC code)
 */
async function fetchEtfsFromTwelveData(micCode: string): Promise<TwelveDataETF[]> {
  const url = `${TWELVE_DATA_BASE_URL}/etfs?mic_code=${micCode}&apikey=${TWELVE_DATA_API_KEY}&format=JSON`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error: any) {
    console.error(`Error fetching ETFs for ${micCode}:`, error.message)
    throw error
  }
}

/**
 * Upsert Instrument (create or update if better source)
 */
async function upsertInstrument(
  isin: string,
  name: string,
  nameSource: NameSource = 'FALLBACK',
  isinTemporary: boolean = false
): Promise<void> {
  const existing = await prisma.instrument.findUnique({
    where: { isin },
  })

  if (!existing) {
    // Create new instrument
    await prisma.instrument.create({
      data: {
        isin,
        name,
        nameSource,
        nameConflict: false,
        isinTemporary,
      },
    })
  } else {
    // Only update if new source has higher priority
    const sourcePriority: Record<NameSource, number> = {
      ESMA_FIRDS: 1,
      FCA_FIRDS: 1,
      SIX: 2,
      FALLBACK: 3,
    }

    const newPriority = sourcePriority[nameSource]
    const existingPriority = sourcePriority[existing.nameSource]

    if (newPriority < existingPriority) {
      // Higher priority source - update (and potentially replace temp ISIN with real one)
      await prisma.instrument.update({
        where: { isin },
        data: {
          name,
          nameSource,
          isinTemporary,
          lastSeenAt: new Date(),
        },
      })
    } else if (newPriority === existingPriority && existing.name !== name) {
      // Same priority but different name - flag conflict
      await prisma.instrument.update({
        where: { isin },
        data: {
          nameConflict: true,
          lastSeenAt: new Date(),
        },
      })
    } else {
      // Just update lastSeenAt
      await prisma.instrument.update({
        where: { isin },
        data: {
          lastSeenAt: new Date(),
        },
      })
    }
  }
}

/**
 * Upsert Listing (create or update)
 */
async function upsertListing(
  isin: string,
  exchangeId: string,
  ticker: string | null,
  tradingCurrency: string,
  sourceSystem: string = 'FALLBACK'
): Promise<void> {
  const existing = await prisma.etf.findUnique({
    where: {
      isin_exchangeId: { isin, exchangeId },
    },
  })

  if (!existing) {
    // Create new listing
    await prisma.etf.create({
      data: {
        isin,
        exchangeId,
        ticker,
        tradingCurrency,
        status: 'ACTIVE' as ListingStatus,
        sourceSystem,
      },
    })
  } else {
    // Update existing listing
    await prisma.etf.update({
      where: { id: existing.id },
      data: {
        ticker,
        tradingCurrency,
        sourceSystem,
        lastSeenAt: new Date(),
      },
    })
  }
}

/**
 * Process ETFs from Twelve Data for one exchange
 * Hybrid Strategy: Twelve Data + OpenFIGI enrichment + Temporary ISIN
 */
async function processExchangeEtfs(
  micCode: string,
  stats: SyncStats
): Promise<void> {
  console.log(`\n📡 Fetching ETFs for ${micCode}...`)

  try {
    const etfs = await fetchEtfsFromTwelveData(micCode)
    console.log(`   Found ${etfs.length} ETFs`)

    // Find exchange in database
    const exchange = await prisma.exchange.findUnique({
      where: { mic: micCode },
    })

    if (!exchange) {
      console.error(`   ❌ Exchange ${micCode} not found in database`)
      stats.errors++
      stats.errorMessages.push(`Exchange ${micCode} not found`)
      return
    }

    // Filter ETFs: skip those without ticker (can't generate temp ISIN)
    const validEtfs = etfs.filter((etf) => etf.symbol)

    console.log(
      `   Valid ETFs with ticker: ${validEtfs.length}/${etfs.length}`
    )

    // Prepare OpenFIGI enrichment requests (batch)
    const enrichmentRequests: EnrichmentRequest[] = validEtfs
      .slice(0, 100) // Limit to 100 per batch to avoid timeout
      .map((etf) => ({
        ticker: etf.symbol,
        micCode: micCode,
        currency: etf.currency,
      }))

    // Enrich with OpenFIGI (optional - may fail for unsupported exchanges)
    let enrichmentMap: Map<string, any> = new Map()
    try {
      if (enrichmentRequests.length > 0) {
        console.log(`   🔍 Enriching with OpenFIGI (${enrichmentRequests.length} ETFs)...`)
        const enrichmentResults = await enrichWithOpenFIGI(enrichmentRequests)

        enrichmentResults.forEach((result) => {
          if (result.success) {
            enrichmentMap.set(result.ticker, result)
            stats.enrichedWithOpenFIGI++
          }
        })

        console.log(`   ✅ OpenFIGI enriched: ${stats.enrichedWithOpenFIGI}/${enrichmentRequests.length}`)
      }
    } catch (error: any) {
      console.log(`   ⚠️  OpenFIGI enrichment failed: ${error.message}`)
      // Continue without enrichment
    }

    // Process each ETF
    for (const etf of validEtfs) {
      try {
        stats.totalEtfs++

        // Determine ISIN
        let isin: string
        let isinTemporary = false
        let etfName = etf.name

        if (etf.isin && etf.isin !== 'request_access_via_add_ons') {
          // Real ISIN from Twelve Data (rare in free tier)
          isin = etf.isin
        } else {
          // Generate temporary ISIN
          isin = generateTemporaryISIN(etf.symbol, micCode)
          isinTemporary = true
          stats.temporaryISINs++
        }

        // Use enriched name from OpenFIGI if available
        const enrichment = enrichmentMap.get(etf.symbol)
        if (enrichment && enrichment.name) {
          etfName = enrichment.name
        }

        // Upsert Instrument
        await upsertInstrument(isin, etfName, 'FALLBACK', isinTemporary)
        stats.createdInstruments++

        // Upsert Listing
        await upsertListing(
          isin,
          exchange.id,
          etf.symbol || null,
          etf.currency,
          'FALLBACK'
        )
        stats.createdListings++

        // Log progress every 100 ETFs
        if (stats.totalEtfs % 100 === 0) {
          console.log(`   Processed ${stats.totalEtfs} ETFs...`)
        }
      } catch (error: any) {
        stats.errors++
        stats.errorMessages.push(`${etf.symbol}: ${error.message}`)
        console.error(`   ❌ Error processing ${etf.symbol}:`, error.message)
      }
    }

    console.log(`   ✅ Processed ${validEtfs.length} ETFs for ${micCode}`)
    console.log(`      Temporary ISINs: ${stats.temporaryISINs}`)
    console.log(`      OpenFIGI enriched: ${stats.enrichedWithOpenFIGI}`)
  } catch (error: any) {
    stats.errors++
    stats.errorMessages.push(`${micCode}: ${error.message}`)
    console.error(`   ❌ Error fetching ETFs for ${micCode}:`, error.message)
  }
}

/**
 * Sync ETFs from Twelve Data API
 *
 * @param config - Sync configuration (rate limit, exchanges to sync)
 * @returns Stats about the sync operation
 */
export async function syncEtfsFromTwelveData(
  config: EtfSyncConfig = { rateLimit: 60 }
): Promise<SyncStats> {
  const stats: SyncStats = {
    totalEtfs: 0,
    createdInstruments: 0,
    updatedInstruments: 0,
    createdListings: 0,
    updatedListings: 0,
    enrichedWithOpenFIGI: 0,
    temporaryISINs: 0,
    errors: 0,
    errorMessages: [],
  }

  console.log('🚀 Starting ETF sync from Twelve Data API (Hybrid Strategy)')
  console.log(`   Strategy: Twelve Data + OpenFIGI + Temporary ISIN`)
  console.log(`   Rate limit: ${config.rateLimit} req/min`)

  // Get exchanges to sync
  const exchanges = await prisma.exchange.findMany({
    select: { mic: true },
  })

  let exchangesToSync = exchanges.map((e) => e.mic)

  if (config.exchanges && config.exchanges.length > 0) {
    exchangesToSync = exchangesToSync.filter((mic) =>
      config.exchanges!.includes(mic)
    )
  }

  console.log(`   Exchanges to sync: ${exchangesToSync.join(', ')}`)
  console.log(`   Total: ${exchangesToSync.length} exchanges\n`)

  // Calculate delay between requests (ms)
  const delayMs = (60 * 1000) / config.rateLimit

  // Process each exchange
  for (let i = 0; i < exchangesToSync.length; i++) {
    const micCode = exchangesToSync[i]

    await processExchangeEtfs(micCode, stats)

    // Rate limiting - wait before next request (except last one)
    if (i < exchangesToSync.length - 1) {
      console.log(`   ⏳ Waiting ${Math.round(delayMs / 1000)}s (rate limiting)...`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('✅ ETF Sync Complete (Hybrid Strategy)')
  console.log('='.repeat(60))
  console.log(`Total ETFs processed: ${stats.totalEtfs}`)
  console.log(`Instruments created/updated: ${stats.createdInstruments}`)
  console.log(`Listings created/updated: ${stats.createdListings}`)
  console.log(`Temporary ISINs generated: ${stats.temporaryISINs}`)
  console.log(`OpenFIGI enriched: ${stats.enrichedWithOpenFIGI}`)
  console.log(`Errors: ${stats.errors}`)

  if (stats.errorMessages.length > 0) {
    console.log('\nErrors:')
    stats.errorMessages.slice(0, 10).forEach((msg) => console.log(`  - ${msg}`))
    if (stats.errorMessages.length > 10) {
      console.log(`  ... and ${stats.errorMessages.length - 10} more`)
    }
  }

  console.log('\n💡 Next steps:')
  if (stats.temporaryISINs > 0) {
    console.log(
      `   - ${stats.temporaryISINs} ETFs have temporary ISINs (TEMP-{ticker}-{MIC})`
    )
    console.log('   - Replace with real ISINs from ESMA FIRDS or manual entry')
  }

  return stats
}

/**
 * Get sync progress (placeholder for future implementation with database tracking)
 */
export async function getEtfSyncProgress(syncId: string): Promise<EtfSyncProgress | null> {
  // TODO: Implement progress tracking in database
  // For now, return null (no active sync)
  return null
}
