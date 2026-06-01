import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Static export: middleware is not executed — skip entirely
// Live deployment: enforce JWT auth and owner-only routes
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    if (req.nextUrl.pathname.startsWith('/settings') && token?.role !== 'OWNER') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|api/stripe/webhook|login|_next/static|_next/image|favicon.ico|manifest.json|icon-).*)',
  ],
}
