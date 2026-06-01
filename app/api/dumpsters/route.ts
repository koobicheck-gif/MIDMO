import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleApiError, successResponse } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const dumpsters = await prisma.dumpster.findMany({
      where: {
        ...(status && { status: status as any }),
      },
      include: {
        jobs: {
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          include: { customer: true, driver: { select: { id: true, name: true } } },
          orderBy: { scheduledAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { unitId: 'asc' },
    })

    return successResponse(dumpsters)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const dumpster = await prisma.dumpster.create({
      data: {
        unitId: body.unitId,
        sizeYd: parseInt(body.sizeYd),
        status: body.status ?? 'IN_YARD',
        notes: body.notes,
      },
    })
    return successResponse(dumpster, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
