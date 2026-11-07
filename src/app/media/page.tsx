import type { Metadata } from 'next'
import { ShowHubSection } from '@/components/showhub/showhub-section'
import { showHubConfig } from '@/config/showhub'

export const metadata: Metadata = {
  title: showHubConfig.heading,
  description: showHubConfig.intro,
}

export default function MediaPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">{showHubConfig.heading}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{showHubConfig.intro}</p>
      </header>
      <ShowHubSection blocks={showHubConfig.blocks} showHeading={false} />
    </div>
  )
}
