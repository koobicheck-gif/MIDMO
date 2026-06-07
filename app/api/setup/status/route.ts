import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/api-helpers'

export interface IntegrationStatus {
  configured: boolean
  live: boolean        // key format looks like production (sk_live_, pk_live_)
  error?: string
}

export interface SetupStatus {
  stripe: IntegrationStatus
  twilio: IntegrationStatus
  resend: IntegrationStatus
  cloudinary: IntegrationStatus
  database: IntegrationStatus
  allRequired: boolean
}

export async function GET(request: NextRequest) {
  const { error } = await requireRole(['OWNER'], request)
  if (error) return error

  const sk = process.env.STRIPE_SECRET_KEY ?? ''
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
  const wh = process.env.STRIPE_WEBHOOK_SECRET ?? ''

  const status: SetupStatus = {
    database: {
      configured: !!(process.env.DATABASE_URL),
      live: !!(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')),
    },
    stripe: {
      configured: sk.startsWith('sk_') && pk.startsWith('pk_') && wh.startsWith('whsec_'),
      live: sk.startsWith('sk_live_') && pk.startsWith('pk_live_'),
    },
    twilio: {
      configured: !!(
        process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
      ),
      live: !!(process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN),
    },
    resend: {
      configured: !!(process.env.RESEND_API_KEY?.startsWith('re_')),
      live: !!(process.env.RESEND_API_KEY?.startsWith('re_')),
    },
    cloudinary: {
      configured: !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ),
      live: !!(process.env.CLOUDINARY_CLOUD_NAME),
    },
  }

  status.allRequired = status.database.configured && status.stripe.configured

  return NextResponse.json(status)
}
