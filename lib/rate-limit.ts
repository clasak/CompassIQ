/**
 * Rate limiting utilities using Upstash Redis
 * Protects API endpoints from abuse and DDoS attacks
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client (only if credentials are available)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

/**
 * Rate limiter for IP-based limiting
 * Limits: 10 requests per 10 seconds per IP
 * Use for: Public endpoints, authentication endpoints
 */
export const rateLimitByIP = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: 'ratelimit:ip',
    })
  : null

/**
 * Rate limiter for user-based limiting
 * Limits: 100 requests per 1 minute per user
 * Use for: Authenticated user endpoints
 */
export const rateLimitByUser = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:user',
    })
  : null

/**
 * Strict rate limiter for sensitive operations
 * Limits: 5 requests per 1 minute per IP
 * Use for: Data imports, bulk operations, webhook endpoints
 */
export const rateLimitStrict = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'ratelimit:strict',
    })
  : null

/**
 * In-memory fallback rate limiter when Redis is not available
 * Less effective but better than no rate limiting
 */
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly limit: number
  private readonly windowMs: number

  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.windowMs = windowMs

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000)
  }

  async check(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || []

    // Filter out requests outside the window
    const recentRequests = requests.filter((time) => time > windowStart)

    // Check if limit exceeded
    const success = recentRequests.length < this.limit

    if (success) {
      recentRequests.push(now)
      this.requests.set(identifier, recentRequests)
    }

    return {
      success,
      limit: this.limit,
      remaining: Math.max(0, this.limit - recentRequests.length),
      reset: now + this.windowMs,
    }
  }

  private cleanup() {
    const now = Date.now()
    Array.from(this.requests.entries()).forEach(([identifier, requests]) => {
      const recentRequests = requests.filter((time) => time > now - this.windowMs)
      if (recentRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, recentRequests)
      }
    })
  }
}

// Fallback rate limiters (in-memory)
const fallbackIP = new InMemoryRateLimiter(10, 10000) // 10 requests per 10 seconds
const fallbackUser = new InMemoryRateLimiter(100, 60000) // 100 requests per minute
const fallbackStrict = new InMemoryRateLimiter(5, 60000) // 5 requests per minute

/**
 * Check rate limit by IP address
 * Automatically falls back to in-memory limiting if Redis is not configured
 */
export async function checkRateLimitByIP(
  request: Request
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous'

  if (rateLimitByIP) {
    return await rateLimitByIP.limit(ip)
  }

  // Fallback to in-memory
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Using in-memory rate limiting (Redis not configured)')
  }
  return await fallbackIP.check(ip)
}

/**
 * Check rate limit by user ID
 * Automatically falls back to in-memory limiting if Redis is not configured
 */
export async function checkRateLimitByUser(
  userId: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (rateLimitByUser) {
    return await rateLimitByUser.limit(userId)
  }

  // Fallback to in-memory
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Using in-memory rate limiting (Redis not configured)')
  }
  return await fallbackUser.check(userId)
}

/**
 * Check strict rate limit (for sensitive operations)
 * Automatically falls back to in-memory limiting if Redis is not configured
 */
export async function checkRateLimitStrict(
  request: Request
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous'

  if (rateLimitStrict) {
    return await rateLimitStrict.limit(ip)
  }

  // Fallback to in-memory
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Using in-memory rate limiting (Redis not configured)')
  }
  return await fallbackStrict.check(ip)
}
