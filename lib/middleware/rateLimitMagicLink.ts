/**
 * Rate limiting for Magic Link requests
 * Limits: 3 requests per 5 minutes per email address
 *
 * Uses in-memory store for MVP (suitable for single-instance deployment)
 * TODO: Replace with Redis for production multi-instance deployment
 */

interface RateLimitRecord {
  count: number
  resetAt: number
}

// In-memory store - resets on server restart
const rateLimitStore = new Map<string, RateLimitRecord>()

const LIMIT = 3
const WINDOW_MS = 5 * 60 * 1000 // 5 minutes in milliseconds

export interface RateLimitResult {
  allowed: boolean
  retryAfter?: number // seconds until rate limit resets
  remaining?: number // requests remaining in window
}

/**
 * Check if a Magic Link request is allowed for the given email
 * @param email - Email address to check
 * @returns RateLimitResult indicating if request is allowed
 */
export function checkMagicLinkRateLimit(email: string): RateLimitResult {
  const now = Date.now()
  const key = email.toLowerCase().trim()
  const record = rateLimitStore.get(key)

  // No existing record or window expired - allow and create new record
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: LIMIT - 1 }
  }

  // Within window but under limit - allow and increment
  if (record.count < LIMIT) {
    record.count++
    return { allowed: true, remaining: LIMIT - record.count }
  }

  // Rate limited
  const retryAfter = Math.ceil((record.resetAt - now) / 1000)
  return { allowed: false, retryAfter, remaining: 0 }
}

/**
 * Reset rate limit for an email (useful for testing)
 * @param email - Email address to reset
 */
export function resetRateLimit(email: string): void {
  const key = email.toLowerCase().trim()
  rateLimitStore.delete(key)
}

/**
 * Get current rate limit status for an email (useful for debugging)
 * @param email - Email address to check
 * @returns Current rate limit status or null if no record exists
 */
export function getRateLimitStatus(email: string): RateLimitRecord | null {
  const key = email.toLowerCase().trim()
  return rateLimitStore.get(key) || null
}

/**
 * Clean up expired rate limit records (optional memory optimization)
 * Call periodically in production if memory is a concern
 */
export function cleanupExpiredRecords(): number {
  const now = Date.now()
  let cleaned = 0

  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key)
      cleaned++
    }
  }

  return cleaned
}
