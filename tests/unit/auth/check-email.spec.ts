import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

// Helper to create mock request/response
function createMockRequest(method: string, body?: object) {
  return {
    method,
    body: body || {},
  }
}

function createMockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
  }
  return res
}

describe('/api/auth/check-email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 405 for non-POST requests', async () => {
    const { default: handler } = await import('@/pages/api/auth/check-email')

    const req = createMockRequest('GET')
    const res = createMockResponse()

    await handler(req as never, res as never)

    expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST'])
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed',
    })
  })

  it('returns 400 for missing email', async () => {
    const { default: handler } = await import('@/pages/api/auth/check-email')

    const req = createMockRequest('POST', {})
    const res = createMockResponse()

    await handler(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_EMAIL',
      message: 'Email jest wymagany',
    })
  })

  it('returns 400 for invalid email format', async () => {
    const { default: handler } = await import('@/pages/api/auth/check-email')

    const req = createMockRequest('POST', { email: 'invalid-email' })
    const res = createMockResponse()

    await handler(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'INVALID_EMAIL_FORMAT',
      message: 'Nieprawidłowy format email',
    })
  })

  // Note: Rate limiting is now handled in NextAuth's sendVerificationRequest, not here

  it('returns 409 when email already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123' } as never)

    const { default: handler } = await import('@/pages/api/auth/check-email')

    const req = createMockRequest('POST', { email: 'existing@example.com' })
    const res = createMockResponse()

    await handler(req as never, res as never)

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'existing@example.com' },
      select: { id: true },
    })
    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      error: 'EMAIL_EXISTS',
      message: 'Ten email jest już zarejestrowany',
    })
  })

  it('returns 200 with available:true for new email', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const { default: handler } = await import('@/pages/api/auth/check-email')

    const req = createMockRequest('POST', { email: 'new@example.com' })
    const res = createMockResponse()

    await handler(req as never, res as never)

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'new@example.com' },
      select: { id: true },
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ available: true })
  })

  it('normalizes email to lowercase when checking', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const { default: handler } = await import('@/pages/api/auth/check-email')

    const req = createMockRequest('POST', { email: 'TEST@EXAMPLE.COM' })
    const res = createMockResponse()

    await handler(req as never, res as never)

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      select: { id: true },
    })
  })
})
