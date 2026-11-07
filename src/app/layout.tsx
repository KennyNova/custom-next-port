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
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Navid Madani | The Practical Cinematic Engineer',
    template: '%s | Navid Madani',
  },
  description: 'Navid Madani builds websites and automations and shoots photo and video. Projects, a self-hosted homelab, n8n templates, and a blog.',
  keywords: ['Navid Madani', 'web development', 'n8n templates', 'automation', 'homelab', 'photography', 'video production'],
  authors: [{ name: 'Navid Madani' }],
  openGraph: {
    title: 'Navid Madani | The Practical Cinematic Engineer',
    description: 'Websites, automations, photo and video. Projects, homelab notes, n8n templates, and a blog.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const clerkEnabled = isClerkConfigured()

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
              {clerkEnabled ? (
                <Suspense fallback={null}>
                  <PostHogIdentify />
                </Suspense>
              ) : null}
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

  if (!clerkEnabled) {
    return app
  }

  return <ClerkProvider>{app}</ClerkProvider>
}