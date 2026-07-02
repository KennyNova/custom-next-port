import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

const RATE_LIMIT_REQUESTS = 10
const RATE_LIMIT_WINDOW = '10 m'

let ratelimit: Ratelimit | null = null

function isRateLimitConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

function getRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW),
      prefix: 'tabreeze-feedback',
    })
  }

  return ratelimit
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}

export async function checkRateLimit(
  request: NextRequest
): Promise<{ success: boolean; limit: number; remaining: number; configured: boolean }> {
  const configured = isRateLimitConfigured()
  const limiter = getRatelimit()

  if (!limiter) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Upstash Redis not configured in production; rejecting request')
      return { success: false, limit: RATE_LIMIT_REQUESTS, remaining: 0, configured: false }
    }

    console.warn('Upstash Redis not configured; rate limiting disabled in development')
    return {
      success: true,
      limit: RATE_LIMIT_REQUESTS,
      remaining: RATE_LIMIT_REQUESTS,
      configured: false,
    }
  }

  const ip = getClientIp(request)
  const result = await limiter.limit(ip)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    configured,
  }
}
