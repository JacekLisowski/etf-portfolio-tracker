# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Database model: Instrument (ETF at ISIN level) with source hierarchy tracking
- Database model: Listing (renamed from Etf) with status and source_system tracking
- Enums: NameSource (ESMA_FIRDS, FCA_FIRDS, SIX, FALLBACK)
- Enums: ListingStatus (ACTIVE, TERMINATED, CANCELLED, SUSPENDED)
- Field tracking: firstSeenAt, lastSeenAt for Instrument and Listing
- Name conflict detection: nameConflict flag for manual review
- Twelve Data API integration scripts for ETF data

### Changed
- Etf model restructured to Listing model (still named Etf for backward compatibility)
- ISIN now links to Instrument table (one canonical name per ISIN)
- Currency field renamed to tradingCurrency in Listing
- Added instrument relation to Etf/Listing model

### Technical Debt
- Need to implement ESMA FIRDS integration (priority source)
- Need to implement FCA FIRDS integration (UK data)
- Need to implement SIX Reference Data integration (Switzerland)
- Need to migrate existing ETF data to new Instrument + Listing structure

## [0.1.0] - 2026-02-01

### Added
- NextAuth.js magic link authentication
- Database models: Exchange, Etf, Portfolio, Transaction
- 9 pre-configured exchanges (XETR, XLON, XAMS, XPAR, XMIL, XSWX, XNYS, XNAS, XWAR)
- API endpoints:
  - GET /api/exchanges - list all exchanges
  - GET /api/etfs - search ETFs
  - POST /api/transactions - create transaction
  - GET /api/transactions - list user transactions
  - GET/PUT/DELETE /api/transactions/:id - manage transactions
  - GET /api/portfolio - get portfolio summary
- Services: exchange, etf, portfolio, transaction
- Validation with Polish error messages
- TypeScript types for portfolio API
- withAuth middleware for protected routes
- Test scripts for API verification

### Changed
- SQLite compatibility: removed case-insensitive search mode

### Fixed
- Prisma SQLite compatibility issue with mode:'insensitive'

## [0.0.1] - 2026-01-28

### Added
- Initial project setup with Next.js 16.x
- Chakra UI v2 with dark mode support
- Prisma 7.x ORM configuration
- Vitest testing framework
- ESLint + Prettier configuration
- Project structure and documentation
