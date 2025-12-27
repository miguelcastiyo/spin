import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Spin!',
  description: 'Created with v0',
  generator: 'v0.dev',
  icons: {
    icon: '/racoon.png',
    shortcut: '/racoon.png',
    apple: '/racoon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
