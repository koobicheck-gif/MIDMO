import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, validateBody, handleApiError, successResponse } from '@/lib/api-helpers'
import { CreateInvoiceSchema } from '@/lib/validations/invoice.schema'

async function generateInvoiceNumber(): Promise<string> {
  const latest = await prisma.invoice.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true },
  })
  if (!latest) return 'INV-2245'
  const num = parseInt(latest.invoiceNumber.replace('INV-', '')) + 1
  return `INV-${num}`
}

export async function GET(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(customerId && { customerId }),
      },
      include: {
        customer: true,
        payments: true,
        job: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(invoices)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { data, error: validationError } = validateBody(CreateInvoiceSchema, body)
    if (validationError) return validationError

    const baseRate = data.baseRate
    const extraDaysTotal = (data.extraDays ?? 0) * (data.dayRate ?? 45)
    const lateFee = data.lateFee ?? 0
    const fuelSurcharge = data.fuelSurcharge ?? 0
    const subtotal = baseRate + extraDaysTotal + lateFee + fuelSurcharge
    const total = subtotal * (1 + (data.taxRate ?? 0))

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: await generateInvoiceNumber(),
        customerId: data.customerId,
        jobId: data.jobId,
        baseRate,
        extraDays: data.extraDays ?? 0,
        dayRate: data.dayRate ?? 45,
        lateFee,
        fuelSurcharge,
        taxRate: data.taxRate ?? 0,
        total,
        dueDate: new Date(data.dueDate),
        notes: data.notes,
        lineItems: data.lineItems as any,
      },
      include: { customer: true, job: true },
    })

    return successResponse(invoice, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
