import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ShowHubEmbed } from '@/components/showhub/showhub-embed'
import { showHubConfig, type ShowHubBlock } from '@/config/showhub'

type ShowHubSectionProps = {
  blocks: ShowHubBlock[]
  /** Show the section heading and intro (off when the page has its own h1). */
  showHeading?: boolean
  /** Link to /media under the blocks. */
  showMoreLink?: boolean
}

export function ShowHubSection({ blocks, showHeading = true, showMoreLink = false }: ShowHubSectionProps) {
  const visible = blocks.filter((b) => b.contentId)
  if (visible.length === 0) return null

  return (
    <section aria-labelledby={showHeading ? 'showhub-heading' : undefined} className="py-20">
      {showHeading && (
        <div className="mb-10 text-center">
          <h2 id="showhub-heading" className="text-3xl font-bold">
            {showHubConfig.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{showHubConfig.intro}</p>
        </div>
      )}

      <div className="mx-auto max-w-5xl space-y-12">
        {visible.map((block) => (
          <div key={block.id}>
            {(visible.length > 1 || !showHeading) && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold">{block.title}</h3>
                {block.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{block.description}</p>
                )}
              </div>
            )}
            <ShowHubEmbed block={block} />
          </div>
        ))}
      </div>

      {showMoreLink && (
        <div className="mt-10 text-center">
          <Link
            href="/media"
            className="group inline-flex items-center text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            Everything I’ve published
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </section>
  )
}
