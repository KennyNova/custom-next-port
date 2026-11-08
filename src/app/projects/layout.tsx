import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Software projects, the homelab I run, and photo and video work.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
