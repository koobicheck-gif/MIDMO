import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, validateBody, handleApiError, successResponse } from '@/lib/api-helpers'
import { UpdateInvoiceSchema } from '@/lib/validations/invoice.schema'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: params.id },
      include: {
        customer: true,
        job: { include: { dumpster: true, driver: { select: { id: true, name: true } } } },
        payments: true,
      },
    })
    return successResponse(invoice)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { data, error: validationError } = validateBody(UpdateInvoiceSchema, body)
    if (validationError) return validationError

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        ...data,
        paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
      },
      include: { customer: true, payments: true },
    })
    return successResponse(invoice)
  } catch (error) {
    return handleApiError(error)
  }
}
