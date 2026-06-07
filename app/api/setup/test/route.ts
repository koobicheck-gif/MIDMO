import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-helpers'
import { z } from 'zod'

const Schema = z.object({
  service: z.enum(['stripe', 'twilio', 'resend', 'cloudinary', 'database']),
})

export async function POST(request: NextRequest) {
  const { error } = await requireRole(['OWNER'], request)
  if (error) return error

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid service' }, { status: 400 })
  }

  const { service } = parsed.data

  try {
    switch (service) {
      case 'stripe': {
        const { stripe } = await import('@/lib/stripe')
        // List a single customer — lightweight read that verifies the key
        await stripe.customers.list({ limit: 1 })
        return NextResponse.json({ ok: true, message: 'Stripe connection successful' })
      }

      case 'twilio': {
        const twilio = (await import('twilio')).default
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        )
        const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch()
        return NextResponse.json({ ok: true, message: `Twilio connected — account: ${account.friendlyName}` })
      }

      case 'resend': {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        // List domains as a lightweight verification call
        const { data, error: resendError } = await resend.domains.list()
        if (resendError) throw new Error(resendError.message)
        return NextResponse.json({ ok: true, message: `Resend connected — ${data?.data?.length ?? 0} domain(s) found` })
      }

      case 'cloudinary': {
        const { v2: cloudinary } = await import('cloudinary')
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        })
        const result = await cloudinary.api.ping()
        return NextResponse.json({ ok: true, message: `Cloudinary connected — ${result.status}` })
      }

      case 'database': {
        const { prisma } = await import('@/lib/prisma')
        const counts = await prisma.$transaction([
          prisma.user.count(),
          prisma.customer.count(),
          prisma.dumpster.count(),
        ])
        return NextResponse.json({
          ok: true,
          message: `Database connected — ${counts[0]} users, ${counts[1]} customers, ${counts[2]} dumpsters`,
        })
      }
    }
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message ?? 'Connection failed' },
      { status: 200 } // 200 so the client can handle the error gracefully
    )
  }
}
