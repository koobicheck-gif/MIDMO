import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleApiError, successResponse } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
    const startOfDay = new Date(date + 'T00:00:00.000Z')
    const endOfDay = new Date(date + 'T23:59:59.999Z')

    const [drivers, jobs, routes] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: ['DRIVER', 'OWNER'] } },
        select: { id: true, name: true, email: true, role: true },
      }),
      prisma.job.findMany({
        where: {
          scheduledAt: { gte: startOfDay, lte: endOfDay },
          status: { notIn: ['CANCELLED'] },
        },
        include: {
          customer: true,
          dumpster: true,
          driver: { select: { id: true, name: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      prisma.dispatchRoute.findMany({
        where: { date: { gte: startOfDay, lte: endOfDay } },
        include: { driver: { select: { id: true, name: true } } },
      }),
    ])

    return successResponse({ drivers, jobs, routes })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { driverId, date, orderedJobIds, notes } = body

    const route = await prisma.dispatchRoute.upsert({
      where: {
        id: body.routeId ?? 'new',
      },
      create: {
        driverId,
        date: new Date(date),
        orderedJobIds: orderedJobIds ?? [],
        notes,
      },
      update: {
        orderedJobIds: orderedJobIds ?? [],
        notes,
      },
    })

    return successResponse(route, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
