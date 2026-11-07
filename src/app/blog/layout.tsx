import type { Metadata } from 'next'

export const metadata: Metadata = {
  // Plain string titles stop the root template; restate it for child pages.
  title: { absolute: 'Blog | Navid Madani', template: '%s | Navid Madani' },
  description: 'Writing about web development, my homelab, automation, and creative projects.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
