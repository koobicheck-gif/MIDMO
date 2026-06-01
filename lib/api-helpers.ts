import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { ZodSchema } from 'zod'
import { Prisma } from '@prisma/client'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session, error: null }
}

export async function requireRole(allowedRoles: string[]) {
  const { session, error } = await requireAuth()
  if (error || !session) return { session: null, error: error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const role = (session.user as any).role
  if (!allowedRoles.includes(role)) {
    return { session: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { session, error: null }
}

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): { data: T; error: null } | { data: null; error: NextResponse } {
  const result = schema.safeParse(body)
  if (!result.success) {
    return {
      data: null,
      error: NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 }),
    }
  }
  return { data: result.data, error: null }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate entry' }, { status: 409 })
    }
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}
