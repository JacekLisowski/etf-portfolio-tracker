import type { NextApiRequest, NextApiResponse } from 'next'

type HealthResponse =
  | {
      status: 'ok'
      timestamp: number
      version: string
    }
  | {
      status: 'error'
      message: string
    }

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    })
  }

  res.status(200).json({
    status: 'ok',
    timestamp: Date.now(),
    version: '0.1.0',
  })
}
