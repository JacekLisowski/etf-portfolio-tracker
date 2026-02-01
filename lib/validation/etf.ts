import { ValidationError } from '../errors'
import type { CreateEtfRequest } from '@/types/portfolio'

export function validateEtfData(data: CreateEtfRequest): void {
  const errors: Record<string, string> = {}

  // ISIN validation
  if (!data.isin || data.isin.trim() === '') {
    errors.isin = 'ISIN jest wymagany'
  } else if (!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(data.isin)) {
    errors.isin = 'ISIN ma nieprawidłowy format (powinien być: 2 litery + 9 znaków + 1 cyfra)'
  }

  // Exchange validation
  if (!data.exchangeId || data.exchangeId.trim() === '') {
    errors.exchangeId = 'Giełda jest wymagana'
  }

  // Ticker validation
  if (!data.ticker || data.ticker.trim() === '') {
    errors.ticker = 'Ticker jest wymagany'
  } else if (data.ticker.length > 10) {
    errors.ticker = 'Ticker nie może przekraczać 10 znaków'
  } else if (!/^[A-Z0-9]+$/.test(data.ticker)) {
    errors.ticker = 'Ticker może zawierać tylko wielkie litery i cyfry'
  }

  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Nazwa ETF jest wymagana'
  } else if (data.name.length > 200) {
    errors.name = 'Nazwa nie może przekraczać 200 znaków'
  }

  // Currency validation
  if (!data.currency || data.currency.trim() === '') {
    errors.currency = 'Waluta jest wymagana'
  } else if (!['EUR', 'USD', 'GBP', 'PLN', 'CHF'].includes(data.currency)) {
    errors.currency = 'Nieprawidłowa waluta (dozwolone: EUR, USD, GBP, PLN, CHF)'
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Dane ETF są nieprawidłowe', { errors })
  }
}
