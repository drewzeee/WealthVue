import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/lib/providers/SessionProvider'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { ThemeProvider } from '@/core/theme/ThemeContext'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'WealthVue - Personal Financial Dashboard',
  description: 'Unified budget management, investment tracking, and asset overview',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <SessionProvider>
            <QueryProvider>{children}</QueryProvider>
          </SessionProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
