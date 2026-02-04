import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock auth options
vi.mock('@/pages/api/auth/[...nextauth]', () => ({
  authOptions: {},
}))

import { getServerSession } from 'next-auth'
import { withAuthPage, requireAuth } from '@/lib/middleware/withAuthPage'
import type { GetServerSidePropsContext } from 'next'

// Helper to generate expiry date 7 days from now (matching NextAuth JWT session)
const getSessionExpiry = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

// Helper to create mock context with optional cookies
function createMockContext(
  overrides: Partial<GetServerSidePropsContext> = {},
  cookies: Record<string, string> = {}
): GetServerSidePropsContext {
  return {
    req: { cookies } as any,
    res: {} as any,
    query: {},
    params: {},
    resolvedUrl: '/dashboard',
    ...overrides,
  } as GetServerSidePropsContext
}

describe('withAuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to signin when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const handler = withAuthPage()
    const context = createMockContext({ resolvedUrl: '/dashboard' })

    const result = await handler(context)

    expect(result).toEqual({
      redirect: {
        destination: '/auth/signin?callbackUrl=%2Fdashboard',
        permanent: false,
      },
    })
  })

  it('preserves callback URL with query params', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const handler = withAuthPage()
    const context = createMockContext({ resolvedUrl: '/transactions?page=2&filter=buy' })

    const result = await handler(context)

    expect(result).toEqual({
      redirect: {
        destination: '/auth/signin?callbackUrl=%2Ftransactions%3Fpage%3D2%26filter%3Dbuy',
        permanent: false,
      },
    })
  })

  it('returns session props when authenticated', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        tier: 'FREE',
      },
      expires: getSessionExpiry(),
    }

    vi.mocked(getServerSession).mockResolvedValue(mockSession)

    const handler = withAuthPage()
    const context = createMockContext()

    const result = await handler(context)

    expect(result).toEqual({
      props: {
        session: mockSession,
      },
    })
  })

  it('calls custom handler when provided and authenticated', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
      expires: getSessionExpiry(),
    }

    vi.mocked(getServerSession).mockResolvedValue(mockSession)

    const customHandler = vi.fn().mockResolvedValue({
      props: {
        customData: 'test',
        session: mockSession,
      },
    })

    const handler = withAuthPage(customHandler)
    const context = createMockContext()

    const result = await handler(context)

    expect(customHandler).toHaveBeenCalledWith(context, mockSession)
    expect(result).toEqual({
      props: {
        customData: 'test',
        session: mockSession,
      },
    })
  })

  it('redirects with sessionExpired=true when session cookie exists but session is null', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const handler = withAuthPage()
    // Simulate expired session: cookie exists but session is null
    const context = createMockContext(
      { resolvedUrl: '/dashboard' },
      { 'next-auth.session-token': 'expired-token' }
    )

    const result = await handler(context)

    expect(result).toEqual({
      redirect: {
        destination: '/auth/signin?sessionExpired=true&callbackUrl=%2Fdashboard',
        permanent: false,
      },
    })
  })

  it('redirects with sessionExpired=true for secure cookie variant', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const handler = withAuthPage()
    // Simulate expired session with secure cookie variant
    const context = createMockContext(
      { resolvedUrl: '/' },
      { '__Secure-next-auth.session-token': 'expired-token' }
    )

    const result = await handler(context)

    expect(result).toEqual({
      redirect: {
        destination: '/auth/signin?sessionExpired=true&callbackUrl=%2F',
        permanent: false,
      },
    })
  })
})

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects unauthenticated users', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const context = createMockContext({ resolvedUrl: '/' })
    const result = await requireAuth(context)

    expect(result).toEqual({
      redirect: {
        destination: '/auth/signin?callbackUrl=%2F',
        permanent: false,
      },
    })
  })

  it('returns session for authenticated users', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      expires: getSessionExpiry(),
    }

    vi.mocked(getServerSession).mockResolvedValue(mockSession)

    const context = createMockContext()
    const result = await requireAuth(context)

    expect(result).toEqual({
      props: {
        session: mockSession,
      },
    })
  })
})
