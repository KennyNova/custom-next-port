'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink, Play } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export const SQUARZLE_URL = 'https://squarzle-next-rho.vercel.app'

// The game loads only on click: it pans and zooms on scroll, which would trap the page while scrolling past.
export function SquarzleEmbed() {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl border-2 bg-black shadow-lg">
        {playing ? (
          <iframe src={SQUARZLE_URL} title="Squarzle" className="h-full w-full" allow="fullscreen" />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0">
            <Image
              src="/projects/squarzle-board.jpg"
              alt="A Squarzle board with levelled squares, treasure, gates and portals"
              fill
              className="object-cover object-left-top opacity-70 transition-opacity duration-300 group-hover:opacity-90"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className={buttonVariants({ size: 'lg' })}>
                <Play className="mr-2 h-5 w-5" />
                Play here
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>{playing ? 'Scroll inside the board to zoom, drag to pan.' : 'Loads the live build from Vercel.'}</span>
        <a
          href={SQUARZLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-foreground hover:underline"
        >
          Open full screen
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
