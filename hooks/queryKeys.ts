export const queryKeys = {
  profile: {
    all: ['profile'] as const,
    detail: (userId: string) => ['profile', userId] as const,
  },
  positions: {
    all: ['positions'] as const,
    list: (userId: string) => ['positions', userId] as const,
    detail: (id: string) => ['positions', 'detail', id] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: (filters?: Record<string, unknown>) => ['transactions', filters] as const,
    detail: (id: string) => ['transactions', 'detail', id] as const,
  },
  nbp: {
    rate: (currency: string, date: string) => ['nbp', currency, date] as const,
  },
  etfPrices: {
    current: (ticker: string) => ['etf-prices', ticker] as const,
    historical: (ticker: string, date: string) => ['etf-prices', ticker, date] as const,
  },
  pit38: {
    jobs: (userId: string) => ['pit38', 'jobs', userId] as const,
    status: (jobId: string) => ['pit38', 'status', jobId] as const,
  },
  portfolio: {
    summary: (userId: string) => ['portfolio', 'summary', userId] as const,
    history: (userId: string, period: string) => ['portfolio', 'history', userId, period] as const,
  },
} as const
