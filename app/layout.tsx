import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mid Mo Roll Offs',
  description: 'Operations hub for Mid Mo Roll Offs dumpster rental',
  manifest: '/manifest.json',
  themeColor: '#052e16',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
