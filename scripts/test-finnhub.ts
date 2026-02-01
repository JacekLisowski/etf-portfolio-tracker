import fetch from 'node-fetch'

const FINNHUB_API_KEY = 'd5vricpr01qihi8ni5s0d5vricpr01qihi8ni5sg'
const BASE_URL = 'https://finnhub.io/api/v1'

interface FinnhubSymbol {
  description: string
  displaySymbol: string
  symbol: string
  type: string
  currency?: string
  figi?: string
  isin?: string
  shareClassFIGI?: string
  mic?: string
}

async function fetchSymbols(exchange: string): Promise<FinnhubSymbol[]> {
  const url = `${BASE_URL}/stock/symbol?exchange=${exchange}&token=${FINNHUB_API_KEY}`
  console.log(`\n📡 Pobieranie symboli z giełdy: ${exchange}`)
  console.log(`   URL: ${url.replace(FINNHUB_API_KEY, 'xxx')}`)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()
  return data as FinnhubSymbol[]
}

async function main() {
  console.log('🧪 Test Finnhub API - ETF Data\n')
  console.log('API Key:', FINNHUB_API_KEY.substring(0, 10) + '...')

  // Lista giełd do przetestowania
  const exchanges = [
    { code: 'US', name: 'US Exchanges (NYSE, NASDAQ, etc.)' },
    { code: 'XETR', name: 'Frankfurt (Xetra)' },
    { code: 'LSE', name: 'London Stock Exchange' },
  ]

  const results: Record<string, { total: number; etfs: FinnhubSymbol[]; etfCount: number }> = {}

  for (const exchange of exchanges) {
    try {
      const symbols = await fetchSymbols(exchange.code)
      const etfs = symbols.filter((s) => s.type === 'ETP' || s.type === 'ETF')

      results[exchange.code] = {
        total: symbols.length,
        etfs,
        etfCount: etfs.length,
      }

      console.log(`✅ ${exchange.name}`)
      console.log(`   Total symboli: ${symbols.length}`)
      console.log(`   ETF/ETP: ${etfs.length}`)

      // Pokaż różne typy symboli
      const types = new Set(symbols.map((s) => s.type))
      console.log(`   Typy symboli: ${Array.from(types).join(', ')}`)

      // Przykładowe ETF
      if (etfs.length > 0) {
        console.log(`\n   📋 Przykładowe ETF (pierwsze 5):`)
        etfs.slice(0, 5).forEach((etf, i) => {
          console.log(`   ${i + 1}. ${etf.displaySymbol} - ${etf.description}`)
          console.log(`      Symbol: ${etf.symbol}`)
          console.log(`      Type: ${etf.type}`)
          console.log(`      Currency: ${etf.currency || 'N/A'}`)
          console.log(`      ISIN: ${etf.isin || 'N/A'}`)
          console.log(`      MIC: ${etf.mic || 'N/A'}`)
        })
      }

      // Rate limiting - czekaj 1 sekundę między requestami
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error: any) {
      console.error(`❌ Błąd dla ${exchange.name}:`, error.message)
    }
  }

  // Podsumowanie
  console.log('\n' + '='.repeat(60))
  console.log('📊 PODSUMOWANIE')
  console.log('='.repeat(60))

  let totalEtfs = 0
  Object.entries(results).forEach(([code, data]) => {
    console.log(`\n${code}:`)
    console.log(`  Wszystkie symbole: ${data.total}`)
    console.log(`  ETF/ETP: ${data.etfCount}`)
    console.log(`  Procent ETF: ${((data.etfCount / data.total) * 100).toFixed(1)}%`)
    totalEtfs += data.etfCount
  })

  console.log(`\n🎯 Łącznie ETF znalezionych: ${totalEtfs}`)

  // Analiza struktury danych
  console.log('\n' + '='.repeat(60))
  console.log('🔍 ANALIZA STRUKTURY DANYCH')
  console.log('='.repeat(60))

  const allEtfs = Object.values(results).flatMap((r) => r.etfs)
  if (allEtfs.length > 0) {
    const sampleEtf = allEtfs[0]
    console.log('\nPola dostępne w response:')
    Object.keys(sampleEtf).forEach((key) => {
      console.log(`  - ${key}`)
    })

    // Sprawdź ile ETF ma ISIN
    const withIsin = allEtfs.filter((e) => e.isin).length
    const withMic = allEtfs.filter((e) => e.mic).length
    const withCurrency = allEtfs.filter((e) => e.currency).length

    console.log('\nPokrycie danych:')
    console.log(`  ISIN: ${withIsin}/${allEtfs.length} (${((withIsin / allEtfs.length) * 100).toFixed(1)}%)`)
    console.log(`  MIC: ${withMic}/${allEtfs.length} (${((withMic / allEtfs.length) * 100).toFixed(1)}%)`)
    console.log(`  Currency: ${withCurrency}/${allEtfs.length} (${((withCurrency / allEtfs.length) * 100).toFixed(1)}%)`)
  }

  // Rekomendacje
  console.log('\n' + '='.repeat(60))
  console.log('💡 REKOMENDACJE')
  console.log('='.repeat(60))
  console.log('\n1. Rate Limiting:')
  console.log(`   - Max 60 req/min = 1 request/sekundę`)
  console.log(`   - Dla ${exchanges.length} giełd = ~${exchanges.length} sekund`)
  console.log(`   - Możemy zrównoleglić z kolejką`)

  console.log('\n2. Implementacja:')
  console.log('   - Type "ETP" i "ETF" to ETF-y')
  console.log('   - ISIN dostępny (walidacja możliwa)')
  console.log('   - MIC dostępny (mapowanie na nasze Exchange)')
  console.log('   - Currency dostępna')

  console.log('\n3. Następne kroki:')
  console.log('   - Zaimplementować ETF sync service')
  console.log('   - Queue z rate limiting (60 req/min)')
  console.log('   - Progress tracking w bazie')
  console.log('   - Admin endpoint do trigger')
}

main()
  .catch((error) => {
    console.error('❌ Błąd krytyczny:', error)
    process.exit(1)
  })
