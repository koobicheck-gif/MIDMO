export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, validateBody, handleApiError, successResponse } from '@/lib/api-helpers'
import { UpdateCustomerSchema } from '@/lib/validations/customer.schema'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const customer = await prisma.customer.findUniqueOrThrow({
      where: { id: params.id },
      include: {
        jobs: {
          include: { dumpster: true, driver: { select: { id: true, name: true } } },
          orderBy: { scheduledAt: 'desc' },
        },
        invoices: {
          include: { payments: true },
          orderBy: { createdAt: 'desc' },
        },
        payments: { orderBy: { paidAt: 'desc' } },
        _count: { select: { jobs: true, invoices: true } },
      },
    })
    return successResponse(customer)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { data, error: validationError } = validateBody(UpdateCustomerSchema, body)
    if (validationError) return validationError

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data,
    })
    return successResponse(customer)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireRole(['OWNER'])
  if (error) return error

  try {
    await prisma.customer.delete({ where: { id: params.id } })
    return successResponse({ message: 'Customer deleted' })
  } catch (error) {
    return handleApiError(error)
  }
}

async function requireRole(roles: string[]) {
  const { requireRole: rr } = await import('@/lib/api-helpers')
  return rr(roles)
}
