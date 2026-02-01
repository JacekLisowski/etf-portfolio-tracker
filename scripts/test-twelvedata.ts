import fetch from 'node-fetch'

const TWELVE_DATA_API_KEY = 'demo' // Zaczynamy od demo, potem użyjemy prawdziwego klucza
const BASE_URL = 'https://api.twelvedata.com'

interface TwelveDataETF {
  symbol: string
  name: string
  currency: string
  exchange: string
  mic_code: string
  country: string
  type?: string
  isin?: string
  cusip?: string
  figi_code?: string
  cfi_code?: string
  access?: {
    global?: string
    plan?: string
  }
}

interface TwelveDataResponse {
  data: TwelveDataETF[]
  status: string
}

async function fetchETFs(params: {
  exchange?: string
  mic_code?: string
  country?: string
  symbol?: string
}): Promise<TwelveDataETF[]> {
  const queryParams = new URLSearchParams({
    apikey: TWELVE_DATA_API_KEY,
    format: 'JSON',
    ...params,
  })

  const url = `${BASE_URL}/etfs?${queryParams}`
  console.log(`📡 URL: ${url.replace(TWELVE_DATA_API_KEY, 'xxx')}`)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json() as TwelveDataResponse
  return data.data || []
}

async function main() {
  console.log('🧪 Test Twelve Data API - ETF Endpoint\n')

  try {
    // Test 1: Pobierz kilka US ETF
    console.log('📋 Test 1: US ETF (NYSE)')
    console.log('=' .repeat(60))
    const usEtfs = await fetchETFs({ exchange: 'NYSE' })
    console.log(`✅ Znaleziono: ${usEtfs.length} ETF na NYSE`)

    if (usEtfs.length > 0) {
      console.log('\nPrzykładowe ETF (pierwsze 5):')
      usEtfs.slice(0, 5).forEach((etf, i) => {
        console.log(`\n${i + 1}. ${etf.symbol} - ${etf.name}`)
        console.log(`   Exchange: ${etf.exchange}`)
        console.log(`   MIC: ${etf.mic_code}`)
        console.log(`   Currency: ${etf.currency}`)
        console.log(`   Country: ${etf.country}`)
        console.log(`   ISIN: ${etf.isin || '❌ BRAK'}`)
        console.log(`   CUSIP: ${etf.cusip || 'N/A'}`)
        console.log(`   Type: ${etf.type || 'N/A'}`)
      })

      // Sprawdź pokrycie ISIN
      const withIsin = usEtfs.filter(e => e.isin).length
      console.log(`\n📊 Pokrycie ISIN: ${withIsin}/${usEtfs.length} (${((withIsin / usEtfs.length) * 100).toFixed(1)}%)`)
    }

    // Test 2: Pobierz kilka EU ETF (Frankfurt)
    console.log('\n\n📋 Test 2: European ETF (Frankfurt - XETR)')
    console.log('='.repeat(60))
    const euEtfs = await fetchETFs({ mic_code: 'XETR' })
    console.log(`✅ Znaleziono: ${euEtfs.length} ETF na XETR`)

    if (euEtfs.length > 0) {
      console.log('\nPrzykładowe ETF (pierwsze 3):')
      euEtfs.slice(0, 3).forEach((etf, i) => {
        console.log(`\n${i + 1}. ${etf.symbol} - ${etf.name}`)
        console.log(`   MIC: ${etf.mic_code}`)
        console.log(`   Currency: ${etf.currency}`)
        console.log(`   ISIN: ${etf.isin || '❌ BRAK'}`)
      })

      const withIsin = euEtfs.filter(e => e.isin).length
      console.log(`\n📊 Pokrycie ISIN: ${withIsin}/${euEtfs.length} (${((withIsin / euEtfs.length) * 100).toFixed(1)}%)`)
    }

    // Test 3: Wyszukaj konkretny ETF (SPY)
    console.log('\n\n📋 Test 3: Konkretny ETF (SPY)')
    console.log('='.repeat(60))
    const spyResults = await fetchETFs({ symbol: 'SPY' })
    console.log(`✅ Znaleziono: ${spyResults.length} wyników dla SPY`)

    if (spyResults.length > 0) {
      const spy = spyResults[0]
      console.log('\nSPY Details:')
      console.log(JSON.stringify(spy, null, 2))
    }

    // Podsumowanie
    console.log('\n' + '='.repeat(60))
    console.log('📊 PODSUMOWANIE')
    console.log('='.repeat(60))

    const allEtfs = [...usEtfs, ...euEtfs]
    const uniqueExchanges = new Set(allEtfs.map(e => e.mic_code))
    const uniqueCurrencies = new Set(allEtfs.map(e => e.currency))
    const withIsin = allEtfs.filter(e => e.isin).length

    console.log(`\nŁącznie przetestowano: ${allEtfs.length} ETF`)
    console.log(`Unikalne giełdy (MIC): ${Array.from(uniqueExchanges).join(', ')}`)
    console.log(`Unikalne waluty: ${Array.from(uniqueCurrencies).join(', ')}`)
    console.log(`Z ISIN: ${withIsin}/${allEtfs.length} (${((withIsin / allEtfs.length) * 100).toFixed(1)}%)`)

    // Rekomendacje
    console.log('\n' + '='.repeat(60))
    console.log('💡 REKOMENDACJE')
    console.log('='.repeat(60))

    if (withIsin > 0) {
      console.log('\n✅ ISIN dostępny!')
      console.log('\nStrategia implementacji:')
      console.log('1. Dla każdej giełdy: GET /etfs?mic_code={MIC}')
      console.log('2. Zapisz do bazy (Exchange.mic -> ETF)')
      console.log('3. 1 request per giełda (9 giełd = 9 requests)')
      console.log('4. Całość < 1 minuta!')
    } else {
      console.log('\n⚠️ ISIN NIE dostępny w demo API key')
      console.log('\nNastępne kroki:')
      console.log('1. Załóż konto Twelve Data')
      console.log('2. Aktywuj "Data add-ons" dla ISIN')
      console.log('3. Przetestuj z prawdziwym API key')
      console.log('4. Sprawdź cennik (może być płatne)')
    }

    console.log('\n✅ Test zakończony!')

  } catch (error: any) {
    console.error('❌ Błąd:', error.message)
    if (error.response) {
      console.error('Response:', await error.response.text())
    }
  }
}

main()
