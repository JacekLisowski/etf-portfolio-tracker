import { ValidationError } from '../errors'
import type { CreateTransactionRequest, UpdateTransactionRequest } from '@/types/portfolio'

export function validateTransactionData(data: CreateTransactionRequest): void {
  const errors: Record<string, string> = {}

  // ETF validation
  if (!data.etfId && !data.etf) {
    errors.etf = 'ETF jest wymagany'
  }

  if (data.etf) {
    if (!data.etf.isin || data.etf.isin.trim() === '') {
      errors['etf.isin'] = 'ISIN jest wymagany'
    }
    if (!data.etf.exchangeId || data.etf.exchangeId.trim() === '') {
      errors['etf.exchangeId'] = 'Giełda jest wymagana'
    }
    if (!data.etf.ticker || data.etf.ticker.trim() === '') {
      errors['etf.ticker'] = 'Ticker jest wymagany'
    }
    if (!data.etf.name || data.etf.name.trim() === '') {
      errors['etf.name'] = 'Nazwa ETF jest wymagana'
    }
    if (!data.etf.currency || data.etf.currency.trim() === '') {
      errors['etf.currency'] = 'Waluta jest wymagana'
    }
  }

  // Type validation
  if (!data.type || !['BUY', 'SELL'].includes(data.type)) {
    errors.type = 'Typ transakcji jest nieprawidłowy'
  }

  // Date validation
  if (!data.date) {
    errors.date = 'Data jest wymagana'
  } else {
    const transactionDate = new Date(data.date)
    if (isNaN(transactionDate.getTime())) {
      errors.date = 'Data jest nieprawidłowa'
    } else if (transactionDate > new Date()) {
      errors.date = 'Data nie może być w przyszłości'
    }
  }

  // Quantity validation
  if (data.quantity === undefined || data.quantity === null) {
    errors.quantity = 'Ilość jest wymagana'
  } else if (typeof data.quantity !== 'number' || data.quantity <= 0) {
    errors.quantity = 'Ilość musi być większa od 0'
  }

  // Price validation
  if (data.pricePerUnit === undefined || data.pricePerUnit === null) {
    errors.pricePerUnit = 'Cena jest wymagana'
  } else if (typeof data.pricePerUnit !== 'number' || data.pricePerUnit <= 0) {
    errors.pricePerUnit = 'Cena musi być większa od 0'
  }

  // Currency validation
  if (!data.currency || data.currency.trim() === '') {
    errors.currency = 'Waluta jest wymagana'
  } else if (!['EUR', 'USD', 'GBP', 'PLN', 'CHF'].includes(data.currency)) {
    errors.currency = 'Nieprawidłowa waluta'
  }

  // Fees validation (optional, but must be non-negative)
  if (data.fees !== undefined && data.fees !== null) {
    if (typeof data.fees !== 'number' || data.fees < 0) {
      errors.fees = 'Prowizja nie może być ujemna'
    }
  }

  // Notes validation (optional, but check length if provided)
  if (data.notes && data.notes.length > 500) {
    errors.notes = 'Notatki nie mogą przekraczać 500 znaków'
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Dane transakcji są nieprawidłowe', { errors })
  }
}

export function validateUpdateTransactionData(data: UpdateTransactionRequest): void {
  const errors: Record<string, string> = {}

  // Type validation (if provided)
  if (data.type !== undefined && !['BUY', 'SELL'].includes(data.type)) {
    errors.type = 'Typ transakcji jest nieprawidłowy'
  }

  // Date validation (if provided)
  if (data.date !== undefined) {
    const transactionDate = new Date(data.date)
    if (isNaN(transactionDate.getTime())) {
      errors.date = 'Data jest nieprawidłowa'
    } else if (transactionDate > new Date()) {
      errors.date = 'Data nie może być w przyszłości'
    }
  }

  // Quantity validation (if provided)
  if (data.quantity !== undefined) {
    if (typeof data.quantity !== 'number' || data.quantity <= 0) {
      errors.quantity = 'Ilość musi być większa od 0'
    }
  }

  // Price validation (if provided)
  if (data.pricePerUnit !== undefined) {
    if (typeof data.pricePerUnit !== 'number' || data.pricePerUnit <= 0) {
      errors.pricePerUnit = 'Cena musi być większa od 0'
    }
  }

  // Currency validation (if provided)
  if (data.currency !== undefined) {
    if (!['EUR', 'USD', 'GBP', 'PLN', 'CHF'].includes(data.currency)) {
      errors.currency = 'Nieprawidłowa waluta'
    }
  }

  // Fees validation (if provided)
  if (data.fees !== undefined) {
    if (typeof data.fees !== 'number' || data.fees < 0) {
      errors.fees = 'Prowizja nie może być ujemna'
    }
  }

  // Notes validation (if provided)
  if (data.notes !== undefined && data.notes !== null && data.notes.length > 500) {
    errors.notes = 'Notatki nie mogą przekraczać 500 znaków'
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Dane transakcji są nieprawidłowe', { errors })
  }
}
