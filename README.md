# ETF Portfolio Tracker

Aplikacja webowa dla polskich inwestorów w ETF - śledzenie portfela i automatyczne rozliczanie PIT-38.

## Tech Stack

- **Framework:** Next.js 16.x (Pages Router)
- **UI:** Chakra UI v2 + Dark Mode
- **Database:** SQLite (dev) / PostgreSQL (production via Vercel)
- **ORM:** Prisma 7.x
- **Auth:** NextAuth.js (Magic Link)
- **State:** TanStack Query v5
- **Testing:** Vitest + Testing Library + fast-check
- **Language:** TypeScript 5.x (strict mode)

## Getting Started

### Prerequisites

- Node.js 20 LTS
- npm or yarn

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
5. Run development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## Project Structure

See [`docs/architecture.md`](../docs/architecture.md) for detailed architecture documentation.

```
/components   - React components (ui, forms, charts, tables, fifo, layout, admin)
/lib          - Business logic and utilities (fifo, nbp, auth, middleware)
/pages        - Next.js pages and API routes
/hooks        - Custom React hooks
/types        - TypeScript type definitions
/theme        - Chakra UI theme configuration
/config       - App configuration and constants
/tests        - Unit, integration, and e2e tests
/prisma       - Database schema and migrations
/docs         - Documentation (ADRs, API specs)
```

## Documentation

- Product Brief: `../_bmad-output/planning-artifacts/product-brief-Bmad-2026-01-28.md`
- PRD: `../_bmad-output/planning-artifacts/prd.md`
- Architecture: `../_bmad-output/planning-artifacts/architecture.md`

## Current Status

**Phase:** MVP Implementation (Story 0.1-0.2 Complete)

- [x] Next.js 16.x with Pages Router
- [x] Chakra UI v2 with dark mode
- [x] Prisma 7.x ORM configured
- [x] Vitest testing framework
- [x] ESLint + Prettier
- [x] Project structure created
- [ ] NextAuth.js + Magic Link
- [ ] TanStack Query setup
- [ ] Database models (User, Position, Transaction)
- [ ] FIFO engine
- [ ] API endpoints
- [ ] UI components

## License

Private project
