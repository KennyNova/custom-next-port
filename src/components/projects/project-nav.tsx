'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'

export type ProjectNavItem = {
  id: string
  name: string
  kind: string
  icon: LucideIcon
  summary: string
  preview: string
  // When set, each hover shows a different random image from the pool instead of preview.
  previewPool?: string[]
}

// The highlight moves quickly until the visitor points at a tile, then settles into a slower pace.
const CYCLE_MS_UNTOUCHED = 1100
const CYCLE_MS = 2400
const PREVIEW_WIDTH = 320
const VIEWPORT_GUTTER = 16
const CARD_GAP = 12

// glide is false when the card opens from hidden, so it appears in place instead of sliding over from the last tile.
type Placement = { index: number; left: number; top: number; glide: boolean }

// For pooled previews, next is already mounted (invisible) so it has loaded by the time it is shown.
type PoolPick = { current: string; next: string }

function pickFrom(pool: string[], exclude?: string) {
  const options = pool.length > 1 ? pool.filter((src) => src !== exclude) : pool
  return options[Math.floor(Math.random() * options.length)]
}

// The jump links at the top of the projects page. A soft highlight walks through the tiles until someone
// points at one, and hovering or focusing a tile shows a card with a picture and the one-line summary. The
// card sits beside the grid when the screen has room for it, so the other tiles stay visible.
export function ProjectNav({ items }: { items: ProjectNavItem[] }) {
  const navRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [cycleIndex, setCycleIndex] = useState(0)
  const [cycling, setCycling] = useState(false)
  const [touched, setTouched] = useState(false)
  // placement outlives open so the card keeps its content and position while it fades out. The card is
  // always mounted (just transparent) so its pictures have loaded by the first hover.
  const [placement, setPlacement] = useState<Placement>({ index: 0, left: 0, top: 0, glide: false })
  const [open, setOpen] = useState(false)
  const [poolPicks, setPoolPicks] = useState<Record<string, PoolPick>>({})

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)')
    const update = () => setCycling(motion.matches)
    update()
    motion.addEventListener('change', update)
    return () => motion.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!cycling || open) return
    const timer = window.setInterval(
      () => setCycleIndex((i) => (i + 1) % items.length),
      touched ? CYCLE_MS : CYCLE_MS_UNTOUCHED
    )
    return () => window.clearInterval(timer)
  }, [cycling, open, touched, items.length])

  // Queue up a first random pick as soon as a pool arrives.
  useEffect(() => {
    setPoolPicks((picks) => {
      let changed = false
      const nextPicks = { ...picks }
      for (const item of items) {
        if (!item.previewPool?.length || picks[item.id]) continue
        nextPicks[item.id] = { current: item.preview, next: pickFrom(item.previewPool) }
        changed = true
      }
      return changed ? nextPicks : picks
    })
  }, [items])

  const show = (index: number) => {
    const nav = navRef.current
    const tile = tileRefs.current[index]
    if (!nav || !tile) return
    // Focus follows a click on a tile that is already showing, which shouldn't reroll its picture.
    if (open && placement.index === index) return

    const item = items[index]
    if (item.previewPool?.length) {
      const pool = item.previewPool
      setPoolPicks((picks) => {
        const pick = picks[item.id]
        const current = pick?.next ?? pickFrom(pool)
        return { ...picks, [item.id]: { current, next: pickFrom(pool, current) } }
      })
    }

    const navRect = nav.getBoundingClientRect()
    const tileRect = tile.getBoundingClientRect()
    const width = Math.min(PREVIEW_WIDTH, window.innerWidth - VIEWPORT_GUTTER * 2)
    const tileTop = tileRect.top - navRect.top
    const roomLeft = navRect.left - CARD_GAP - VIEWPORT_GUTTER
    const roomRight = window.innerWidth - navRect.right - CARD_GAP - VIEWPORT_GUTTER

    let left: number
    let top: number
    if (roomLeft >= width || roomRight >= width) {
      left = roomLeft >= width ? -CARD_GAP - width : navRect.width + CARD_GAP
      // Line the card up with the tile, but keep it inside the viewport.
      const cardHeight = cardRef.current?.offsetHeight ?? 0
      const maxTop = window.innerHeight - VIEWPORT_GUTTER - cardHeight - navRect.top
      top = Math.max(Math.min(tileTop, maxTop), VIEWPORT_GUTTER - navRect.top)
    } else {
      const minLeft = VIEWPORT_GUTTER - navRect.left
      const maxLeft = window.innerWidth - VIEWPORT_GUTTER - width - navRect.left
      left = Math.min(Math.max(tileRect.left - navRect.left, minLeft), maxLeft)
      top = tileRect.bottom - navRect.top + 8
    }

    setPlacement({ index, left, top, glide: open })
    setOpen(true)
    setTouched(true)
  }

  const hide = () => setOpen(false)

  const active = open ? placement.index : null

  return (
    <nav
      ref={navRef}
      aria-label="Projects on this page"
      className="relative"
      onMouseLeave={hide}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) hide()
      }}
    >
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
        {items.map((item, i) => {
          const lit = active === null ? cycling && cycleIndex === i : active === i
          return (
            <li key={item.id}>
              <a
                ref={(el) => {
                  tileRefs.current[i] = el
                }}
                href={`#${item.id}`}
                data-lit={lit || undefined}
                onMouseEnter={() => show(i)}
                onFocus={() => show(i)}
                onClick={hide}
                className="group flex items-center gap-2 rounded-md border-2 px-3 py-2 text-sm font-medium text-foreground transition-[border-color,background-color] duration-500 ease-out hover:duration-150 data-[lit]:border-primary/40 data-[lit]:bg-primary/5"
              >
                <item.icon className="h-4 w-4 text-primary transition-transform duration-500 ease-out group-data-[lit]:scale-110" />
                {item.name}
              </a>
            </li>
          )
        })}
      </ul>

      <div
        ref={cardRef}
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 z-30 hidden ease-out [@media(hover:hover)]:block ${
          placement.glide ? 'transition-[transform,opacity] duration-300' : 'transition-opacity duration-200'
        }`}
        style={{
          width: `min(${PREVIEW_WIDTH}px, calc(100vw - ${VIEWPORT_GUTTER * 2}px))`,
          opacity: open ? 1 : 0,
          transform: `translate(${placement.left}px, ${placement.top + (open ? 0 : 6)}px)`,
        }}
      >
        <PreviewCard items={items} index={placement.index} poolPicks={poolPicks} />
      </div>
    </nav>
  )
}

function PreviewCard({
  items,
  index,
  poolPicks,
}: {
  items: ProjectNavItem[]
  index: number
  poolPicks: Record<string, PoolPick>
}) {
  const item = items[index]

  return (
    <div className="overflow-hidden rounded-lg border-2 bg-card shadow-xl">
      <div className="relative aspect-[16/10] bg-muted">
        {items.flatMap((entry, i) => {
          const pick = poolPicks[entry.id]
          const shown = pick?.current ?? entry.preview
          // Keyed by src, so the preloaded next image keeps its element when it becomes current.
          const sources = pick && pick.next !== shown ? [shown, pick.next] : [shown]
          return sources.map((src) => (
            <Image
              key={`${entry.id}-${src}`}
              src={src}
              alt=""
              fill
              sizes={`${PREVIEW_WIDTH}px`}
              className={`object-cover object-top transition-opacity duration-300 ${i === index && src === shown ? 'opacity-100' : 'opacity-0'}`}
            />
          ))
        })}
      </div>
      <div className="space-y-1 p-3">
        <p className="text-xs text-muted-foreground">{item.kind}</p>
        <p className="font-semibold leading-tight">{item.name}</p>
        <p className="text-sm text-muted-foreground">{item.summary}</p>
      </div>
    </div>
  )
}
