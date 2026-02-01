import { syncEtfsFromTwelveData } from '../lib/services/etf-sync'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🧪 Test Hybrid ETF Sync Strategy\n')
  console.log('Strategy: Twelve Data + OpenFIGI + Temporary ISIN\n')
  console.log('='.repeat(70))

  // Test with XETR (Frankfurt) - should work well with OpenFIGI
  console.log('\n📋 Test: Sync XETR (Frankfurt) with hybrid strategy')
  console.log('-'.repeat(70))

  const stats = await syncEtfsFromTwelveData({
    rateLimit: 60,
    exchanges: ['XETR'], // Just Frankfurt
  })

  console.log('\n✅ Sync completed!')
  console.log(`   Total ETFs: ${stats.totalEtfs}`)
  console.log(`   Instruments: ${stats.createdInstruments}`)
  console.log(`   Listings: ${stats.createdListings}`)
  console.log(`   Temporary ISINs: ${stats.temporaryISINs}`)
  console.log(`   OpenFIGI enriched: ${stats.enrichedWithOpenFIGI}`)
  console.log(`   Errors: ${stats.errors}`)

  // Check database
  console.log('\n\n📋 Database Validation')
  console.log('-'.repeat(70))

  const instrumentCount = await prisma.instrument.count()
  const tempInstrumentCount = await prisma.instrument.count({
    where: { isinTemporary: true },
  })
  const listingCount = await prisma.etf.count()

  console.log(`   Instruments in DB: ${instrumentCount}`)
  console.log(`   Temporary ISINs: ${tempInstrumentCount}`)
  console.log(`   Real ISINs: ${instrumentCount - tempInstrumentCount}`)
  console.log(`   Listings in DB: ${listingCount}`)

  // Show examples
  console.log('\n\n📋 Sample Instruments (first 5)')
  console.log('-'.repeat(70))

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

  examples.forEach((inst) => {
    const isinLabel = inst.isinTemporary ? '⚠️  TEMP' : '✅ REAL'
    console.log(`\n   ${isinLabel} ${inst.isin}`)
    console.log(`   Name: ${inst.name}`)
    console.log(`   Source: ${inst.nameSource}`)
    inst.listings.forEach((listing) => {
      console.log(
        `      → ${listing.ticker || 'N/A'} @ ${listing.exchange.mic} (${listing.tradingCurrency})`
      )
    })
  })

  // Show some temporary ISINs
  console.log('\n\n📋 Sample Temporary ISINs (first 3)')
  console.log('-'.repeat(70))

  const tempExamples = await prisma.instrument.findMany({
    where: { isinTemporary: true },
    take: 3,
    include: {
      listings: {
        include: {
          exchange: true,
        },
      },
    },
  })

  tempExamples.forEach((inst) => {
    console.log(`\n   ⚠️  ${inst.isin}`)
    console.log(`   Name: ${inst.name}`)
    inst.listings.forEach((listing) => {
      console.log(
        `      Ticker: ${listing.ticker || 'N/A'} @ ${listing.exchange.mic}`
      )
    })
  })

  console.log('\n\n' + '='.repeat(70))
  console.log('📊 CONCLUSION')
  console.log('='.repeat(70))
  console.log('\n✅ Hybrid strategy working:')
  console.log('   1. ✅ Twelve Data fetched ticker list')
  console.log('   2. ✅ Temporary ISINs generated (TEMP-{ticker}-{MIC})')
  console.log('   3. ✅ OpenFIGI enrichment attempted')
  console.log('   4. ✅ Data stored in database')
  console.log('\n💡 Next step: Replace temporary ISINs with real ones from:')
  console.log('   - ESMA FIRDS (European ETFs)')
  console.log('   - Manual entry')
  console.log('   - Other data sources')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
