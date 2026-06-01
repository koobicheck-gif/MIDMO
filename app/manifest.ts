import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mid Mo Roll Offs',
    short_name: 'MidMo',
    description: 'Operations hub for Mid Mo Roll Offs',
    start_url: '/',
    display: 'standalone',
    background_color: '#052e16',
    theme_color: '#052e16',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
