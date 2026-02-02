import fetch from 'node-fetch'

const OPENFIGI_API_URL = 'https://api.openfigi.com/v3/mapping'

interface OpenFIGIRequest {
  idType?: string // "TICKER" | "ID_ISIN" | "ID_BB_GLOBAL" etc
  idValue: string
  exchCode?: string // Exchange code (optional)
  micCode?: string // MIC code (optional)
  currency?: string
  marketSecDes?: string // "ETF" to filter by security type
}

interface OpenFIGIResponse {
  data?: Array<{
    figi: string
    name: string
    ticker: string
    exchCode: string
    compositeFIGI?: string
    securityType?: string
    marketSector?: string
    shareClassFIGI?: string
    securityType2?: string
    securityDescription?: string
  }>
  error?: string
}

async function lookupFIGI(requests: OpenFIGIRequest[]): Promise<OpenFIGIResponse[]> {
  const response = await fetch(OPENFIGI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requests),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return (await response.json()) as OpenFIGIResponse[]
}

async function main() {
  console.log('🧪 Test OpenFIGI API - Ticker to ISIN mapping\n')

  // Test 1: Popular US ETFs
  console.log('📋 Test 1: US ETFs (SPY, QQQ, VTI)')
  console.log('='.repeat(60))

  const usEtfs: OpenFIGIRequest[] = [
    { idType: 'TICKER', idValue: 'SPY', exchCode: 'US' },
    { idType: 'TICKER', idValue: 'QQQ', exchCode: 'US' },
    { idType: 'TICKER', idValue: 'VTI', exchCode: 'US' },
  ]

  const usResults = await lookupFIGI(usEtfs)

  usResults.forEach((result, i) => {
    const req = usEtfs[i]
    console.log(`\n${req.idValue}:`)

    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`)
    } else if (result.data && result.data.length > 0) {
      result.data.forEach((item) => {
        console.log(`   ✅ Found: ${item.name}`)
        console.log(`      FIGI: ${item.figi}`)
        console.log(`      Ticker: ${item.ticker}`)
        console.log(`      Exchange: ${item.exchCode}`)
        console.log(`      Security Type: ${item.securityType || 'N/A'}`)
        console.log(`      Description: ${item.securityDescription || 'N/A'}`)
      })
    } else {
      console.log('   ⚠️ No results')
    }
  })

  // Test 2: European ETFs - trying different exchange codes
  console.log('\n\n📋 Test 2: European ETFs - Exchange Code Testing')
  console.log('='.repeat(60))

  // Test different exchange codes for Xetra
  const xetraCodes = ['GY', 'XE', 'XETR', 'GER']

  for (const code of xetraCodes) {
    console.log(`\n🔍 Testing exchCode: ${code}`)

    const euEtfs: OpenFIGIRequest[] = [
      { idType: 'TICKER', idValue: 'IWDA', exchCode: code },
      { idType: 'TICKER', idValue: 'VWCE', exchCode: code },
    ]

    const euResults = await lookupFIGI(euEtfs)

    euResults.forEach((result, i) => {
      const req = euEtfs[i]
      console.log(`   ${req.idValue}:`)

      if (result.error) {
        console.log(`      ❌ Error: ${result.error}`)
      } else if (result.data && result.data.length > 0) {
        result.data.forEach((item) => {
          console.log(`      ✅ ${item.name}`)
          console.log(`         FIGI: ${item.figi}`)
          console.log(`         Exchange: ${item.exchCode}`)
          console.log(`         Security Type: ${item.securityType || 'N/A'}`)
        })
      } else {
        console.log('      ⚠️ No results')
      }
    })
  }

  // Test 3: Lookup by ISIN (reverse lookup)
  console.log('\n\n📋 Test 3: Lookup by ISIN (IE00B4L5Y983 - iShares Core MSCI World)')
  console.log('='.repeat(60))

  const isinLookup: OpenFIGIRequest[] = [
    { idType: 'ID_ISIN', idValue: 'IE00B4L5Y983' },
  ]

  const isinResults = await lookupFIGI(isinLookup)

  isinResults.forEach((result) => {
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`)
    } else if (result.data && result.data.length > 0) {
      console.log(`   ✅ Found ${result.data.length} listings:`)
      result.data.forEach((item) => {
        console.log(`\n      ${item.ticker} @ ${item.exchCode}`)
        console.log(`      Name: ${item.name}`)
        console.log(`      FIGI: ${item.figi}`)
        console.log(`      Security Type: ${item.securityType || 'N/A'}`)
      })
    }
  })

  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  console.log('\nOpenFIGI can:')
  console.log('✅ Map ticker → FIGI (Bloomberg ID)')
  console.log('❓ Map ticker → ISIN (need to check response)')
  console.log('✅ Map ISIN → ticker (reverse lookup)')
  console.log('✅ Free, no rate limits')
  console.log('✅ Bulk lookup (multiple tickers at once)')
  console.log('\n💡 Potential strategy:')
  console.log('   1. Use Twelve Data for ticker list')
  console.log('   2. Use OpenFIGI to enrich with FIGI/ISIN')
  console.log('   3. Store in our database')
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
