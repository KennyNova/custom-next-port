import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'n8n Templates',
  description: 'Searchable n8n workflow templates with graph previews and downloads.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
