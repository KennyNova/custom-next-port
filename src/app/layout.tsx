import type { Metadata } from 'next'
import { Suspense } from 'react'
import '@/styles/globals.css'
import { satoshi } from '@/lib/fonts'
import { ClerkProvider } from '@clerk/nextjs'
import { isClerkConfigured } from '@/lib/clerk-config'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { PerfProvider } from '@/components/providers/perf-provider'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { PostHogIdentify } from '@/components/providers/posthog-identify'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Portfolio & Blog',
  description: 'A modern, interactive portfolio and blog website showcasing professional work, personal projects, and hobbies.',
  keywords: ['portfolio', 'blog', 'web development', 'projects'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Portfolio & Blog',
    description: 'A modern, interactive portfolio and blog website',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const app = (
    <html lang="en" className={satoshi.variable} suppressHydrationWarning>
      <body className={`${satoshi.className} font-sans antialiased`}>
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <PerfProvider>
              <Suspense fallback={null}>
                <PostHogIdentify />
              </Suspense>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </PerfProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  )

  if (!isClerkConfigured()) {
    return app
  }

  return <ClerkProvider>{app}</ClerkProvider>
}