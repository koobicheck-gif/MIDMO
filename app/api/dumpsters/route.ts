import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole, validateBody, validateEnum, handleApiError, successResponse } from '@/lib/api-helpers'
import { z } from 'zod'

const DUMPSTER_STATUSES = ['IN_YARD', 'ACTIVE', 'PICKUP_DUE', 'OVERDUE', 'SCHEDULED', 'MAINTENANCE'] as const

const CreateDumpsterSchema = z.object({
  unitId: z.string().min(1).max(20),
  sizeYd: z.number().int().min(1).max(100),
  status: z.enum(DUMPSTER_STATUSES).optional().default('IN_YARD'),
  notes: z.string().max(500).optional(),
})

export async function GET(request: NextRequest) {
  const { error } = await requireAuth(request)
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const status = validateEnum(searchParams.get('status'), DUMPSTER_STATUSES)

    const dumpsters = await prisma.dumpster.findMany({
      where: { ...(status && { status }) },
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
  const { error } = await requireRole(['OWNER', 'OFFICE'], request)
  if (error) return error

  try {
    const body = await request.json()
    const { data, error: ve } = validateBody(CreateDumpsterSchema, body)
    if (ve) return ve

    const dumpster = await prisma.dumpster.create({ data })
    return successResponse(dumpster, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
