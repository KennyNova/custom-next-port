import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

export const DIAMOND_FINDER_URL = 'https://masinadiamonds.com/pages/diamonds'

// A screenshot links out instead of an iframe: the finder lives inside the client's Shopify store.
export function DiamondFinderPreview() {
  return (
    <div className="space-y-3">
      <a
        href={DIAMOND_FINDER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block aspect-[1440/826] overflow-hidden rounded-xl border-2 shadow-lg"
      >
        <Image
          src="/projects/diamond-finder/finder.jpg"
          alt="The Masina Diamonds finder: live stone count, natural, lab-grown and fancy color tabs, quick picks, shape filters and carat and price histograms"
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 58vw"
        />
      </a>
      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>Live on masinadiamonds.com. Built for a client, so the code is not public.</span>
        <a
          href={DIAMOND_FINDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          Open the finder
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
