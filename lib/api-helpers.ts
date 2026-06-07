import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { ZodSchema } from 'zod'
import { Prisma } from '@prisma/client'
import { checkRateLimit, tooManyRequestsResponse, API_LIMIT } from './rate-limit'

export async function requireAuth(request?: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // Optional per-user API rate limit
  if (request) {
    const userId = (session.user as any).id ?? 'anon'
    const key = `api:${userId}:${new URL(request.url).pathname}`
    const { allowed, remaining, resetAt } = checkRateLimit(key, API_LIMIT.windowMs, API_LIMIT.max)
    if (!allowed) return { session: null, error: tooManyRequestsResponse(resetAt) }
  }

  return { session, error: null }
}

export async function requireRole(allowedRoles: string[], request?: NextRequest) {
  const { session, error } = await requireAuth(request)
  if (error || !session) {
    return {
      session: null,
      error: error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  const role = (session.user as any).role as string
  if (!allowedRoles.includes(role)) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }
  return { session, error: null }
}

export function validateBody<T>(
  schema: ZodSchema<T>,
  body: unknown
): { data: T; error: null } | { data: null; error: NextResponse } {
  const result = schema.safeParse(body)
  if (!result.success) {
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      ),
    }
  }
  return { data: result.data, error: null }
}

/** Validate a string query param against an explicit allowlist of enum values */
export function validateEnum<T extends string>(
  value: string | null,
  allowed: readonly T[]
): T | null {
  if (!value) return null
  if ((allowed as readonly string[]).includes(value)) return value as T
  return null
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate entry' }, { status: 409 })
    }
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Referenced record not found' }, { status: 422 })
    }
    // Log Prisma errors with code only — don't leak query details
    console.error(`[API] Prisma error ${error.code}`)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  // Log full error server-side only; never send stack traces to client
  console.error('[API Error]', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}
