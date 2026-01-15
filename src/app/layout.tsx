import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/lib/providers/SessionProvider'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { ThemeProvider } from '@/core/theme/ThemeContext'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const fontHeading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: '700', // Default bold for headings
})

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
      <body className={`${spaceGrotesk.variable} ${fontHeading.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider>
          <SessionProvider>
            <QueryProvider>{children}</QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
