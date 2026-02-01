// Portfolio-related TypeScript types

export interface Exchange {
  id: string
  mic: string
  name: string
  country: string
  currency: string
  timezone?: string | null
  createdAt?: Date
  updatedAt?: Date
}

// Enums
export type NameSource = 'ESMA_FIRDS' | 'FCA_FIRDS' | 'SIX' | 'FALLBACK'
export type ListingStatus = 'ACTIVE' | 'TERMINATED' | 'CANCELLED' | 'SUSPENDED'
export type TransactionType = 'BUY' | 'SELL'

// Instrument = ETF at ISIN level (one canonical name per ISIN)
export interface Instrument {
  isin: string // Primary key
  name: string
  nameSource: NameSource
  classification?: string | null
  nameConflict: boolean
  firstSeenAt: Date
  lastSeenAt: Date
  listings?: Etf[] // One instrument can have many listings
}

// Etf (Listing) = ETF traded on specific exchange (ISIN + MIC)
export interface Etf {
  id: string
  isin: string // Links to Instrument
  exchangeId: string
  ticker?: string | null
  tradingCurrency: string // Currency of this listing
  status: ListingStatus
  sourceSystem: string
  firstSeenAt: Date
  lastSeenAt: Date
  // Relations
  instrument?: Instrument
  exchange?: Exchange
}

export interface Transaction {
  id: string
  portfolioId: string
  etfId: string
  type: TransactionType
  date: Date
  quantity: number
  pricePerUnit: number
  totalAmount: number
  currency: string
  fees: number
  exchangeRate?: number | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  etf?: Etf
  portfolio?: Portfolio
}

export interface Portfolio {
  id: string
  userId: string
  name: string
  createdAt: Date
  updatedAt: Date
  transactions?: Transaction[]
}

// API Request/Response types

export interface CreateInstrumentRequest {
  isin: string
  name: string
  nameSource?: NameSource
  classification?: string
}

export interface CreateEtfRequest {
  isin: string
  exchangeId: string
  ticker?: string
  tradingCurrency: string
  status?: ListingStatus
  sourceSystem?: string
  // Optional: provide instrument data if it doesn't exist
  instrumentName?: string
  instrumentNameSource?: NameSource
}

export interface CreateTransactionRequest {
  // Either provide etfId for existing ETF
  etfId?: string
  // Or provide ETF data to create new one
  etf?: CreateEtfRequest

  type: TransactionType
  date: string // ISO 8601 format
  quantity: number
  pricePerUnit: number
  currency: string
  fees?: number
  notes?: string
}

export interface UpdateTransactionRequest {
  type?: TransactionType
  date?: string
  quantity?: number
  pricePerUnit?: number
  currency?: string
  fees?: number
  notes?: string
}

export interface SearchEtfsRequest {
  search?: string // Ticker, ISIN, or name
  exchangeId?: string
  limit?: number
  offset?: number
}

export interface GetTransactionsRequest {
  etfId?: string
  type?: TransactionType
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

// API Response types

export interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export interface ListResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface ExchangesResponse {
  exchanges: Exchange[]
}

export interface EtfsResponse {
  etfs: Etf[]
  total: number
}

export interface TransactionsResponse {
  transactions: Transaction[]
  total: number
}

export interface PortfolioResponse {
  portfolio: Portfolio
  transactions: Transaction[]
}

export interface TransactionResponse {
  transaction: Transaction
}

export interface EtfResponse {
  etf: Etf
}

// ETF Sync types (Twelve Data API)

export interface TwelveDataETF {
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
}

export interface EtfSyncConfig {
  rateLimit: number // requests per minute (max 60 for Twelve Data)
  exchanges?: string[] // MIC codes to sync (default: all)
  batchSize?: number // items to process per batch
}

export interface EtfSyncProgress {
  id: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused'
  totalExchanges: number
  processedExchanges: number
  totalEtfs: number
  processedEtfs: number
  createdInstruments: number
  createdListings: number
  errors: number
  startedAt: Date
  completedAt?: Date
  lastError?: string
}

export interface EtfSyncRequest {
  config?: EtfSyncConfig
  dryRun?: boolean // Preview mode, don't save to DB
}

export interface EtfSyncResponse {
  progress: EtfSyncProgress
  message: string
}
