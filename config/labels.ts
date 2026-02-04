/**
 * Polish labels and translations for ETF Portfolio Tracker
 * Central location for all UI text to maintain consistency
 */

// ============================================================================
// General UI
// ============================================================================

export const LABELS = {
  // App
  appName: 'ETF Portfolio Tracker',

  // Navigation
  nav: {
    home: 'Strona główna',
    portfolio: 'Portfolio',
    transactions: 'Transakcje',
    analytics: 'Analityka',
    settings: 'Ustawienia',
    admin: 'Administracja',
    logout: 'Wyloguj się',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Witaj',
    welcomeFallback: 'Inwestorze',
    loggedInAs: 'Zalogowany jako',
    portfolioValue: 'Wartość portfela',
    gainLoss: 'Zysk/Strata',
    positionsCount: 'Liczba pozycji',
    etfsUnit: 'ETF-ów',
    noData: 'Brak danych',
    yourPortfolio: 'Twoje portfolio',
    noPositions: 'Nie masz jeszcze żadnych pozycji w portfelu.',
    noPositionsHint: 'Przejdź do sekcji Transakcje, aby dodać pierwszą transakcję.',
  },

  // Common actions
  actions: {
    add: 'Dodaj',
    edit: 'Edytuj',
    delete: 'Usuń',
    cancel: 'Anuluj',
    save: 'Zapisz',
    close: 'Zamknij',
    confirm: 'Potwierdź',
    search: 'Szukaj',
    filter: 'Filtruj',
    reset: 'Resetuj',
    export: 'Eksportuj',
    import: 'Importuj',
    refresh: 'Odśwież',
    back: 'Wstecz',
    next: 'Dalej',
    previous: 'Poprzedni',
    loading: 'Ładowanie...',
    noData: 'Brak danych',
    error: 'Błąd',
    success: 'Sukces',
  },

  // ============================================================================
  // Portfolio Page
  // ============================================================================

  portfolio: {
    title: 'Moje Portfolio',
    summary: 'Podsumowanie Portfolio',
    holdings: 'Posiadane Aktywa',
    addTransaction: 'Dodaj Transakcję',
    noHoldings: 'Nie posiadasz jeszcze żadnych ETF-ów',
    noHoldingsDescription: 'Zacznij budować swoje portfolio dodając pierwszą transakcję',

    // Summary cards
    totalValue: 'Całkowita wartość',
    totalInvested: 'Zainwestowano',
    totalGainLoss: 'Zysk/Strata',
    totalReturn: 'Zwrot',
    dailyChange: 'Zmiana dzienna',

    // Holdings table
    table: {
      symbol: 'Symbol',
      name: 'Nazwa',
      exchange: 'Giełda',
      quantity: 'Ilość',
      avgPrice: 'Śr. cena zakupu',
      currentPrice: 'Cena aktualna',
      marketValue: 'Wartość rynkowa',
      totalCost: 'Koszt całkowity',
      gainLoss: 'Zysk/Strata',
      gainLossPercent: 'Zysk/Strata %',
      allocation: 'Alokacja',
      lastUpdate: 'Ostatnia aktualizacja',
    },
  },

  // ============================================================================
  // Transaction Form
  // ============================================================================

  transaction: {
    title: 'Nowa Transakcja',
    editTitle: 'Edytuj Transakcję',

    // Transaction types
    types: {
      BUY: 'Kupno',
      SELL: 'Sprzedaż',
      DIVIDEND: 'Dywidenda',
    },

    // Form fields
    form: {
      type: 'Typ transakcji',
      date: 'Data transakcji',
      etf: 'ETF',
      exchange: 'Giełda',
      quantity: 'Ilość',
      price: 'Cena',
      currency: 'Waluta',
      commission: 'Prowizja',
      notes: 'Notatki',

      // Placeholders
      selectEtf: 'Wybierz ETF...',
      selectExchange: 'Wybierz giełdę...',
      selectCurrency: 'Wybierz walutę...',
      enterQuantity: 'Wpisz ilość',
      enterPrice: 'Wpisz cenę',
      enterCommission: 'Wpisz prowizję (opcjonalnie)',
      enterNotes: 'Dodaj notatki (opcjonalnie)',
    },

    // Validation messages
    validation: {
      required: 'To pole jest wymagane',
      positiveNumber: 'Wartość musi być dodatnia',
      invalidDate: 'Nieprawidłowa data',
      dateInFuture: 'Data nie może być w przyszłości',
      quantityTooLow: 'Ilość musi być większa niż 0',
      priceTooLow: 'Cena musi być większa niż 0',
      insufficientQuantity: 'Niewystarczająca ilość do sprzedaży',
    },

    // Confirmation
    confirmation: {
      title: 'Potwierdzenie transakcji',
      summary: 'Czy na pewno chcesz zapisać tę transakcję?',
      delete: 'Czy na pewno chcesz usunąć tę transakcję?',
      deleteWarning: 'Ta operacja jest nieodwracalna',
    },
  },

  // ============================================================================
  // ETF / Instrument
  // ============================================================================

  etf: {
    search: 'Szukaj ETF-a',
    searchPlaceholder: 'Wpisz symbol lub nazwę ETF-a...',
    noResults: 'Nie znaleziono ETF-ów',

    details: {
      symbol: 'Symbol',
      name: 'Nazwa',
      isin: 'ISIN',
      exchange: 'Giełda',
      currency: 'Waluta',
      type: 'Typ',
      category: 'Kategoria',
      description: 'Opis',
    },

    // Temporary ISIN indicator
    temporaryIsin: 'ISIN tymczasowy',
    temporaryIsinTooltip: 'Ten ETF ma tymczasowy identyfikator ISIN. Zostanie zastąpiony oficjalnym ISIN z ESMA FIRDS.',
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
    XWAR: 'Giełda Papierów Wartościowych w Warszawie',
    XNYS: 'New York Stock Exchange',
    XNAS: 'NASDAQ',
  },

  // ============================================================================
  // Currencies
  // ============================================================================

  currency: {
    PLN: 'Polski złoty',
    EUR: 'Euro',
    USD: 'Dolar amerykański',
    GBP: 'Funt brytyjski',
  },

  // ============================================================================
  // Analytics
  // ============================================================================

  analytics: {
    title: 'Analityka Portfolio',

    performance: {
      title: 'Wyniki',
      timeWeighted: 'Zwrot ważony czasem',
      moneyWeighted: 'Zwrot ważony kapitałem',

      periods: {
        '1D': '1 dzień',
        '1W': '1 tydzień',
        '1M': '1 miesiąc',
        '3M': '3 miesiące',
        '6M': '6 miesięcy',
        'YTD': 'Od początku roku',
        '1Y': '1 rok',
        '3Y': '3 lata',
        '5Y': '5 lat',
        'ALL': 'Cały okres',
      },
    },

    allocation: {
      title: 'Alokacja Aktywów',
      byEtf: 'Według ETF',
      byExchange: 'Według giełdy',
      byCurrency: 'Według waluty',
      byCategory: 'Według kategorii',
    },

    transactions: {
      title: 'Historia Transakcji',
      total: 'Łącznie transakcji',
      totalBuy: 'Kupno',
      totalSell: 'Sprzedaż',
      totalDividend: 'Dywidenda',
    },
  },

  // ============================================================================
  // Admin
  // ============================================================================

  admin: {
    title: 'Panel Administracyjny',

    etfSync: {
      title: 'Synchronizacja ETF',
      description: 'Synchronizuj listę ETF-ów z zewnętrznych źródeł danych',
      button: 'Rozpocznij synchronizację',
      running: 'Synchronizacja w toku...',

      options: {
        exchanges: 'Giełdy',
        selectAll: 'Wybierz wszystkie',
        deselectAll: 'Odznacz wszystkie',
      },

      progress: {
        fetching: 'Pobieranie listy ETF-ów...',
        processing: 'Przetwarzanie',
        completed: 'Zakończono synchronizację',
        failed: 'Synchronizacja nie powiodła się',
      },

      stats: {
        total: 'Łącznie ETF-ów',
        created: 'Utworzone',
        updated: 'Zaktualizowane',
        skipped: 'Pominięte',
        errors: 'Błędy',
      },
    },
  },

  // ============================================================================
  // Settings
  // ============================================================================

  settings: {
    title: 'Ustawienia',

    general: {
      title: 'Ustawienia ogólne',
      language: 'Język',
      currency: 'Domyślna waluta',
      timezone: 'Strefa czasowa',
    },

    notifications: {
      title: 'Powiadomienia',
      email: 'Powiadomienia email',
      priceAlerts: 'Alerty cenowe',
      dailySummary: 'Dzienny raport',
    },

    privacy: {
      title: 'Prywatność i bezpieczeństwo',
      twoFactor: 'Uwierzytelnianie dwuskładnikowe',
      sessions: 'Aktywne sesje',
      dataExport: 'Eksport danych',
      deleteAccount: 'Usuń konto',
    },
  },

  // ============================================================================
  // Error Messages
  // ============================================================================

  errors: {
    general: 'Wystąpił nieoczekiwany błąd',
    networkError: 'Błąd połączenia sieciowego',
    unauthorized: 'Brak uprawnień',
    forbidden: 'Dostęp zabroniony',
    notFound: 'Nie znaleziono',
    serverError: 'Błąd serwera',

    // Specific errors
    portfolioNotFound: 'Nie znaleziono portfolio',
    transactionNotFound: 'Nie znaleziono transakcji',
    etfNotFound: 'Nie znaleziono ETF-a',
    exchangeNotFound: 'Nie znaleziono giełdy',

    // Validation
    invalidInput: 'Nieprawidłowe dane wejściowe',
    missingRequired: 'Brakuje wymaganych pól',
    duplicateEntry: 'Rekord już istnieje',
  },

  // ============================================================================
  // Success Messages
  // ============================================================================

  success: {
    transactionCreated: 'Transakcja została dodana',
    transactionUpdated: 'Transakcja została zaktualizowana',
    transactionDeleted: 'Transakcja została usunięta',

    portfolioCreated: 'Portfolio zostało utworzone',
    portfolioUpdated: 'Portfolio zostało zaktualizowane',

    settingsSaved: 'Ustawienia zostały zapisane',

    dataExported: 'Dane zostały wyeksportowane',
    dataImported: 'Dane zostały zaimportowane',
  },

  // ============================================================================
  // Date & Time
  // ============================================================================

  date: {
    today: 'Dzisiaj',
    yesterday: 'Wczoraj',
    thisWeek: 'Ten tydzień',
    lastWeek: 'Ostatni tydzień',
    thisMonth: 'Ten miesiąc',
    lastMonth: 'Ostatni miesiąc',
    thisYear: 'Ten rok',

    format: {
      short: 'dd.MM.yyyy',
      long: 'dd MMMM yyyy',
      withTime: 'dd.MM.yyyy HH:mm',
    },
  },

  // ============================================================================
  // Units & Formatting
  // ============================================================================

  units: {
    currency: {
      format: (value: number, currency: string) =>
        new Intl.NumberFormat('pl-PL', {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value),
    },

    number: {
      format: (value: number) =>
        new Intl.NumberFormat('pl-PL', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value),
    },

    percent: {
      format: (value: number) =>
        new Intl.NumberFormat('pl-PL', {
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value / 100),
    },
  },
} as const

// Type helper for deep readonly
export type Labels = typeof LABELS
