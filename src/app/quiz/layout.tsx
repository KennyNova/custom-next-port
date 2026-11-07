import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find the Right Service',
  description: 'Answer a few questions and get a suggestion for which of my services fits what you need.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
