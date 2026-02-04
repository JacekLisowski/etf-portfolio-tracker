import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))

import { useSession } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'

// Helper to generate expiry date 7 days from now (matching NextAuth JWT session)
const getSessionExpiry = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading state when session is loading', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn(),
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeUndefined()
  })

  it('returns unauthenticated state when no session', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeUndefined()
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isPremium).toBe(false)
  })

  it('returns authenticated state with user data', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'USER',
      tier: 'FREE',
    }

    vi.mocked(useSession).mockReturnValue({
      data: {
        user: mockUser,
        expires: getSessionExpiry(),
      },
      status: 'authenticated',
      update: vi.fn(),
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isPremium).toBe(false)
  })

  it('correctly identifies admin user', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'ADMIN',
          tier: 'FREE',
        },
        expires: getSessionExpiry(),
      },
      status: 'authenticated',
      update: vi.fn(),
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isPremium).toBe(false)
  })

  it('correctly identifies premium user', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'premium-123',
          email: 'premium@example.com',
          role: 'USER',
          tier: 'PREMIUM',
        },
        expires: getSessionExpiry(),
      },
      status: 'authenticated',
      update: vi.fn(),
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isPremium).toBe(true)
  })

  it('correctly identifies premium admin user', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'super-123',
          email: 'super@example.com',
          role: 'ADMIN',
          tier: 'PREMIUM',
        },
        expires: getSessionExpiry(),
      },
      status: 'authenticated',
      update: vi.fn(),
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isPremium).toBe(true)
  })
})
