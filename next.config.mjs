/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'
const isProd = process.env.NODE_ENV === 'production'

const CSP = [
  "default-src 'self'",
  // Next.js requires unsafe-eval in dev; unsafe-inline needed for Tailwind style injection
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Cloudinary images, map tiles, data URIs for Leaflet markers
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org",
  // API calls: Stripe, Open-Meteo weather, NextAuth internal
  "connect-src 'self' https://api.stripe.com https://api.open-meteo.com https://wttr.in wss:",
  // Stripe payment iframe
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  // Leaflet loads tiles in workers in some configs
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Block framing by other origins
  "frame-ancestors 'none'",
].join('; ')

const SECURITY_HEADERS = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  { key: 'Content-Security-Policy', value: CSP },
  // HSTS: tell browsers to only connect via HTTPS for 2 years
  ...(isProd
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
]

const nextConfig = {
  ...(isStaticExport && {
    output: 'export',
    basePath: '/MIDMO',
    trailingSlash: true,
  }),
  transpilePackages: ['react-leaflet'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@react-pdf/renderer'],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // Security headers on every response (not applied to static export)
  ...(!isStaticExport && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: SECURITY_HEADERS,
        },
      ]
    },
  }),
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

export default nextConfig
