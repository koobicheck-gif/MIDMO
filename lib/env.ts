import { z } from 'zod'

// Skip validation during static export build — env vars are placeholders
if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
  // Static build: no validation needed
} else if (typeof window === 'undefined') {
  // Server-side only: validate on startup
  const schema = z.object({
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
    NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
    STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'must start with pk_'),
    TWILIO_ACCOUNT_SID: z.string().startsWith('AC', 'TWILIO_ACCOUNT_SID must start with AC'),
    TWILIO_AUTH_TOKEN: z.string().min(1, 'TWILIO_AUTH_TOKEN is required'),
    TWILIO_PHONE_NUMBER: z.string().min(10, 'TWILIO_PHONE_NUMBER is required'),
    RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with re_'),
    CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
    CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
    CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  })

  const result = schema.safeParse(process.env)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const missing = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
      .join('\n')
    console.error(`\n❌ Invalid environment variables:\n${missing}\n`)
    // In production throw; in dev warn so you can still run with partial config
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration — see errors above')
    }
  }
}

export {}
