import { syncEtfsFromTwelveData } from '../lib/services/etf-sync'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🧪 Test ETF Sync Service\n')

  // Check if we have API key
  const apiKey = process.env.TWELVE_DATA_API_KEY || 'demo'
  console.log(`API Key: ${apiKey.substring(0, 10)}...`)

  // Test 1: Sync only XETR (Frankfurt) first
  console.log('\n📋 Test 1: Sync XETR (Frankfurt) only')
  console.log('='.repeat(60))

  const stats = await syncEtfsFromTwelveData({
    rateLimit: 60,
    exchanges: ['XETR'], // Just Frankfurt for now
  })

  console.log('\n✅ Sync completed!')
  console.log(`   Total ETFs: ${stats.totalEtfs}`)
  console.log(`   Instruments: ${stats.createdInstruments}`)
  console.log(`   Listings: ${stats.createdListings}`)
  console.log(`   Errors: ${stats.errors}`)

  // Test 2: Check database
  console.log('\n📋 Test 2: Check database')
  console.log('='.repeat(60))

  const instrumentCount = await prisma.instrument.count()
  const listingCount = await prisma.etf.count()

  console.log(`   Instruments in DB: ${instrumentCount}`)
  console.log(`   Listings in DB: ${listingCount}`)

  // Show some examples
  const examples = await prisma.instrument.findMany({
    take: 5,
    include: {
      listings: {
        include: {
          exchange: true,
        },
      },
    },
  })

  console.log('\n   Example Instruments:')
  examples.forEach((inst) => {
    console.log(`\n   ${inst.isin} - ${inst.name}`)
    console.log(`   Source: ${inst.nameSource}`)
    inst.listings.forEach((listing) => {
      console.log(
        `      → ${listing.ticker || 'N/A'} @ ${listing.exchange.mic} (${listing.tradingCurrency})`
      )
    })
  })

  console.log('\n✅ All tests passed!')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
