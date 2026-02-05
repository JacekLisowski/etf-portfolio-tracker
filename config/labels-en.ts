/**
 * English labels and translations for ETF Portfolio Tracker
 * Central location for all UI text to maintain consistency
 */

// ============================================================================
// General UI
// ============================================================================

export const LABELS_EN = {
  // App
  appName: 'ETF Portfolio Tracker',

  // Navigation
  nav: {
    home: 'Home',
    portfolio: 'Portfolio',
    transactions: 'Transactions',
    analytics: 'Analytics',
    settings: 'Settings',
    admin: 'Administration',
    logout: 'Sign out',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome',
    welcomeFallback: 'Investor',
    loggedInAs: 'Logged in as',
    portfolioValue: 'Portfolio value',
    gainLoss: 'Gain/Loss',
    positionsCount: 'Number of positions',
    etfsUnit: 'ETFs',
    noData: 'No data',
    yourPortfolio: 'Your portfolio',
    noPositions: 'You don\'t have any positions in your portfolio yet.',
    noPositionsHint: 'Go to the Transactions section to add your first transaction.',
  },

  // Common actions
  actions: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    confirm: 'Confirm',
    search: 'Search',
    filter: 'Filter',
    reset: 'Reset',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    noData: 'No data',
    error: 'Error',
    success: 'Success',
  },

  // ============================================================================
  // Portfolio Page
  // ============================================================================

  portfolio: {
    title: 'My Portfolio',
    summary: 'Portfolio Summary',
    holdings: 'Holdings',
    addTransaction: 'Add Transaction',
    noHoldings: 'You don\'t have any ETFs yet',
    noHoldingsDescription: 'Start building your portfolio by adding your first transaction',

    // Summary cards
    totalValue: 'Total value',
    totalInvested: 'Invested',
    totalGainLoss: 'Gain/Loss',
    totalReturn: 'Return',
    dailyChange: 'Daily change',

    // Holdings table
    table: {
      symbol: 'Symbol',
      name: 'Name',
      exchange: 'Exchange',
      quantity: 'Quantity',
      avgPrice: 'Avg. purchase price',
      currentPrice: 'Current price',
      marketValue: 'Market value',
      totalCost: 'Total cost',
      gainLoss: 'Gain/Loss',
      gainLossPercent: 'Gain/Loss %',
      allocation: 'Allocation',
      lastUpdate: 'Last update',
    },
  },

  // ============================================================================
  // Transaction Form
  // ============================================================================

  transaction: {
    title: 'New Transaction',
    editTitle: 'Edit Transaction',

    // Transaction types
    types: {
      BUY: 'Buy',
      SELL: 'Sell',
      DIVIDEND: 'Dividend',
    },

    // Form fields
    form: {
      type: 'Transaction type',
      date: 'Transaction date',
      etf: 'ETF',
      exchange: 'Exchange',
      quantity: 'Quantity',
      price: 'Price',
      currency: 'Currency',
      commission: 'Commission',
      notes: 'Notes',

      // Placeholders
      selectEtf: 'Select ETF...',
      selectExchange: 'Select exchange...',
      selectCurrency: 'Select currency...',
      enterQuantity: 'Enter quantity',
      enterPrice: 'Enter price',
      enterCommission: 'Enter commission (optional)',
      enterNotes: 'Add notes (optional)',
    },

    // Validation messages
    validation: {
      required: 'This field is required',
      positiveNumber: 'Value must be positive',
      invalidDate: 'Invalid date',
      dateInFuture: 'Date cannot be in the future',
      quantityTooLow: 'Quantity must be greater than 0',
      priceTooLow: 'Price must be greater than 0',
      insufficientQuantity: 'Insufficient quantity to sell',
    },

    // Confirmation
    confirmation: {
      title: 'Transaction confirmation',
      summary: 'Are you sure you want to save this transaction?',
      delete: 'Are you sure you want to delete this transaction?',
      deleteWarning: 'This operation is irreversible',
    },
  },

  // ============================================================================
  // ETF / Instrument
  // ============================================================================

  etf: {
    search: 'Search ETF',
    searchPlaceholder: 'Enter ETF symbol or name...',
    noResults: 'No ETFs found',

    details: {
      symbol: 'Symbol',
      name: 'Name',
      isin: 'ISIN',
      exchange: 'Exchange',
      currency: 'Currency',
      type: 'Type',
      category: 'Category',
      description: 'Description',
    },

    // Temporary ISIN indicator
    temporaryIsin: 'Temporary ISIN',
    temporaryIsinTooltip: 'This ETF has a temporary ISIN identifier. It will be replaced with the official ISIN from ESMA FIRDS.',
  },

  // ============================================================================
  // Exchanges
  // ============================================================================

  exchange: {
    XETR: 'Frankfurt Xetra',
    XLON: 'London Stock Exchange',
    XAMS: 'Euronext Amsterdam',
    XPAR: 'Euronext Paris',
    XMIL: 'Borsa Italiana',
    XSWX: 'SIX Swiss Exchange',
    XWAR: 'Warsaw Stock Exchange',
    XNYS: 'New York Stock Exchange',
    XNAS: 'NASDAQ',
  },

  // ============================================================================
  // Currencies
  // ============================================================================

  currency: {
    PLN: 'Polish zloty',
    EUR: 'Euro',
    USD: 'US Dollar',
    GBP: 'British pound',
  },

  // ============================================================================
  // Analytics
  // ============================================================================

  analytics: {
    title: 'Portfolio Analytics',

    performance: {
      title: 'Performance',
      timeWeighted: 'Time-weighted return',
      moneyWeighted: 'Money-weighted return',

      periods: {
        '1D': '1 day',
        '1W': '1 week',
        '1M': '1 month',
        '3M': '3 months',
        '6M': '6 months',
        'YTD': 'Year to date',
        '1Y': '1 year',
        '3Y': '3 years',
        '5Y': '5 years',
        'ALL': 'All time',
      },
    },

    allocation: {
      title: 'Asset Allocation',
      byEtf: 'By ETF',
      byExchange: 'By exchange',
      byCurrency: 'By currency',
      byCategory: 'By category',
    },

    transactions: {
      title: 'Transaction History',
      total: 'Total transactions',
      totalBuy: 'Buy',
      totalSell: 'Sell',
      totalDividend: 'Dividend',
    },
  },

  // ============================================================================
  // Admin
  // ============================================================================

  admin: {
    title: 'Admin Panel',

    etfSync: {
      title: 'ETF Sync',
      description: 'Synchronize ETF list from external data sources',
      button: 'Start sync',
      running: 'Sync in progress...',

      options: {
        exchanges: 'Exchanges',
        selectAll: 'Select all',
        deselectAll: 'Deselect all',
      },

      progress: {
        fetching: 'Fetching ETF list...',
        processing: 'Processing',
        completed: 'Sync completed',
        failed: 'Sync failed',
      },

      stats: {
        total: 'Total ETFs',
        created: 'Created',
        updated: 'Updated',
        skipped: 'Skipped',
        errors: 'Errors',
      },
    },
  },

  // ============================================================================
  // Settings
  // ============================================================================

  settings: {
    title: 'Settings',
    profile: 'Profile',
    email: 'Email',
    name: 'Name',
    namePlaceholder: 'Enter your name',
    language: 'Language',
    languagePolski: 'Polski',
    languageEnglish: 'English',
    saveChanges: 'Save changes',
    profileUpdated: 'Profile updated',

    general: {
      title: 'General Settings',
      language: 'Language',
      currency: 'Default currency',
      timezone: 'Timezone',
    },

    notifications: {
      title: 'Notifications',
      email: 'Email notifications',
      priceAlerts: 'Price alerts',
      dailySummary: 'Daily summary',
    },

    privacy: {
      title: 'Privacy and Security',
      twoFactor: 'Two-factor authentication',
      sessions: 'Active sessions',
      dataExport: 'Data export',
      deleteAccount: 'Delete account',
    },
  },

  // ============================================================================
  // Error Messages
  // ============================================================================

  errors: {
    general: 'An unexpected error occurred',
    networkError: 'Network connection error',
    unauthorized: 'Unauthorized',
    forbidden: 'Access forbidden',
    notFound: 'Not found',
    serverError: 'Server error',

    // Specific errors
    portfolioNotFound: 'Portfolio not found',
    transactionNotFound: 'Transaction not found',
    etfNotFound: 'ETF not found',
    exchangeNotFound: 'Exchange not found',

    // Validation
    invalidInput: 'Invalid input',
    missingRequired: 'Missing required fields',
    duplicateEntry: 'Record already exists',
  },

  // ============================================================================
  // Success Messages
  // ============================================================================

  success: {
    transactionCreated: 'Transaction has been added',
    transactionUpdated: 'Transaction has been updated',
    transactionDeleted: 'Transaction has been deleted',

    portfolioCreated: 'Portfolio has been created',
    portfolioUpdated: 'Portfolio has been updated',

    settingsSaved: 'Settings have been saved',

    dataExported: 'Data has been exported',
    dataImported: 'Data has been imported',
  },

  // ============================================================================
  // Date & Time
  // ============================================================================

  date: {
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    thisYear: 'This year',

    format: {
      short: 'MM/dd/yyyy',
      long: 'MMMM dd, yyyy',
      withTime: 'MM/dd/yyyy HH:mm',
    },
  },

  // ============================================================================
  // Units & Formatting
  // ============================================================================

  units: {
    currency: {
      format: (value: number, currency: string) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value),
    },

    number: {
      format: (value: number) =>
        new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value),
    },

    percent: {
      format: (value: number) =>
        new Intl.NumberFormat('en-US', {
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value / 100),
    },
  },
} as const

// Type helper for deep readonly
export type LabelsEN = typeof LABELS_EN
