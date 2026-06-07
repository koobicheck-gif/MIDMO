export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, validateBody, handleApiError, successResponse } from '@/lib/api-helpers'
import { UpdateJobSchema } from '@/lib/validations/job.schema'
import { z } from 'zod'

// Drivers may only update status/completedAt on their own assigned jobs
const DriverUpdateSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED']),
  completedAt: z.string().datetime().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const job = await prisma.job.findUniqueOrThrow({
      where: { id: params.id },
      include: {
        customer: true,
        dumpster: true,
        driver: { select: { id: true, name: true, email: true } },
        invoice: { include: { payments: true } },
      },
    })
    return successResponse(job)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth(request)
  if (error || !session) return error!

  const role = (session.user as any).role as string
  const userId = (session.user as any).id as string

  try {
    const body = await request.json()

    if (role === 'DRIVER') {
      // Drivers: validate restricted schema, then verify they own the job
      const { data, error: ve } = validateBody(DriverUpdateSchema, body)
      if (ve) return ve

      const job = await prisma.job.findUnique({
        where: { id: params.id },
        select: { driverId: true },
      })
      if (!job) return successResponse({ error: 'Not found' }, 404)
      if (job.driverId !== userId) {
        return successResponse({ error: 'Forbidden' }, 403)
      }

      const updated = await prisma.job.update({
        where: { id: params.id },
        data: {
          status: data.status,
          completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        },
        include: {
          customer: true,
          dumpster: true,
          driver: { select: { id: true, name: true, email: true } },
        },
      })

      if (data.status === 'COMPLETED' && updated.dumpsterId) {
        await prisma.dumpster.update({
          where: { id: updated.dumpsterId },
          data: { status: updated.type === 'PICKUP' ? 'IN_YARD' : 'ACTIVE' },
        })
      }

      return successResponse(updated)
    }

    // OWNER / OFFICE: full update
    const { data, error: ve } = validateBody(UpdateJobSchema, body)
    if (ve) return ve

    const job = await prisma.job.update({
      where: { id: params.id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      },
      include: {
        customer: true,
        dumpster: true,
        driver: { select: { id: true, name: true, email: true } },
      },
    })

    if (data.status === 'COMPLETED' && job.dumpsterId) {
      await prisma.dumpster.update({
        where: { id: job.dumpsterId },
        data: { status: job.type === 'PICKUP' ? 'IN_YARD' : 'ACTIVE' },
      })
    }

    return successResponse(job)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireRole(['OWNER', 'OFFICE'])
  if (error) return error

  try {
    await prisma.job.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    })
    return successResponse({ message: 'Job cancelled' })
  } catch (error) {
    return handleApiError(error)
  }
}
