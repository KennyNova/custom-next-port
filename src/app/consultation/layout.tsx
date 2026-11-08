import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Call',
  description: 'Websites, photo and video, and automation work. Start with a free 30-minute call.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
