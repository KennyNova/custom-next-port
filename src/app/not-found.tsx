import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-4xl font-bold">This page doesn&apos;t exist</h1>
      <p className="mt-4 text-muted-foreground">The link may be old, or the page may have moved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/projects">See projects</Link>
        </Button>
      </div>
    </div>
  )
}
