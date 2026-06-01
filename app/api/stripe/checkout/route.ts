import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleApiError, successResponse } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const { invoiceId } = await request.json()

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
      include: { customer: true },
    })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.total * 100),
      currency: 'usd',
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
      },
      description: `Invoice ${invoice.invoiceNumber} - ${invoice.customer.name}`,
    })

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { stripeId: paymentIntent.id },
    })

    return successResponse({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
