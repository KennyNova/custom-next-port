import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Signatures',
  description: 'Sign in with GitHub, LinkedIn, or Google and leave a note.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
