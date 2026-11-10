'use client'

import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowRight, Camera, ExternalLink, Gamepad2, Github, LayoutGrid, Podcast, Server } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PhotoModal } from '@/components/ui/photo-modal'
import { TabreezeShowcase } from '@/components/projects/tabreeze-showcase'
import { ShowHubPipeline } from '@/components/projects/showhub-pipeline'
import { SquarzleEmbed, SQUARZLE_URL } from '@/components/projects/squarzle-embed'
import { HomelabExplorer } from '@/components/projects/homelab-explorer'
import type { Photo } from '@/types'
import type { LucideIcon } from 'lucide-react'

type ProjectLink = { label: string; href: string; icon?: LucideIcon; primary?: boolean }

type ProjectEntry = {
  id: string
  name: string
  kind: string
  icon: LucideIcon
  summary: string
  body: string[]
  details: string[]
  stack: string[]
  links: ProjectLink[]
  wideVisual?: boolean
}

const projects: ProjectEntry[] = [
  {
    id: 'tabreeze',
    name: 'Tabreeze',
    kind: 'Chrome and Edge extension',
    icon: LayoutGrid,
    summary: 'Your new tab, built out of tiles you size and place yourself. Free, with no account.',
    body: [
      'I open a new tab a hundred times a day, so I turned it into a dashboard I can actually arrange. The name is Tabriz, the city in northwestern Iran, mashed together with breeze.',
    ],
    details: [
      'Free and open source, and there is nothing to sign up for',
      'Your layout, tasks and settings are saved locally in your browser',
      'Widgets for search, bookmarks, tasks, Google and Outlook calendars, weather, quotes, news, stocks and homelab status',
    ],
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Manifest V3'],
    links: [
      { label: 'Chrome Web Store', href: 'https://chromewebstore.google.com/detail/tabreeze/nicfglggmbdhllhfeciibfbjdicgbdfa', icon: ExternalLink, primary: true },
      { label: 'tabreeze.app', href: 'https://tabreeze.app', icon: ExternalLink },
      { label: 'Source', href: 'https://github.com/KennyNova/Tabriz', icon: Github },
    ],
    wideVisual: true,
  },
  {
    id: 'showhub',
    name: 'Show Hub',
    kind: 'Podcast platform',
    icon: Podcast,
    summary: 'Connect a podcast feed and get episode pages, transcripts and an embeddable player.',
    body: [
      'Show Hub syncs a show from wherever it is published, transcribes each episode, and builds search-friendly pages on a showhubco.com subdomain or your own domain. Paid tiers add AI-drafted blog posts from the transcripts.',
    ],
    details: [
      'Feed sync from the platforms a show already publishes on',
      'Transcripts through AssemblyAI, with a self-hosted Whisper worker on my home server',
      'An embeddable player, so the episodes can live on a site the show already has',
    ],
    stack: ['Next.js', 'Convex', 'Clerk', 'AssemblyAI', 'Claude', 'Cloudflare R2'],
    links: [
      { label: 'showhubco.com', href: 'https://showhubco.com', icon: ExternalLink, primary: true },
    ],
  },
  {
    id: 'squarzle',
    name: 'Squarzle',
    kind: 'Browser game',
    icon: Gamepad2,
    summary: 'A clicker game played on a seeded parquet grid.',
    body: [
      'Break a square and its neighbours open up. Some squares hold treasure that raises your click damage, auto-click rate, coins or luck. Each level has a gate that only opens after you clear enough squares on it, and portals can get you past one early.',
    ],
    details: [
      'Maps are generated from a seed, so the same seed always gives the same board',
      'Shop upgrades for click power, auto-clickers, coin multipliers and luck',
      'Pan and zoom across the whole board',
    ],
    stack: ['Next.js', 'React', 'seedrandom', 'Tailwind CSS'],
    links: [
      { label: 'Play full screen', href: SQUARZLE_URL, icon: ExternalLink, primary: true },
      { label: 'Source', href: 'https://github.com/KennyNova/squarzle-next', icon: Github },
    ],
  },
  {
    id: 'homelab',
    name: 'Homelab',
    kind: 'Self-hosted infrastructure',
    icon: Server,
    summary: 'One machine running Proxmox, with everything else in VMs on top.',
    body: [
      'Proxmox splits the box into VMs: CasaOS for Docker apps, Coolify for hosting my own sites, Home Assistant, a Windows VM and file storage. Media, dev tools, notes and network services all run as containers inside CasaOS.',
    ],
    details: [
      'Debian 12 under every VM and container',
      'ZFS mirror across the drives',
      'The integrated GPU handles media transcoding',
    ],
    stack: ['Proxmox VE', 'CasaOS', 'Coolify', 'Home Assistant', 'Docker'],
    links: [
      { label: 'Full architecture', href: '/homelab', icon: ArrowRight, primary: true },
    ],
  },
  {
    id: 'photography',
    name: 'Photography',
    kind: 'Photos',
    icon: Camera,
    summary: 'Pictures I have taken, with the camera settings where I kept them.',
    body: [
      'Click any photo to open it full size with its camera, lens and exposure details.',
    ],
    details: [],
    stack: [],
    links: [],
  },
]

function ProjectLinks({ links }: { links: ProjectLink[] }) {
  if (links.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => {
        const external = link.href.startsWith('http')
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className={buttonVariants({ variant: link.primary ? 'default' : 'outline', size: 'sm' })}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {link.label}
            {Icon && <Icon className="ml-2 h-4 w-4" />}
          </Link>
        )
      })}
    </div>
  )
}

function ProjectSection({ project, index, visual }: { project: ProjectEntry; index: number; visual: ReactNode }) {
  const flipped = index % 2 === 1
  const textSpan = project.wideVisual ? 'lg:col-span-4' : 'lg:col-span-5'
  const visualSpan = project.wideVisual ? 'lg:col-span-8' : 'lg:col-span-7'

  return (
    <section id={project.id} className="scroll-mt-24 border-t py-16">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
        <div className={`space-y-5 ${textSpan} ${flipped ? 'lg:order-2' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <project.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">{project.kind}</span>
          </div>
          <h2 className="text-3xl font-bold md:text-4xl">{project.name}</h2>
          <p className="text-lg">{project.summary}</p>
          {project.body.map((paragraph) => (
            <p key={paragraph} className="text-muted-foreground">{paragraph}</p>
          ))}
          {project.details.length > 0 && (
            <ul className="space-y-2 text-sm">
              {project.details.map((detail) => (
                <li key={detail} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}
          {project.stack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span key={tech} className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                  {tech}
                </span>
              ))}
            </div>
          )}
          <ProjectLinks links={project.links} />
        </div>
        <div className={`${visualSpan} ${flipped ? 'lg:order-1' : ''}`}>{visual}</div>
      </div>
    </section>
  )
}

// Set to a real show's Show Hub ID to swap the pipeline diagram for the live embed player.
const SHOWHUB_EMBED_PODCAST_ID: string | null = null
const SHOWHUB_CONTAINER = 'showhub-projects-embed'

function ShowHubVisual() {
  if (SHOWHUB_EMBED_PODCAST_ID) {
    return (
      <Card className="border-2">
        <CardContent className="p-4 md:p-6">
          <div id={SHOWHUB_CONTAINER} className="min-h-[240px]">
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
          <Script
            src="https://showhubco.com/embed.js?instance=projects"
            strategy="afterInteractive"
            data-podcast-id={SHOWHUB_EMBED_PODCAST_ID}
            data-devplan="free"
            data-style="list"
            data-theme="auto"
            data-max-episodes="3"
            data-section="recent"
            data-container={SHOWHUB_CONTAINER}
          />
        </CardContent>
      </Card>
    )
  }

  return <ShowHubPipeline />
}

const PHOTO_PREVIEW_COUNT = 6

function PhotographyVisual() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [modalIndex, setModalIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos?sort=order&limit=50')
        if (!response.ok) throw new Error(`Failed to fetch photos: ${response.status}`)
        const data = await response.json()
        setPhotos(data.photos || [])
      } catch (err) {
        console.error('Error fetching photos:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: PHOTO_PREVIEW_COUNT }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    )
  }

  if (error || photos.length === 0) {
    return (
      <Card className="border-2">
        <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <Camera className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            {error ? 'Photos could not be loaded right now.' : 'No photos published yet.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const visible = showAll ? photos : photos.slice(0, PHOTO_PREVIEW_COUNT)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visible.map((photo, i) => (
          <button
            key={photo._id.toString()}
            type="button"
            onClick={() => setModalIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-lg border-2 hover:border-primary/40"
          >
            <Image
              src={photo.thumbnailUrl || photo.blobUrl}
              alt={photo.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          </button>
        ))}
      </div>
      {photos.length > PHOTO_PREVIEW_COUNT && (
        <Button variant="outline" size="sm" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Show fewer' : `Show all ${photos.length} photos`}
        </Button>
      )}
      <PhotoModal
        photos={photos}
        initialIndex={modalIndex ?? 0}
        isOpen={modalIndex !== null}
        onClose={() => setModalIndex(null)}
      />
    </div>
  )
}

const visuals: Record<string, ComponentType> = {
  tabreeze: TabreezeShowcase,
  showhub: ShowHubVisual,
  squarzle: SquarzleEmbed,
  homelab: HomelabExplorer,
  photography: PhotographyVisual,
}

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="grid gap-8 pb-12 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Projects</h1>
          <p className="text-xl text-muted-foreground">
            Things I have built and keep running: two products, a browser game, the home server I self-host on,
            and the photos I take along the way.
          </p>
        </div>
        <nav aria-label="Projects on this page" className="lg:col-span-5">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {projects.map((project) => (
              <li key={project.id}>
                <a
                  href={`#${project.id}`}
                  className="flex items-center gap-2 rounded-md border-2 px-3 py-2 text-sm font-medium text-foreground transition-[border-color,background-color] hover:border-primary/40 hover:bg-primary/5"
                >
                  <project.icon className="h-4 w-4 text-primary" />
                  {project.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {projects.map((project, index) => {
        const Visual = visuals[project.id]
        return <ProjectSection key={project.id} project={project} index={index} visual={<Visual />} />
      })}
    </div>
  )
}
