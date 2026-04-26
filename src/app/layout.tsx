import type { Metadata, Viewport } from 'next'
import { Outfit, IBM_Plex_Mono } from 'next/font/google'
import { StoreProvider } from '@/lib/store'
import { ToastProvider } from '@/components/Toast'
import { Shell } from '@/components/Shell'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FBIS — Food Bank Intel System',
  description: 'Real-time food allocation intelligence for waste elimination',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FBIS',
  },
}

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased">
        <StoreProvider>
          <ToastProvider>
            <Shell>
              {children}
            </Shell>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
