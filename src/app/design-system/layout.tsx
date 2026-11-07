import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design System',
  description: 'Internal page.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
