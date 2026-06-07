import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole, validateBody, validateEnum, handleApiError, successResponse } from '@/lib/api-helpers'
import { CreateJobSchema } from '@/lib/validations/job.schema'

const JOB_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth(request)
  if (error || !session) return error!

  try {
    const { searchParams } = new URL(request.url)
    const status = validateEnum(searchParams.get('status'), JOB_STATUSES)
    const role = (session.user as any).role as string
    const userId = (session.user as any).id as string
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

    const jobs = await prisma.job.findMany({
      where: {
        ...(status && { status }),
        // Drivers only see their own assigned jobs
        ...(role === 'DRIVER' && { driverId: userId }),
        ...(from && to && {
          scheduledAt: { gte: new Date(from), lte: new Date(to) },
        }),
      },
      include: {
        customer: true,
        dumpster: true,
        driver: { select: { id: true, name: true, email: true } },
        invoice: true,
      },
      orderBy: { scheduledAt: 'desc' },
      take: limit,
    })

    return successResponse(jobs)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  // Drivers cannot create jobs — only OWNER/OFFICE dispatch
  const { error } = await requireRole(['OWNER', 'OFFICE'], request)
  if (error) return error

  try {
    const body = await request.json()
    const { data, error: validationError } = validateBody(CreateJobSchema, body)
    if (validationError) return validationError

    const job = await prisma.job.create({
      data: {
        type: data.type,
        status: data.status ?? 'SCHEDULED',
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        daysOnSite: data.daysOnSite ?? 0,
        rentalDays: data.rentalDays ?? 7,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
        gateCode: data.gateCode,
        customerId: data.customerId,
        dumpsterId: data.dumpsterId,
        driverId: data.driverId,
      },
      include: {
        customer: true,
        dumpster: true,
        driver: { select: { id: true, name: true, email: true } },
      },
    })

    // Update dumpster status if provided
    if (data.dumpsterId && data.type === 'DELIVERY') {
      await prisma.dumpster.update({
        where: { id: data.dumpsterId },
        data: { status: 'SCHEDULED', lat: data.lat, lng: data.lng },
      })
    }

    return successResponse(job, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
