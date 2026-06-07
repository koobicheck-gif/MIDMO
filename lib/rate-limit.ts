import { NextResponse } from 'next/server'

interface Entry {
  count: number
  resetAt: number
}

// In-memory store — resets on cold start; good enough for serverless rate limiting
// For multi-instance production use, swap for Redis/Upstash
const store = new Map<string, Entry>()

function cleanup() {
  const now = Date.now()
  store.forEach((entry, key) => {
    if (entry.resetAt < now) store.delete(key)
  })
}

export function checkRateLimit(
  key: string,
  windowMs: number,
  max: number
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs }
  }

  entry.count++
  return {
    allowed: entry.count <= max,
    remaining: Math.max(0, max - entry.count),
    resetAt: entry.resetAt,
  }
}

export function rateLimitHeaders(remaining: number, resetAt: number): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': new Date(resetAt).toISOString(),
  }
}

export function tooManyRequestsResponse(resetAt: number): NextResponse {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
        'X-RateLimit-Remaining': '0',
      },
    }
  )
}

// Pre-configured limiters
export const LOGIN_LIMIT = { windowMs: 15 * 60 * 1000, max: 10 } // 10 attempts per 15 min per IP
export const API_LIMIT = { windowMs: 60 * 1000, max: 120 }       // 120 req/min per user
export const STRIPE_LIMIT = { windowMs: 60 * 1000, max: 20 }     // 20 Stripe intents/min per user
