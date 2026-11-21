'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink, Play } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

// The browser build of Resonance lives in public/resonance. Linking to index.html
// directly keeps the request out of the auth middleware, which skips paths with a dot.
export const RESONANCE_URL = '/resonance/index.html'

// Stills are captured from the app itself, running its demo synth.
const VISUALIZERS = [
  { id: 'alloy', label: 'Alloy', alt: 'An iridescent metal lattice with a glowing core, floating over a neon grid' },
  { id: 'waves', label: 'Waves', alt: 'A violet ocean whose wave crests rise from the music spectrum' },
  { id: 'coral', label: 'Coral', alt: 'Reaction-diffusion stripes growing out from the centre like a fingerprint' },
  { id: 'cymatics', label: 'Cymatics', alt: 'Sand gathered into a Chladni pattern on a vibrating plate' },
  { id: 'flow', label: 'Flow', alt: 'Swirling smoke trails left by particles in curl noise' },
]

// Loads only on click: the demo runs a GPU simulation and asks for audio, which shouldn't happen just by scrolling past.
export function ResonanceEmbed() {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const viz = VISUALIZERS[active]
  const src = `${RESONANCE_URL}?viz=${viz.id}`

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border-2 bg-black shadow-lg">
        {playing ? (
          <iframe
            key={viz.id}
            src={src}
            title={`Resonance: ${viz.label}`}
            className="h-full w-full"
            allow="autoplay; fullscreen; microphone; display-capture"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0">
            <Image
              src={`/projects/resonance/${viz.id}.jpg`}
              alt={viz.alt}
              fill
              className="object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className={buttonVariants({ size: 'lg' })}>
                <Play className="mr-2 h-5 w-5" />
                Run {viz.label} here
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {VISUALIZERS.map((v, i) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`group relative aspect-[16/10] overflow-hidden rounded-md border-2 transition-[border-color] ${
              i === active ? 'border-primary' : 'border-transparent hover:border-primary/40'
            }`}
          >
            <Image src={`/projects/resonance/${v.id}.jpg`} alt="" fill className="object-cover" sizes="12vw" />
            <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[11px] font-medium text-white">
              {v.label}
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>
          {playing
            ? 'Pick Demo synth for instant sound, or share a tab with audio playing.'
            : 'Needs a browser with WebGL2. Best on a desktop GPU.'}
        </span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-shrink-0 items-center gap-1 text-foreground hover:underline"
        >
          Open full screen
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
