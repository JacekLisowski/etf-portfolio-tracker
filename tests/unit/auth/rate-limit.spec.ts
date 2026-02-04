import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkMagicLinkRateLimit,
  resetRateLimit,
  getRateLimitStatus,
} from '@/lib/middleware/rateLimitMagicLink'

describe('rateLimitMagicLink', () => {
  const testEmail = 'test@example.com'

  beforeEach(() => {
    // Reset rate limit before each test
    resetRateLimit(testEmail)
  })

  describe('checkMagicLinkRateLimit', () => {
    it('allows first request', () => {
      const result = checkMagicLinkRateLimit(testEmail)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })

    it('allows up to 3 requests within window', () => {
      const result1 = checkMagicLinkRateLimit(testEmail)
      const result2 = checkMagicLinkRateLimit(testEmail)
      const result3 = checkMagicLinkRateLimit(testEmail)

      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(2)

      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(1)

      expect(result3.allowed).toBe(true)
      expect(result3.remaining).toBe(0)
    })

    it('blocks 4th request within window', () => {
      // Make 3 allowed requests
      checkMagicLinkRateLimit(testEmail)
      checkMagicLinkRateLimit(testEmail)
      checkMagicLinkRateLimit(testEmail)

      // 4th request should be blocked
      const result = checkMagicLinkRateLimit(testEmail)

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
      expect(result.retryAfter).toBeLessThanOrEqual(300) // 5 minutes max
    })

    it('normalizes email to lowercase', () => {
      checkMagicLinkRateLimit('TEST@EXAMPLE.COM')
      checkMagicLinkRateLimit('Test@Example.Com')
      checkMagicLinkRateLimit('test@example.com')

      // All should count towards same limit
      const result = checkMagicLinkRateLimit(testEmail)

      expect(result.allowed).toBe(false)
    })

    it('trims whitespace from email', () => {
      checkMagicLinkRateLimit('  test@example.com  ')
      checkMagicLinkRateLimit('test@example.com')
      checkMagicLinkRateLimit('test@example.com')

      const result = checkMagicLinkRateLimit(testEmail)

      expect(result.allowed).toBe(false)
    })

    it('tracks different emails separately', () => {
      const email1 = 'user1@example.com'
      const email2 = 'user2@example.com'

      // Use up limit for email1
      checkMagicLinkRateLimit(email1)
      checkMagicLinkRateLimit(email1)
      checkMagicLinkRateLimit(email1)

      // email2 should still be allowed
      const result = checkMagicLinkRateLimit(email2)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)

      // Clean up
      resetRateLimit(email1)
      resetRateLimit(email2)
    })
  })

  describe('resetRateLimit', () => {
    it('resets rate limit for email', () => {
      // Use up the limit
      checkMagicLinkRateLimit(testEmail)
      checkMagicLinkRateLimit(testEmail)
      checkMagicLinkRateLimit(testEmail)

      // Should be blocked
      expect(checkMagicLinkRateLimit(testEmail).allowed).toBe(false)

      // Reset
      resetRateLimit(testEmail)

      // Should be allowed again
      const result = checkMagicLinkRateLimit(testEmail)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })
  })

  describe('getRateLimitStatus', () => {
    it('returns null for unknown email', () => {
      const status = getRateLimitStatus('unknown@example.com')
      expect(status).toBeNull()
    })

    it('returns current status for tracked email', () => {
      checkMagicLinkRateLimit(testEmail)
      checkMagicLinkRateLimit(testEmail)

      const status = getRateLimitStatus(testEmail)

      expect(status).not.toBeNull()
      expect(status?.count).toBe(2)
      expect(status?.resetAt).toBeGreaterThan(Date.now())
    })
  })
})
