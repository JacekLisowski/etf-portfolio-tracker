import { ValidationError } from '../errors'
import type { CreateEtfRequest } from '@/types/portfolio'

export function validateEtfData(data: CreateEtfRequest): void {
  const errors: Record<string, string> = {}

  // ISIN validation (allow temporary ISINs starting with TEMP-)
  if (!data.isin || data.isin.trim() === '') {
    errors.isin = 'ISIN jest wymagany'
  } else if (
    !data.isin.startsWith('TEMP-') &&
    !/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(data.isin)
  ) {
    errors.isin = 'ISIN ma nieprawidłowy format (powinien być: 2 litery + 9 znaków + 1 cyfra)'
  }

  // Exchange validation
  if (!data.exchangeId || data.exchangeId.trim() === '') {
    errors.exchangeId = 'Giełda jest wymagana'
  }

  // Ticker validation (optional now)
  if (data.ticker) {
    if (data.ticker.length > 10) {
      errors.ticker = 'Ticker nie może przekraczać 10 znaków'
    } else if (!/^[A-Z0-9]+$/i.test(data.ticker)) {
      errors.ticker = 'Ticker może zawierać tylko litery i cyfry'
    }
  }

  // Instrument name validation (optional)
  if (data.instrumentName) {
    if (data.instrumentName.length > 200) {
      errors.instrumentName = 'Nazwa nie może przekraczać 200 znaków'
    }
  }

  // Trading currency validation
  if (!data.tradingCurrency || data.tradingCurrency.trim() === '') {
    errors.tradingCurrency = 'Waluta transakcyjna jest wymagana'
  } else if (!['EUR', 'USD', 'GBP', 'PLN', 'CHF'].includes(data.tradingCurrency)) {
    errors.tradingCurrency = 'Nieprawidłowa waluta (dozwolone: EUR, USD, GBP, PLN, CHF)'
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Dane ETF są nieprawidłowe', { errors })
  }
}
