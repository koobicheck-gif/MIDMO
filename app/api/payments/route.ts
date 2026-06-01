import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, validateBody, handleApiError, successResponse } from '@/lib/api-helpers'
import { CreatePaymentSchema } from '@/lib/validations/payment.schema'

export async function GET(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const method = searchParams.get('method')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const payments = await prisma.payment.findMany({
      where: {
        ...(method && { method: method as any }),
        ...(from && to && {
          paidAt: { gte: new Date(from), lte: new Date(to) },
        }),
      },
      include: {
        invoice: { select: { invoiceNumber: true } },
        customer: { select: { name: true } },
      },
      orderBy: { paidAt: 'desc' },
    })

    return successResponse(payments)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { data, error: validationError } = validateBody(CreatePaymentSchema, body)
    if (validationError) return validationError

    const payment = await prisma.payment.create({
      data: {
        invoiceId: data.invoiceId,
        customerId: data.customerId,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        receivedBy: data.receivedBy,
        notes: data.notes,
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
      },
    })

    // Check if invoice is fully paid
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { payments: true },
    })
    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + data.amount
      if (totalPaid >= invoice.total) {
        await prisma.invoice.update({
          where: { id: data.invoiceId },
          data: { status: 'PAID', paidAt: new Date(), paymentMethod: data.method },
        })
      } else if (totalPaid > 0) {
        await prisma.invoice.update({
          where: { id: data.invoiceId },
          data: { status: 'PARTIAL' },
        })
      }
    }

    return successResponse(payment, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
