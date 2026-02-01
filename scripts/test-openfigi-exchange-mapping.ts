import fetch from 'node-fetch'

const OPENFIGI_API_URL = 'https://api.openfigi.com/v3/mapping'

interface OpenFIGIRequest {
  idType?: string
  idValue: string
  exchCode?: string
  micCode?: string
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

  return await response.json()
}

async function main() {
  console.log('🧪 OpenFIGI Exchange Code Mapping Test\n')
  console.log('Goal: Find OpenFIGI exchCode for our 9 MIC codes\n')
  console.log('='.repeat(70))

  // Our 9 exchanges with known popular ETFs
  const exchangeTests = [
    {
      mic: 'XETR',
      name: 'Frankfurt (Xetra)',
      testTickers: ['IWDA', 'VWCE', 'EUNL'],
      possibleCodes: ['XE', 'GY', 'XETR', 'GER'],
    },
    {
      mic: 'XLON',
      name: 'London Stock Exchange',
      testTickers: ['VWRL', 'SWDA', 'VUSA'],
      possibleCodes: ['LN', 'XLON', 'LON', 'UK'],
    },
    {
      mic: 'XAMS',
      name: 'Euronext Amsterdam',
      testTickers: ['VWRL', 'IWDA'],
      possibleCodes: ['NA', 'XAMS', 'AMS', 'NL'],
    },
    {
      mic: 'XPAR',
      name: 'Euronext Paris',
      testTickers: ['CW8', 'PAEEM'],
      possibleCodes: ['FP', 'XPAR', 'PAR', 'FR'],
    },
    {
      mic: 'XMIL',
      name: 'Borsa Italiana',
      testTickers: ['SWDA', 'VWCE'],
      possibleCodes: ['IM', 'XMIL', 'MIL', 'IT'],
    },
    {
      mic: 'XSWX',
      name: 'SIX Swiss Exchange',
      testTickers: ['CHSPI', 'CSSPX'],
      possibleCodes: ['SW', 'SE', 'XSWX', 'SWX', 'CH'],
    },
    {
      mic: 'XNYS',
      name: 'NYSE',
      testTickers: ['SPY', 'DIA', 'IWM'],
      possibleCodes: ['US', 'XNYS', 'NYSE'],
    },
    {
      mic: 'XNAS',
      name: 'NASDAQ',
      testTickers: ['QQQ', 'IWF', 'VGT'],
      possibleCodes: ['US', 'XNAS', 'NASDAQ'],
    },
    {
      mic: 'XWAR',
      name: 'GPW Warszawa',
      testTickers: ['ETFW20L', 'ETFSP500'],
      possibleCodes: ['PW', 'XWAR', 'WAR', 'PL'],
    },
  ]

  const mapping: Record<string, string> = {}

  for (const exchange of exchangeTests) {
    console.log(`\n📍 ${exchange.mic} - ${exchange.name}`)
    console.log('-'.repeat(70))

    let found = false

    for (const code of exchange.possibleCodes) {
      // Test with first ticker only for speed
      const ticker = exchange.testTickers[0]

      const requests: OpenFIGIRequest[] = [
        { idType: 'TICKER', idValue: ticker, exchCode: code },
      ]

      try {
        const results = await lookupFIGI(requests)
        const result = results[0]

        if (result.data && result.data.length > 0) {
          const item = result.data[0]
          console.log(`   ✅ FOUND: exchCode="${code}" works!`)
          console.log(`      Ticker: ${item.ticker}`)
          console.log(`      Name: ${item.name}`)
          console.log(`      FIGI: ${item.figi}`)
          console.log(`      Exchange: ${item.exchCode}`)

          mapping[exchange.mic] = code
          found = true
          break
        }
      } catch (error: any) {
        console.log(`   ❌ Error testing "${code}": ${error.message}`)
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    if (!found) {
      console.log(`   ⚠️  No working code found for ${exchange.mic}`)
      console.log(`      Tested: ${exchange.possibleCodes.join(', ')}`)
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(70))
  console.log('📊 MAPPING SUMMARY')
  console.log('='.repeat(70))
  console.log('\nMIC → OpenFIGI Exchange Code:\n')

  Object.entries(mapping).forEach(([mic, code]) => {
    console.log(`   ${mic.padEnd(10)} → "${code}"`)
  })

  console.log(`\nFound: ${Object.keys(mapping).length}/9 exchanges`)

  // Generate TypeScript mapping
  console.log('\n\n' + '='.repeat(70))
  console.log('📝 TypeScript Mapping (copy to code):')
  console.log('='.repeat(70))
  console.log('\nconst MIC_TO_OPENFIGI: Record<string, string> = {')
  Object.entries(mapping).forEach(([mic, code]) => {
    console.log(`  '${mic}': '${code}',`)
  })
  console.log('}')
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
