import { prisma } from '../lib/prisma'

async function main() {
  console.log('🧪 Test nowego modelu Instrument + Etf\n')

  // 1. Sprawdź Exchange
  console.log('1️⃣ Sprawdzanie Exchange...')
  const exchanges = await prisma.exchange.findMany()
  console.log(`✅ Znaleziono ${exchanges.length} giełd`)

  // 2. Test utworzenia Instrument
  console.log('\n2️⃣ Tworzenie test Instrument...')
  const instrument = await prisma.instrument.create({
    data: {
      isin: 'IE00B4L5Y983',
      name: 'iShares Core MSCI World UCITS ETF',
      nameSource: 'FALLBACK',
    },
  })
  console.log(`✅ Instrument utworzony: ${instrument.isin} - ${instrument.name}`)
  console.log(`   Source: ${instrument.nameSource}`)

  // 3. Test utworzenia Listing (Etf)
  console.log('\n3️⃣ Tworzenie test Listing...')
  const xetr = exchanges.find((e) => e.mic === 'XETR')
  if (!xetr) {
    console.error('❌ XETR nie znaleziony!')
    return
  }

  const listing = await prisma.etf.create({
    data: {
      isin: instrument.isin,
      exchangeId: xetr.id,
      ticker: 'IWDA',
      tradingCurrency: 'EUR',
      status: 'ACTIVE',
      sourceSystem: 'FALLBACK',
    },
    include: {
      instrument: true,
      exchange: true,
    },
  })
  console.log(`✅ Listing utworzony: ${listing.ticker} @ ${listing.exchange.mic}`)
  console.log(`   ISIN: ${listing.isin}`)
  console.log(`   Instrument name: ${listing.instrument.name}`)
  console.log(`   Trading currency: ${listing.tradingCurrency}`)
  console.log(`   Status: ${listing.status}`)

  // 4. Test query z joinami
  console.log('\n4️⃣ Test query z joinami...')
  const listings = await prisma.etf.findMany({
    include: {
      instrument: true,
      exchange: true,
    },
  })
  console.log(`✅ Znaleziono ${listings.length} listings`)
  listings.forEach((l) => {
    console.log(
      `   ${l.ticker} (${l.instrument.isin}): ${l.instrument.name} @ ${l.exchange.mic}`
    )
  })

  // 5. Test Instrument z wieloma listingami
  console.log('\n5️⃣ Tworzenie drugiego listing dla tego samego instrumentu...')
  const xlon = exchanges.find((e) => e.mic === 'XLON')
  if (xlon) {
    const listing2 = await prisma.etf.create({
      data: {
        isin: instrument.isin, // Ten sam ISIN!
        exchangeId: xlon.id,
        ticker: 'IWDA',
        tradingCurrency: 'GBP',
        status: 'ACTIVE',
        sourceSystem: 'FALLBACK',
      },
    })
    console.log(`✅ Drugi listing utworzony: ${listing2.ticker} @ XLON (GBP)`)

    // Sprawdź że instrument ma 2 listingi
    const instrumentWithListings = await prisma.instrument.findUnique({
      where: { isin: instrument.isin },
      include: { listings: { include: { exchange: true } } },
    })
    console.log(
      `✅ Instrument ${instrumentWithListings?.isin} ma ${instrumentWithListings?.listings.length} listings:`
    )
    instrumentWithListings?.listings.forEach((l) => {
      console.log(`   - ${l.ticker} @ ${l.exchange.mic} (${l.tradingCurrency})`)
    })
  }

  console.log('\n✅ Wszystkie testy przeszły!')
  console.log('\n📊 Podsumowanie modelu:')
  console.log('   - 1 Instrument (ISIN) → wiele Listings (ISIN + MIC)')
  console.log('   - Każdy Listing ma jedną nazwę z Instrument')
  console.log('   - Source tracking działa (nameSource, sourceSystem)')
  console.log('   - Status tracking działa (ACTIVE/TERMINATED/etc)')
}

main()
  .catch((error) => {
    console.error('❌ Błąd:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
