import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { checkRateLimit, LOGIN_LIMIT } from './rate-limit'

// Constant-time dummy hash — prevents timing-based user enumeration.
// An attacker who times the response can't tell "user not found" from "wrong password"
// because bcrypt.compare always runs regardless.
const DUMMY_HASH = '$2b$12$LkdVKiY1C8gFJXSVTqREJe3S4x0T5W2NjX6cH9y7oMZkD4bLrJvHu'

function getClientIp(req: Record<string, unknown>): string {
  const headers = req.headers as Record<string, string> | undefined
  return (
    headers?.['x-forwarded-for']?.split(',')[0].trim() ??
    headers?.['x-real-ip'] ??
    'unknown'
  )
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours — force re-auth at end of workday
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // Rate limit by IP — 10 attempts per 15 minutes
        const ip = getClientIp(req as Record<string, unknown>)
        const key = `login:${ip}:${credentials.email.toLowerCase()}`
        const { allowed } = checkRateLimit(key, LOGIN_LIMIT.windowMs, LOGIN_LIMIT.max)
        if (!allowed) {
          throw new Error('Too many login attempts. Please wait 15 minutes.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          select: { id: true, email: true, name: true, role: true, hashedPassword: true },
        })

        // Always run bcrypt — prevents timing attack revealing valid email addresses
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user?.hashedPassword ?? DUMMY_HASH
        )

        if (!user || !passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      // Could write to audit log here
      console.info(`[Auth] Sign in: ${user.email} (${(user as any).role})`)
    },
    async signOut({ token }) {
      console.info(`[Auth] Sign out: ${token?.email}`)
    },
  },
}
