# Lib

Business logic and utility modules.

## Structure

- `fifo/` - FIFO calculation engine (ISOLATED, pure functions)
- `decimal/` - Decimal.js integration layer for Prisma
- `nbp/` - NBP API integration (client, cache, circuit breaker)
- `etf-prices/` - ETF price fetching (TwelveData, Stooq)
- `email/` - Email service (Resend, webhooks)
- `auth/` - Authentication utilities (session, RBAC)
- `middleware/` - API middleware (auth, rate limiting)
- `monitoring/` - Performance monitoring and alerts

## Critical Rules

- FIFO engine MUST be pure functions (no DB, API, or side effects)
- All money operations MUST use decimal.js (via decimal/ layer)
- All external APIs MUST have fallback strategies
