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

export interface Etf {
  id: string
  isin: string
  exchangeId: string
  ticker: string
  name: string
  currency: string
  createdAt: Date
  updatedAt: Date
  exchange?: Exchange
}

export type TransactionType = 'BUY' | 'SELL'

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

export interface CreateEtfRequest {
  isin: string
  exchangeId: string
  ticker: string
  name: string
  currency: string
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
