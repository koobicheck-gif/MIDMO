import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any
      const invoiceId = paymentIntent.metadata?.invoiceId

      if (invoiceId) {
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: { customer: true },
        })

        if (invoice) {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: 'PAID',
              paidAt: new Date(),
              paymentMethod: 'STRIPE',
            },
          })

          await prisma.payment.create({
            data: {
              invoiceId,
              customerId: invoice.customerId,
              amount: paymentIntent.amount / 100,
              method: 'STRIPE',
              reference: paymentIntent.id,
              receivedBy: 'Stripe',
              paidAt: new Date(),
            },
          })
        }
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as any
      const invoiceId = paymentIntent.metadata?.invoiceId
      if (invoiceId) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: 'PENDING' },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
