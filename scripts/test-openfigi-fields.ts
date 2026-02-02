import fetch from 'node-fetch'

const OPENFIGI_API_URL = 'https://api.openfigi.com/v3/mapping'

async function lookupFIGI(requests: any[]): Promise<any[]> {
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

  return (await response.json()) as any[]
}

async function main() {
  console.log('🧪 OpenFIGI Field Analysis - What fields are returned?\n')
  console.log('='.repeat(70))

  // Test 1: Ticker lookup - what fields?
  console.log('\n📋 Test 1: Ticker Lookup (IWDA @ XE)')
  console.log('-'.repeat(70))

  const tickerRequest = [{ idType: 'TICKER', idValue: 'IWDA', exchCode: 'XE' }]
  const tickerResults = await lookupFIGI(tickerRequest)

  console.log('\nFull response:')
  console.log(JSON.stringify(tickerResults, null, 2))

  if (tickerResults[0].data && tickerResults[0].data.length > 0) {
    const item = tickerResults[0].data[0]
    console.log('\n📊 Available fields:')
    Object.entries(item).forEach(([key, value]) => {
      console.log(`   ${key.padEnd(25)} = ${value}`)
    })
  }

  // Test 2: ISIN lookup - what fields?
  console.log('\n\n📋 Test 2: ISIN Lookup (IE00BK5BQT80 - VWCE)')
  console.log('-'.repeat(70))

  const isinRequest = [{ idType: 'ID_ISIN', idValue: 'IE00BK5BQT80' }]
  const isinResults = await lookupFIGI(isinRequest)

  if (isinResults[0].data && isinResults[0].data.length > 0) {
    console.log(`\nFound ${isinResults[0].data.length} listings`)
    console.log('\nFirst listing fields:')
    const item = isinResults[0].data[0]
    Object.entries(item).forEach(([key, value]) => {
      console.log(`   ${key.padEnd(25)} = ${value}`)
    })

    console.log('\n📝 Sample of first 3 listings:')
    isinResults[0].data.slice(0, 3).forEach((listing: any, i: number) => {
      console.log(`\n   Listing ${i + 1}:`)
      console.log(`      ticker: ${listing.ticker}`)
      console.log(`      exchCode: ${listing.exchCode}`)
      console.log(`      name: ${listing.name}`)
      console.log(`      figi: ${listing.figi}`)
      if (listing.shareClassFIGI) {
        console.log(`      shareClassFIGI: ${listing.shareClassFIGI}`)
      }
    })
  }

  // Test 3: Can we get ISIN from FIGI?
  console.log('\n\n📋 Test 3: Reverse lookup - FIGI to ISIN?')
  console.log('-'.repeat(70))

  if (tickerResults[0].data && tickerResults[0].data.length > 0) {
    const figi = tickerResults[0].data[0].figi
    console.log(`\nTrying to lookup FIGI: ${figi}`)

    const figiRequest = [{ idType: 'ID_BB_GLOBAL', idValue: figi }]
    const figiResults = await lookupFIGI(figiRequest)

    console.log('\nFIGI lookup result:')
    console.log(JSON.stringify(figiResults, null, 2))
  }

  // Test 4: Try shareClassFIGI if exists
  if (tickerResults[0].data && tickerResults[0].data.length > 0) {
    const shareClassFIGI = tickerResults[0].data[0].shareClassFIGI

    if (shareClassFIGI) {
      console.log('\n\n📋 Test 4: ShareClass FIGI lookup')
      console.log('-'.repeat(70))
      console.log(`\nTrying shareClassFIGI: ${shareClassFIGI}`)

      const shareRequest = [{ idType: 'ID_BB_GLOBAL', idValue: shareClassFIGI }]
      const shareResults = await lookupFIGI(shareRequest)

      console.log('\nShareClass FIGI result:')
      console.log(JSON.stringify(shareResults, null, 2))
    }
  }

  console.log('\n\n' + '='.repeat(70))
  console.log('📊 CONCLUSION')
  console.log('='.repeat(70))
  console.log('\n❓ Question: Does OpenFIGI return ISIN in any field?')
  console.log('   Need to check the JSON output above.\n')
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
