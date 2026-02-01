import fetch from 'node-fetch'

const FINNHUB_API_KEY = 'd5vricpr01qihi8ni5s0d5vricpr01qihi8ni5sg'
const BASE_URL = 'https://finnhub.io/api/v1'

interface FinnhubProfile {
  country?: string
  currency?: string
  exchange?: string
  ipo?: string
  marketCapitalization?: number
  name?: string
  phone?: string
  shareOutstanding?: number
  ticker?: string
  weburl?: string
  logo?: string
  finnhubIndustry?: string
  // Szukamy ISIN!
  isin?: string
  cusip?: string
  sedol?: string
  [key: string]: any // Catch any other fields
}

async function fetchProfile(symbol: string): Promise<FinnhubProfile | null> {
  const url = `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`   ❌ HTTP ${response.status} dla ${symbol}`)
      return null
    }

    const data = await response.json()
    return data as FinnhubProfile
  } catch (error: any) {
    console.error(`   ❌ Błąd dla ${symbol}:`, error.message)
    return null
  }
}

async function main() {
  console.log('🧪 Test Finnhub ETF Profile Endpoint\n')

  // Testowe ETF z różnych kategorii (z poprzedniego testu)
  const testSymbols = [
    'SPY',   // S&P 500 ETF - najbardziej popularny
    'QQQ',   // NASDAQ-100 ETF
    'IWM',   // Russell 2000 ETF
    'VWCE',  // Vanguard All-World (jeśli dostępny)
    'VTI',   // Vanguard Total Stock Market
    'EDGF',  // Z poprzedniego testu
    'XTN',   // Z poprzedniego testu
  ]

  console.log(`Testowanie ${testSymbols.length} ETF...\n`)

  const results: Array<{
    symbol: string
    profile: FinnhubProfile | null
    hasIsin: boolean
    hasCusip: boolean
  }> = []

  for (const symbol of testSymbols) {
    console.log(`📋 ${symbol}`)
    const profile = await fetchProfile(symbol)

    if (profile && Object.keys(profile).length > 0) {
      const hasIsin = !!profile.isin
      const hasCusip = !!profile.cusip

      console.log(`   ✅ Profile pobrane`)
      console.log(`   Name: ${profile.name || 'N/A'}`)
      console.log(`   Exchange: ${profile.exchange || 'N/A'}`)
      console.log(`   Currency: ${profile.currency || 'N/A'}`)
      console.log(`   ISIN: ${profile.isin || '❌ BRAK'}`)
      console.log(`   CUSIP: ${profile.cusip || 'N/A'}`)
      console.log(`   Country: ${profile.country || 'N/A'}`)
      console.log(`   Market Cap: ${profile.marketCapitalization || 'N/A'}`)
      console.log(`   IPO: ${profile.ipo || 'N/A'}`)

      // Pokaż wszystkie dostępne pola
      console.log(`   Wszystkie pola:`, Object.keys(profile).join(', '))

      results.push({
        symbol,
        profile,
        hasIsin,
        hasCusip,
      })
    } else {
      console.log(`   ⚠️ Brak danych`)
      results.push({
        symbol,
        profile: null,
        hasIsin: false,
        hasCusip: false,
      })
    }

    console.log('')

    // Rate limiting - 1 request per second (60/min)
    await new Promise((resolve) => setTimeout(resolve, 1100))
  }

  // Podsumowanie
  console.log('='.repeat(60))
  console.log('📊 PODSUMOWANIE')
  console.log('='.repeat(60))

  const successful = results.filter((r) => r.profile !== null)
  const withIsin = results.filter((r) => r.hasIsin)
  const withCusip = results.filter((r) => r.hasCusip)

  console.log(`\nPobrane profile: ${successful.length}/${testSymbols.length}`)
  console.log(`Z ISIN: ${withIsin.length}/${successful.length} (${((withIsin.length / successful.length) * 100).toFixed(1)}%)`)
  console.log(`Z CUSIP: ${withCusip.length}/${successful.length} (${((withCusip.length / successful.length) * 100).toFixed(1)}%)`)

  if (withIsin.length > 0) {
    console.log('\n✅ ETF z ISIN:')
    withIsin.forEach((r) => {
      console.log(`   ${r.symbol}: ${r.profile?.isin}`)
    })
  }

  if (withIsin.length === 0) {
    console.log('\n⚠️ Żaden ETF nie ma ISIN w profile endpoint!')
  }

  // Oszacowanie czasu dla pełnego sync
  console.log('\n' + '='.repeat(60))
  console.log('⏱️ OSZACOWANIE CZASU SYNC')
  console.log('='.repeat(60))

  const totalEtfs = 5696 // Z poprzedniego testu (US)
  const requestsPerMinute = 60
  const minutesNeeded = Math.ceil(totalEtfs / requestsPerMinute)
  const hoursNeeded = minutesNeeded / 60

  console.log(`\nDla ${totalEtfs} US ETF:`)
  console.log(`  Rate limit: ${requestsPerMinute} req/min`)
  console.log(`  Czas: ~${minutesNeeded} minut (${hoursNeeded.toFixed(1)} godzin)`)
  console.log(`  Plus initial symbol fetch: +1 minuta`)
  console.log(`  Łącznie: ~${(minutesNeeded + 1)} minut`)

  // Rekomendacje
  console.log('\n' + '='.repeat(60))
  console.log('💡 REKOMENDACJE')
  console.log('='.repeat(60))

  if (withIsin.length > 0) {
    console.log('\n✅ ISIN dostępny przez profile endpoint!')
    console.log('\nStrategia implementacji:')
    console.log('1. Pobierz listę symboli: /stock/symbol?exchange=US')
    console.log('2. Filtruj type="ETP"')
    console.log('3. Dla każdego ETF: pobierz profile (/stock/profile2)')
    console.log('4. Zapisz do bazy z ISIN')
    console.log('5. Progress tracking co 100 ETF')
    console.log(`6. Czas: ~${hoursNeeded.toFixed(1)}h przy max rate`)
  } else {
    console.log('\n❌ ISIN NIE dostępny przez profile endpoint')
    console.log('\nAlternatywy:')
    console.log('1. Użyć CUSIP zamiast ISIN (jeśli dostępny)')
    console.log('2. Sprawdzić inne Finnhub endpoints')
    console.log('3. Użyć alternatywnego API')
    console.log('4. Zaakceptować brak ISIN (używać tylko ticker+exchange)')
  }

  console.log('\n✅ Test zakończony!')
}

main()
  .catch((error) => {
    console.error('❌ Błąd krytyczny:', error)
    process.exit(1)
  })
