'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/components/providers/theme-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { SHOWHUB_EMBED_SRC, type ShowHubBlock } from '@/config/showhub'
import type { Theme } from '@/types'

type Status = 'loading' | 'ready' | 'error'

const DARK_THEMES: Theme[] = ['dark', 'developer', 'coffee']
const LOAD_TIMEOUT_MS = 12_000

function resolveEmbedTheme(siteTheme: Theme): 'light' | 'dark' | 'auto' {
  if (siteTheme === 'system') return 'auto'
  return DARK_THEMES.includes(siteTheme) ? 'dark' : 'light'
}

function buildAttributes(block: ShowHubBlock, containerId: string, theme: string) {
  const attrs: Record<string, string | undefined> = {
    'data-content-id': block.contentId,
    'data-container': containerId,
    'data-devplan': block.devplan ?? 'free',
    'data-theme': theme,
    'data-style': block.style,
    'data-template': block.template,
    'data-section': block.section,
    'data-max-episodes': block.maxEpisodes?.toString(),
    'data-episode-id': block.episodeId,
    'data-season-id': block.seasonId,
    'data-api-base': block.apiBase,
    ...block.attributes,
  }
  return Object.entries(attrs).filter((entry): entry is [string, string] => Boolean(entry[1]))
}

let runCounter = 0

/**
 * Mounts one Show Hub embed.
 *
 * We inject the script ourselves instead of using next/script: next/script
 * dedupes by src (so a second embed on the page never runs) and won't re-run
 * after client-side navigation. The embed locates its config through
 * document.currentScript, so each mount gets its own fresh <script> tag and a
 * unique container id; a stale script from an earlier mount (e.g. React strict
 * mode) can't find the new container and renders nowhere.
 */
export function ShowHubEmbed({ block, className }: { block: ShowHubBlock; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const { theme: siteTheme } = useTheme()
  const theme = block.theme ?? resolveEmbedTheme(siteTheme)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    const host = hostRef.current
    if (!host || !block.contentId) return

    setStatus('loading')
    const containerId = `showhub-${block.id}-${++runCounter}`
    const container = document.createElement('div')
    container.id = containerId
    host.replaceChildren(container)

    let observer: MutationObserver | undefined
    const markReadyIfRendered = () => {
      const root = container.shadowRoot ?? container
      // The embed always injects a <style> first; anything else means it rendered.
      if (Array.from(root.children).some((el) => el.tagName !== 'STYLE')) {
        setStatus('ready')
        observer?.disconnect()
        return true
      }
      return false
    }

    const script = document.createElement('script')
    script.src = SHOWHUB_EMBED_SRC
    script.async = true
    for (const [name, value] of buildAttributes(block, containerId, theme)) {
      script.setAttribute(name, value)
    }
    script.onerror = () => setStatus('error')
    script.onload = () => {
      if (markReadyIfRendered()) return
      observer = new MutationObserver(markReadyIfRendered)
      observer.observe(container.shadowRoot ?? container, { childList: true, subtree: true })
    }

    const timeout = window.setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'error' : s))
    }, LOAD_TIMEOUT_MS)

    host.appendChild(script)

    return () => {
      window.clearTimeout(timeout)
      observer?.disconnect()
      script.onload = null
      script.onerror = null
      host.replaceChildren()
    }
  }, [block, theme])

  return (
    <div className={cn('relative', className)}>
      {status === 'loading' && (
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      {status === 'error' && (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          This couldn’t load right now.{' '}
          <a
            href="https://showhubco.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Try Show Hub directly
          </a>
          .
        </p>
      )}
      <div
        ref={hostRef}
        aria-busy={status === 'loading'}
        className={cn(status === 'loading' && 'absolute inset-0 opacity-0')}
      />
    </div>
  )
}
