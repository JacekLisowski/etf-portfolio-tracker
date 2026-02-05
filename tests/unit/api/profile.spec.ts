import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/pages/api/auth/[...nextauth]', () => ({
  authOptions: {},
}))

const createMockRequest = (method: string, body?: Record<string, unknown>) => ({
  method,
  body,
})

const createMockResponse = () => {
  const res: Record<string, unknown> = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.end = vi.fn().mockReturnValue(res)
  res.setHeader = vi.fn().mockReturnValue(res)
  return res
}

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  language: 'PL' as const,
  tier: 'FREE' as const,
}

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    role: 'USER',
    tier: 'FREE',
    language: 'PL',
  },
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
}

describe('/api/user/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/user/profile', () => {
    it('returns 401 when user is not authenticated', async () => {
      (getServerSession as Mock).mockResolvedValue(null)

      const { default: handler } = await import('@/pages/api/user/profile')

      const req = createMockRequest('GET')
      const res = createMockResponse()

      await handler(req as never, res as never)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' }
      })
    })

    it('returns user profile when authenticated', async () => {
      (getServerSession as Mock).mockResolvedValue(mockSession)
      ;(prisma.user.findUnique as Mock).mockResolvedValue(mockUser)

      const { default: handler } = await import('@/pages/api/user/profile')

      const req = createMockRequest('GET')
      const res = createMockResponse()

      await handler(req as never, res as never)

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          email: true,
          name: true,
          language: true,
          tier: true,
        },
      })
      expect(res.json).toHaveBeenCalledWith(mockUser)
    })

    it('returns 404 when user not found in database', async () => {
      (getServerSession as Mock).mockResolvedValue(mockSession)
      ;(prisma.user.findUnique as Mock).mockResolvedValue(null)

      const { default: handler } = await import('@/pages/api/user/profile')

      const req = createMockRequest('GET')
      const res = createMockResponse()

      await handler(req as never, res as never)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: { code: 'NOT_FOUND', message: 'Użytkownik nie znaleziony' }
      })
    })
  })

  describe('PUT /api/user/profile', () => {
    it('updates user name successfully', async () => {
      (getServerSession as Mock).mockResolvedValue(mockSession)
      const updatedUser = { ...mockUser, name: 'New Name' }
      ;(prisma.user.update as Mock).mockResolvedValue(updatedUser)

      const { default: handler } = await import('@/pages/api/user/profile')

      const req = createMockRequest('PUT', { name: 'New Name' })
      const res = createMockResponse()

      await handler(req as never, res as never)

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { name: 'New Name' },
        select: {
          id: true,
          email: true,
          name: true,
          language: true,
          tier: true,
        },
      })
      expect(res.json).toHaveBeenCalledWith(updatedUser)
    })

    it('updates user language successfully', async () => {
      (getServerSession as Mock).mockResolvedValue(mockSession)
      const updatedUser = { ...mockUser, language: 'EN' as const }
      ;(prisma.user.update as Mock).mockResolvedValue(updatedUser)

      const { default: handler } = await import('@/pages/api/user/profile')

      const req = createMockRequest('PUT', { language: 'EN' })
      const res = createMockResponse()

      await handler(req as never, res as never)

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { language: 'EN' },
        select: {
          id: true,
          email: true,
          name: true,
          language: true,
          tier: true,
        },
      })
      expect(res.json).toHaveBeenCalledWith(updatedUser)
    })

    it('updates both name and language', async () => {
      (getServerSession as Mock).mockResolvedValue(mockSession)
      const updatedUser = { ...mockUser, name: 'New Name', language: 'EN' as const }
      ;(prisma.user.update as Mock).mockResolvedValue(updatedUser)

      const { default: handler } = await import('@/pages/api/user/profile')

      const req = createMockRequest('PUT', { name: 'New Name', language: 'EN' })
      const res = createMockResponse()

      await handler(req as never, res as never)

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { name: 'New Name', language: 'EN' },
        select: {
          id: true,
          email: true,
          name: true,
          language: true,
          tier: true,
        },
      })
      expect(res.json).toHaveBeenCalledWith(updatedUser)
    })

    it('returns 401 when not authenticated', async () => {
      (getServerSession as Mock).mockResolvedValue(null)

      const { default: handler } = await import('@/pages/api/user/profile')

      const req = createMockRequest('PUT', { name: 'New Name' })
      const res = createMockResponse()

      await handler(req as never, res as never)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' }
      })
    })

    it('returns 400 for invalid language value', async () => {
      (getServerSession as Mock).mockResolvedValue(mockSession)

      const { default: handler } = await import('@/pages/api/user/profile')

      const req = createMockRequest('PUT', { language: 'INVALID' })
      const res = createMockResponse()

      await handler(req as never, res as never)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Nieprawidłowe dane wejściowe',
          })
        })
      )
      expect(prisma.user.update).not.toHaveBeenCalled()
    })
  })

  describe('Unsupported methods', () => {
    it('returns 405 for POST method', async () => {
      (getServerSession as Mock).mockResolvedValue(mockSession)

      const { default: handler } = await import('@/pages/api/user/profile')

      const req = createMockRequest('POST')
      const res = createMockResponse()

      await handler(req as never, res as never)

      expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'PUT'])
      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Metoda niedozwolona' }
      })
    })

    it('returns 405 for DELETE method', async () => {
      (getServerSession as Mock).mockResolvedValue(mockSession)

      const { default: handler } = await import('@/pages/api/user/profile')

      const req = createMockRequest('DELETE')
      const res = createMockResponse()

      await handler(req as never, res as never)

      expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'PUT'])
      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Metoda niedozwolona' }
      })
    })
  })
})
