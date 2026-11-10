'use client'

import { useEffect, useRef, useState } from 'react'

// Clips are recorded from the real extension running its built-in demo data (?videoDemo=1).
const FEATURES = [
  {
    id: 'resize',
    title: 'Resize any tile',
    text: 'Widgets re-lay themselves out for the space they get. Weather goes from one reading to a full forecast.',
  },
  {
    id: 'arrange',
    title: 'Drag, drop, add',
    text: 'Move tiles around the grid and drop new widgets into the gaps.',
  },
  {
    id: 'search',
    title: 'Pick the AI per search',
    text: 'Switch between ChatGPT, Claude, Perplexity, Google or your own sources right from the search bar.',
  },
  {
    id: 'theme',
    title: 'Light and dark',
    text: 'Every widget follows the theme, over any wallpaper you like.',
  },
]

export function TabreezeShowcase() {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const [inView, setInView] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const feature = FEATURES[active]

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(query.matches)
    const onChange = () => setReducedMotion(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Only play while the showcase is on screen, so four clips never decode at once.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (inView && !reducedMotion) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [active, inView, reducedMotion])

  const select = (index: number) => {
    setProgress(0)
    setActive(index)
  }

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="overflow-hidden rounded-xl border-2 bg-black shadow-lg">
        <video
          key={feature.id}
          ref={videoRef}
          className="aspect-[3/2] w-full object-cover"
          poster={`/projects/tabreeze/${feature.id}.jpg`}
          muted
          playsInline
          preload="metadata"
          controls={reducedMotion}
          aria-label={`Tabreeze: ${feature.title}`}
          onTimeUpdate={(event) => {
            const { currentTime, duration } = event.currentTarget
            if (duration) setProgress(currentTime / duration)
          }}
          onEnded={() => select((active + 1) % FEATURES.length)}
        >
          <source src={`/projects/tabreeze/${feature.id}.mp4`} type="video/mp4" />
        </video>
      </div>

      <div role="tablist" aria-label="Tabreeze features" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {FEATURES.map((item, index) => {
          const isActive = index === active
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => select(index)}
              className={`relative flex flex-col items-start overflow-hidden rounded-lg border-2 p-3 text-left transition-[border-color,background-color] ${
                isActive ? 'border-primary/40 bg-primary/5' : 'hover:border-primary/20 hover:bg-primary/5'
              }`}
            >
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 bg-primary transition-[width] duration-200 ease-linear"
                  style={{ width: `${progress * 100}%` }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
