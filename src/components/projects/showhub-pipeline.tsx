'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { FileText, Globe, PenLine, Play, RefreshCw } from 'lucide-react'

// Every source type Show Hub can sync from (connectorPlatform in the Show Hub Convex schema).
const SOURCES = ['RSS', 'YouTube', 'Spotify', 'Apple Podcasts', 'SoundCloud', 'TikTok', 'Instagram', 'X', 'Twitch', 'Kick']

const OUTPUTS = [
  { id: 'pages', name: 'Episode pages', detail: 'showhubco.com subdomain or your own domain', icon: Globe },
  { id: 'embed', name: 'Embed player', detail: 'One script tag on any site', icon: Play },
  { id: 'blog', name: 'Blog drafts', detail: 'Written by Claude from the transcript', icon: PenLine },
]

const EDGES: [string, string][] = [
  ...SOURCES.map((source): [string, string] => [`source-${source}`, 'sync']),
  ['sync', 'transcribe'],
  ...OUTPUTS.map((output): [string, string] => ['transcribe', `output-${output.id}`]),
]

const PACKET_SECONDS = 2.4
const WAVE_BARS = [0.5, 0.9, 0.6, 1, 0.7, 0.4, 0.85, 0.55, 0.95, 0.65, 0.45, 0.8]

function Node({ id, className = '', children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <div data-node={id} className={`relative z-10 rounded-lg border-2 bg-card p-3 ${className}`}>
      {children}
    </div>
  )
}

// Connector paths are measured from the rendered nodes so the packets line up at any width.
export function ShowHubPipeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [paths, setPaths] = useState<{ key: string; d: string }[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const measure = () => {
      const box = container.getBoundingClientRect()
      const anchor = (id: string, edge: 'top' | 'bottom') => {
        const el = container.querySelector<HTMLElement>(`[data-node="${id}"]`)
        if (!el) return null
        const rect = el.getBoundingClientRect()
        return { x: rect.left - box.left + rect.width / 2, y: (edge === 'top' ? rect.top : rect.bottom) - box.top }
      }

      setPaths(
        EDGES.flatMap(([from, to]) => {
          const a = anchor(from, 'bottom')
          const b = anchor(to, 'top')
          if (!a || !b) return []
          const mid = (b.y - a.y) / 2
          return [{ key: `${from}-${to}`, d: `M ${a.x} ${a.y} C ${a.x} ${a.y + mid}, ${b.x} ${b.y - mid}, ${b.x} ${b.y}` }]
        })
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="relative rounded-xl border-2 bg-card p-4 md:p-6">
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        {paths.map((path) => (
          <path key={path.key} d={path.d} fill="none" strokeWidth={2} className="stroke-border" />
        ))}
        <g className="motion-reduce:hidden">
          {paths.map((path, i) => (
            // Negative begin offsets stagger the packets without parking them at 0,0 before they start.
            <g key={`${path.key}-${path.d}`}>
              {[{ r: 9, className: 'fill-primary/20' }, { r: 3.5, className: 'fill-primary' }].map((dot) => (
                <circle key={dot.r} r={dot.r} className={dot.className}>
                  <animateMotion
                    dur={`${PACKET_SECONDS}s`}
                    begin={`${-((i * 0.37) % PACKET_SECONDS)}s`}
                    repeatCount="indefinite"
                    path={path.d}
                  />
                </circle>
              ))}
            </g>
          ))}
        </g>
      </svg>

      <div className="relative space-y-10">
        {/* Lines start under each chip and fan out from beneath the panel, which sits above the SVG. */}
        <Node id="sources">
          <p className="mb-3 text-xs text-muted-foreground">Pulls from wherever the show already publishes</p>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((source) => (
              <span
                key={source}
                data-node={`source-${source}`}
                className="rounded-md border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                {source}
              </span>
            ))}
          </div>
        </Node>

        <Node id="sync" className="mx-auto max-w-md border-primary/40">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 flex-shrink-0 animate-spin text-primary [animation-duration:3s] motion-reduce:animate-none" />
            <div>
              <p className="font-semibold">Sync</p>
              <p className="text-xs text-muted-foreground">Convex pulls new episodes and matches the same one across platforms</p>
            </div>
          </div>
        </Node>

        <Node id="transcribe" className="mx-auto max-w-md border-primary/40">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 flex-shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Transcribe</p>
              <p className="text-xs text-muted-foreground">
                Native captions first, then AssemblyAI or a Whisper worker on my home server
              </p>
            </div>
            <div className="flex h-8 flex-shrink-0 items-center gap-0.5" aria-hidden="true">
              {WAVE_BARS.map((height, i) => (
                <span
                  key={i}
                  className="showhub-wave-bar w-1 rounded-full bg-primary/70"
                  style={{ height: `${height * 100}%`, animationDelay: `${-i * 0.13}s` }}
                />
              ))}
            </div>
          </div>
        </Node>

        <div className="grid gap-3 sm:grid-cols-3">
          {OUTPUTS.map((output) => (
            <Node key={output.id} id={`output-${output.id}`}>
              <output.icon className="mb-2 h-4 w-4 text-primary" />
              <p className="text-sm font-medium">{output.name}</p>
              <p className="text-xs text-muted-foreground">{output.detail}</p>
            </Node>
          ))}
        </div>
      </div>
    </div>
  )
}
