import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Podcast Pricing',
  description: 'Plans and pricing for podcast production.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
