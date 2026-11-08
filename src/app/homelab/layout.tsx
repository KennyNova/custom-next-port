import type { Metadata } from 'next'

export const metadata: Metadata = {
  // Plain string titles stop the root template; restate it for child pages.
  title: { absolute: 'Homelab | Navid Madani', template: '%s | Navid Madani' },
  description: 'The hardware and self-hosted software running in my homelab.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
