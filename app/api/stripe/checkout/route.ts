import { NextRequest } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { requireRole, validateBody, handleApiError, successResponse } from '@/lib/api-helpers'
import { checkRateLimit, tooManyRequestsResponse, STRIPE_LIMIT } from '@/lib/rate-limit'

const CheckoutSchema = z.object({
  invoiceId: z.string().cuid(),
})

export async function POST(request: NextRequest) {
  // Only OWNER/OFFICE can create payment intents
  const { session, error } = await requireRole(['OWNER', 'OFFICE'], request)
  if (error || !session) return error!

  // Tighter rate limit for Stripe API calls — prevent runaway charges
  const userId = (session.user as any).id as string
  const { allowed, resetAt } = checkRateLimit(`stripe:${userId}`, STRIPE_LIMIT.windowMs, STRIPE_LIMIT.max)
  if (!allowed) return tooManyRequestsResponse(resetAt)

  try {
    const body = await request.json()
    const { data, error: ve } = validateBody(CheckoutSchema, body)
    if (ve) return ve

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: data.invoiceId },
      include: { customer: true },
    })

    if (!['PENDING', 'OVERDUE', 'PARTIAL'].includes(invoice.status)) {
      return successResponse({ error: 'Invoice is not payable' }, 422)
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.total * 100),
      currency: 'usd',
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
      },
      description: `Invoice ${invoice.invoiceNumber} — ${invoice.customer.name}`,
    })

    await prisma.invoice.update({
      where: { id: data.invoiceId },
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
