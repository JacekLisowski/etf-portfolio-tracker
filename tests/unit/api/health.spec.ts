import { describe, it, expect, vi } from 'vitest'

// Mock NextApiRequest and NextApiResponse
const createMockRequest = (method: string = 'GET') => ({
  method,
})

const createMockResponse = () => {
  const res: Record<string, unknown> = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.end = vi.fn().mockReturnValue(res)
  res.setHeader = vi.fn().mockReturnValue(res)
  return res
}

describe('/api/health', () => {
  it('returns status ok with GET request', async () => {
    // Dynamic import to avoid module issues
    const { default: handler } = await import('@/pages/api/health')

    const req = createMockRequest('GET')
    const res = createMockResponse()

    handler(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        version: '0.1.0',
      })
    )
  })

  it('returns 405 for non-GET requests', async () => {
    const { default: handler } = await import('@/pages/api/health')

    const req = createMockRequest('POST')
    const res = createMockResponse()

    handler(req as never, res as never)

    expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET'])
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Method not allowed',
    })
  })

  it('includes timestamp in response', async () => {
    const { default: handler } = await import('@/pages/api/health')

    const req = createMockRequest('GET')
    const res = createMockResponse()

    const beforeCall = Date.now()
    handler(req as never, res as never)
    const afterCall = Date.now()

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(Number),
      })
    )

    // Extract the timestamp from the call
    const calledWith = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(calledWith.timestamp).toBeGreaterThanOrEqual(beforeCall)
    expect(calledWith.timestamp).toBeLessThanOrEqual(afterCall)
  })
})
