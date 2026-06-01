import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, validateBody, handleApiError, successResponse } from '@/lib/api-helpers'
import { UpdateJobSchema } from '@/lib/validations/job.schema'

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
  const { error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { data, error: validationError } = validateBody(UpdateJobSchema, body)
    if (validationError) return validationError

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

    // Update dumpster status when job completed
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
  const { error } = await requireAuth()
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
