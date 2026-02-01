/**
 * OpenFIGI API Service
 *
 * Enriches ETF data from Twelve Data with ISIN codes using OpenFIGI API.
 * Free API with no rate limits, supports bulk lookup.
 */

// Use global fetch (available in Node 18+ and Next.js)
// For older environments, polyfill may be needed
const OPENFIGI_API_URL = 'https://api.openfigi.com/v3/mapping'

// Mapping from our MIC codes to OpenFIGI exchange codes
const MIC_TO_OPENFIGI: Record<string, string> = {
  XETR: 'XE', // Frankfurt (Xetra)
  XLON: 'LN', // London Stock Exchange
  XAMS: 'NA', // Euronext Amsterdam
  XPAR: 'FP', // Euronext Paris
  XMIL: 'IM', // Borsa Italiana
  XSWX: 'SW', // SIX Swiss Exchange
  XNYS: 'US', // NYSE
  XNAS: 'US', // NASDAQ
  // XWAR not supported by OpenFIGI
}

export interface OpenFIGIRequest {
  idType?: string // "TICKER" | "ID_ISIN" | "ID_BB_GLOBAL" etc
  idValue: string
  exchCode?: string // OpenFIGI exchange code
  micCode?: string // MIC code
  currency?: string
  marketSecDes?: string // "ETF" to filter by security type
}

export interface OpenFIGIResult {
  figi?: string
  name?: string
  ticker?: string
  exchCode?: string
  compositeFIGI?: string
  securityType?: string
  marketSector?: string
  shareClassFIGI?: string
  securityType2?: string
  securityDescription?: string
}

export interface OpenFIGIResponse {
  data?: OpenFIGIResult[]
  error?: string
}

export interface EnrichmentRequest {
  ticker: string
  micCode: string // Our MIC code (will be mapped to OpenFIGI exchCode)
  currency?: string
}

export interface EnrichmentResult {
  ticker: string
  micCode: string
  isin?: string // Extracted from compositeFIGI or shareClassFIGI
  figi?: string
  name?: string
  success: boolean
  error?: string
}

/**
 * Call OpenFIGI API with bulk requests
 */
async function callOpenFIGI(requests: OpenFIGIRequest[]): Promise<OpenFIGIResponse[]> {
  const response = await fetch(OPENFIGI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requests),
  })

  if (!response.ok) {
    throw new Error(`OpenFIGI HTTP ${response.status}: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Extract ISIN from OpenFIGI result
 *
 * OpenFIGI doesn't return ISIN directly, but we can:
 * 1. Use shareClassFIGI (12-char FIGI that often corresponds to ISIN)
 * 2. Make a second call with shareClassFIGI to get ISIN
 *
 * For now, we'll use a workaround: reverse lookup with known ISINs
 * or extract from compositeFIGI if available.
 */
function extractISIN(result: OpenFIGIResult): string | undefined {
  // OpenFIGI doesn't directly return ISIN in ticker lookup
  // We need to use shareClassFIGI and do a reverse lookup
  // For MVP, we'll return undefined and handle this separately
  return undefined
}

/**
 * Enrich ticker data with OpenFIGI (bulk operation)
 *
 * @param requests - Array of ticker enrichment requests
 * @returns Array of enrichment results with ISIN (if found)
 */
export async function enrichWithOpenFIGI(
  requests: EnrichmentRequest[]
): Promise<EnrichmentResult[]> {
  const results: EnrichmentResult[] = []

  // Filter requests: only process MICs that we have mapping for
  const supportedRequests = requests.filter((req) => MIC_TO_OPENFIGI[req.micCode])
  const unsupportedRequests = requests.filter((req) => !MIC_TO_OPENFIGI[req.micCode])

  // Mark unsupported as failed
  unsupportedRequests.forEach((req) => {
    results.push({
      ticker: req.ticker,
      micCode: req.micCode,
      success: false,
      error: `MIC ${req.micCode} not supported by OpenFIGI`,
    })
  })

  if (supportedRequests.length === 0) {
    return results
  }

  // Build OpenFIGI requests
  const openFIGIRequests: OpenFIGIRequest[] = supportedRequests.map((req) => ({
    idType: 'TICKER',
    idValue: req.ticker,
    exchCode: MIC_TO_OPENFIGI[req.micCode],
    currency: req.currency,
    marketSecDes: 'ETF', // Filter for ETFs only
  }))

  try {
    const responses = await callOpenFIGI(openFIGIRequests)

    // Process responses
    responses.forEach((response, index) => {
      const request = supportedRequests[index]

      if (response.error) {
        results.push({
          ticker: request.ticker,
          micCode: request.micCode,
          success: false,
          error: response.error,
        })
      } else if (response.data && response.data.length > 0) {
        // Take first result (most relevant)
        const item = response.data[0]

        results.push({
          ticker: request.ticker,
          micCode: request.micCode,
          isin: extractISIN(item), // Will be undefined for now
          figi: item.figi,
          name: item.name,
          success: true,
        })
      } else {
        results.push({
          ticker: request.ticker,
          micCode: request.micCode,
          success: false,
          error: 'No results from OpenFIGI',
        })
      }
    })
  } catch (error: any) {
    // If bulk request fails, mark all as failed
    supportedRequests.forEach((req) => {
      results.push({
        ticker: req.ticker,
        micCode: req.micCode,
        success: false,
        error: error.message,
      })
    })
  }

  return results
}

/**
 * Get ISIN for a ticker on a specific exchange
 *
 * Note: OpenFIGI doesn't return ISIN directly in ticker lookup.
 * This is a placeholder for future implementation.
 *
 * Potential approaches:
 * 1. Use shareClassFIGI to lookup ISIN (requires second API call)
 * 2. Maintain our own ISIN database
 * 3. Use alternative data source (ISIN.org, ESMA FIRDS)
 */
export async function getISINForTicker(
  ticker: string,
  micCode: string
): Promise<string | null> {
  const results = await enrichWithOpenFIGI([{ ticker, micCode }])

  if (results.length > 0 && results[0].success && results[0].isin) {
    return results[0].isin
  }

  return null
}

/**
 * Lookup all listings for a given ISIN
 *
 * This works great with OpenFIGI! Returns all tickers/exchanges for an ISIN.
 */
export async function getListingsForISIN(isin: string): Promise<OpenFIGIResult[]> {
  const requests: OpenFIGIRequest[] = [
    {
      idType: 'ID_ISIN',
      idValue: isin,
    },
  ]

  const responses = await callOpenFIGI(requests)

  if (responses[0].data) {
    return responses[0].data
  }

  return []
}

/**
 * Check if a MIC code is supported by OpenFIGI
 */
export function isMICSupported(micCode: string): boolean {
  return micCode in MIC_TO_OPENFIGI
}

/**
 * Get OpenFIGI exchange code for a MIC code
 */
export function getOpenFIGIExchangeCode(micCode: string): string | undefined {
  return MIC_TO_OPENFIGI[micCode]
}
