/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'

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
