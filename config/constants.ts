export const APP_NAME = 'ETF Portfolio Tracker'

export const SUPPORTED_CURRENCIES = ['PLN', 'EUR', 'USD', 'GBP'] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

export const TRANSACTION_TYPES = ['BUY', 'SELL', 'DIVIDEND'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export const SUBSCRIPTION_TIERS = ['FREE', 'PREMIUM'] as const
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number]

export const FREE_TIER_LIMITS = {
  MAX_BROKERS: 1,
  HISTORY_YEARS: 1,
} as const

export const PERFORMANCE_BUDGETS = {
  FREE: {
    pit38Generation: 5000, // 5s max
    fifoPreview: 1000, // 1s max
  },
  PREMIUM: {
    pit38Generation: 8000, // 8s max
    fifoPreview: 2000, // 2s max
  },
  VERCEL_TIMEOUT_WARNING: 8000, // Alert at 8s (before 10s limit)
  FIFO_COMPLEXITY_LIMIT: 1000, // Max transactions per FIFO calc
  LCP_TARGET: 2500, // Largest Contentful Paint
  FID_TARGET: 100, // First Input Delay
  CLS_TARGET: 0.1, // Cumulative Layout Shift
} as const
