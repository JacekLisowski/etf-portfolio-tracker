import { describe, it, expect } from 'vitest'

describe('Example test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })

  it('should work with strings', () => {
    expect('ETF Portfolio Tracker').toContain('ETF')
  })
})
