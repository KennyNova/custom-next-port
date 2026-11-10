'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { N8nTemplateConnection, N8nTemplateNode } from '@/types'

type GraphMode = 'thumbnail' | 'full'

interface N8nNodeGraphProps {
  nodes: N8nTemplateNode[]
  connections: N8nTemplateConnection[]
  mode?: GraphMode
  className?: string
}

type NormalizedNode = N8nTemplateNode & {
  x: number
  y: number
}

type LabelPlacement = {
  nodeId: string
  label: string
  x: number
  y: number
  width: number
  height: number
  side: 'left' | 'right'
  nodeAnchorX: number
  nodeAnchorY: number
}

type KeyNode = {
  node: NormalizedNode
  label: string
  score: number
}

type ViewboxConfig = {
  width: number
  height: number
  nodeW: number
  nodeH: number
  padding: number
}

const BASE_VIEWBOX = {
  thumbnail: { width: 224, height: 224, nodeW: 24, nodeH: 16, padding: 18 },
  full: { width: 1120, height: 660, nodeW: 124, nodeH: 46, padding: 44 },
} as const

const SERVICE_TOKENS: Array<[token: string, label: string]> = [
  ['airbnb', 'Airbnb'],
  ['openai', 'OpenAI'],
  ['anthropic', 'Anthropic'],
  ['cohere', 'Cohere'],
  ['slack', 'Slack'],
  ['googleSheets', 'Google Sheets'],
  ['gmail', 'Gmail'],
  ['notion', 'Notion'],
  ['webhook', 'Webhook'],
  ['supabase', 'Supabase'],
  ['pinecone', 'Pinecone'],
  ['redis', 'Redis'],
  ['postgres', 'Postgres'],
  ['mysql', 'MySQL'],
  ['airtable', 'Airtable'],
  ['hubspot', 'HubSpot'],
  ['salesforce', 'Salesforce'],
  ['stripe', 'Stripe'],
  ['twilio', 'Twilio'],
  ['http', 'HTTP'],
]

const AI_TOKENS = ['openai', 'anthropic', 'cohere', 'langchain', 'llm', 'agent']

function getGraphConfig(mode: GraphMode, nodeCount: number): ViewboxConfig {
  if (mode === 'full') return { ...BASE_VIEWBOX.full }

  if (nodeCount >= 20) {
    return { width: 224, height: 224, nodeW: 13, nodeH: 9, padding: 14 }
  }

  if (nodeCount >= 14) {
    return { width: 224, height: 224, nodeW: 17, nodeH: 11, padding: 15 }
  }

  return { ...BASE_VIEWBOX.thumbnail }
}

function getNodeColor(nodeType: string): string {
  const normalized = nodeType.toLowerCase()

  if (normalized.includes('webhook') || normalized.includes('trigger')) return 'hsl(var(--success))'
  if (normalized.includes('langchain') || normalized.includes('openai') || normalized.includes('anthropic') || normalized.includes('cohere')) return 'hsl(var(--info))'
  if (
    normalized.includes('slack') ||
    normalized.includes('gmail') ||
    normalized.includes('sheets') ||
    normalized.includes('notion') ||
    normalized.includes('http')
  ) {
    return 'hsl(var(--primary))'
  }
  if (normalized.includes('vectorstore') || normalized.includes('pinecone') || normalized.includes('supabase')) return 'hsl(var(--warning))'

  return 'hsl(var(--muted-foreground))'
}

function toTitleCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function truncateLabel(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1)}…`
}

function deriveServiceLabel(node: N8nTemplateNode): string {
  const type = node.type.toLowerCase()
  const name = node.name.toLowerCase()

  for (const [token, label] of SERVICE_TOKENS) {
    if (type.includes(token.toLowerCase()) || name.includes(token.toLowerCase())) return label
  }

  const rawTypeSegment = node.type.split('.').pop() || node.type
  return toTitleCase(rawTypeSegment).split(' ').slice(0, 2).join(' ')
}

function deriveActionLabel(nodeName: string, serviceLabel: string): string {
  let action = nodeName.trim().replace(/\s+/g, ' ')

  for (const token of serviceLabel.split(' ')) {
    const tokenRegex = new RegExp(`\\b${escapeRegExp(token)}\\b`, 'ig')
    action = action.replace(tokenRegex, '').replace(/\s+/g, ' ').trim()
  }

  if (!action) action = nodeName
  return action
}

function spreadOverlappingNodes(nodes: NormalizedNode[], config: ViewboxConfig): NormalizedNode[] {
  if (nodes.length <= 1) return nodes

  const next = nodes.map((node) => ({ ...node }))
  const repulsionX = config.nodeW * 0.52
  const repulsionY = config.nodeH * 0.74
  const minX = config.padding
  const maxX = config.width - config.padding - config.nodeW
  const minY = config.padding
  const maxY = config.height - config.padding - config.nodeH

  for (let pass = 0; pass < 6; pass += 1) {
    for (let i = 0; i < next.length; i += 1) {
      for (let j = i + 1; j < next.length; j += 1) {
        const dx = next[j].x - next[i].x
        const dy = next[j].y - next[i].y

        if (Math.abs(dx) < repulsionX && Math.abs(dy) < repulsionY) {
          const pushX = (repulsionX - Math.abs(dx)) * 0.08 * (dx >= 0 ? 1 : -1)
          const pushY = (repulsionY - Math.abs(dy)) * 0.11 * (dy >= 0 ? 1 : -1)

          next[i].x = clamp(next[i].x - pushX, minX, maxX)
          next[j].x = clamp(next[j].x + pushX, minX, maxX)
          next[i].y = clamp(next[i].y - pushY, minY, maxY)
          next[j].y = clamp(next[j].y + pushY, minY, maxY)
        }
      }
    }
  }

  return next
}

function normalizeNodes(nodes: N8nTemplateNode[], config: ViewboxConfig, mode: GraphMode): NormalizedNode[] {

  if (nodes.length === 0) return []

  const xs = nodes.map((node) => node.position?.[0] ?? 0)
  const ys = nodes.map((node) => node.position?.[1] ?? 0)

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const rawWidth = Math.max(maxX - minX, 1)
  const rawHeight = Math.max(maxY - minY, 1)
  const padding = config.padding

  const usableWidth = config.width - padding * 2 - config.nodeW
  const usableHeight = config.height - padding * 2 - config.nodeH

  const normalized = nodes.map((node) => {
    const x = ((node.position?.[0] ?? 0) - minX) / rawWidth
    const y = ((node.position?.[1] ?? 0) - minY) / rawHeight

    return {
      ...node,
      x: padding + x * usableWidth,
      y: padding + y * usableHeight,
    }
  })

  if (mode === 'thumbnail' && nodes.length > 8) {
    return spreadOverlappingNodes(normalized, config)
  }

  return normalized
}

function makeConnectionPath(
  source: { x: number; y: number },
  target: { x: number; y: number },
  nodeW: number,
  nodeH: number
): string {
  const sx = source.x + nodeW
  const sy = source.y + nodeH / 2
  const tx = target.x
  const ty = target.y + nodeH / 2

  const distanceX = tx - sx
  const direction = distanceX >= 0 ? 1 : -1
  const bend = Math.max(24, Math.abs(distanceX) * 0.38)
  const c1x = sx + bend * direction
  const c1y = sy
  const c2x = tx - bend * direction
  const c2y = ty

  return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`
}

function getNodeMetrics(nodes: NormalizedNode[], connections: N8nTemplateConnection[]) {
  const metrics = new Map<string, { incoming: number; outgoing: number }>()
  nodes.forEach((node) => {
    metrics.set(node.name, { incoming: 0, outgoing: 0 })
  })

  connections.forEach((connection) => {
    const source = metrics.get(connection.from)
    if (source) source.outgoing += 1

    const target = metrics.get(connection.to)
    if (target) target.incoming += 1
  })

  return metrics
}

function getKeyNodes(
  nodes: NormalizedNode[],
  connections: N8nTemplateConnection[],
  mode: GraphMode,
  maxLabels: number
): KeyNode[] {
  const metrics = getNodeMetrics(nodes, connections)

  const ranked = nodes
    .map((node) => {
      const nodeType = node.type.toLowerCase()
      const nodeName = node.name.toLowerCase()
      const stats = metrics.get(node.name) || { incoming: 0, outgoing: 0 }
      const degree = stats.incoming + stats.outgoing

      const isTrigger = nodeType.includes('trigger') || nodeType.includes('webhook') || nodeName.includes('trigger')
      const isAI = AI_TOKENS.some((token) => nodeType.includes(token))
      const isServiceNode = SERVICE_TOKENS.some(([token]) => nodeType.includes(token.toLowerCase()) || nodeName.includes(token.toLowerCase()))
      const isSink = stats.outgoing === 0
      const isBranch = stats.outgoing > 1 || stats.incoming > 1
      const isGenericTransform = /\b(set|if|switch|merge|wait)\b/.test(nodeName)

      let score = degree * 4
      if (isTrigger) score += 64
      if (isSink) score += 22
      if (isBranch) score += 14
      if (isAI) score += 16
      if (isServiceNode) score += 20
      if (isGenericTransform) score -= 8

      const service = deriveServiceLabel(node)
      const action = deriveActionLabel(node.name, service)
      const maxLabelLength = mode === 'thumbnail' ? 30 : 40
      const label = truncateLabel(`${service}: ${action}`, maxLabelLength)

      return { node, label, score }
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.node.x - b.node.x
    })

  const selected: KeyNode[] = []
  const usedLabels = new Set<string>()

  for (const candidate of ranked) {
    if (selected.length >= maxLabels) break
    if (usedLabels.has(candidate.label)) continue

    if (
      mode === 'thumbnail' &&
      selected.some(
        (chosen) =>
          Math.abs(chosen.node.x - candidate.node.x) < 34 &&
          Math.abs(chosen.node.y - candidate.node.y) < 26
      )
    ) {
      continue
    }

    selected.push(candidate)
    usedLabels.add(candidate.label)
  }

  return selected
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function placeLabels(
  keyNodes: KeyNode[],
  mode: GraphMode,
  config: ViewboxConfig
): LabelPlacement[] {
  const labels: LabelPlacement[] = []
  const fontSize = mode === 'thumbnail' ? 7.4 : 10.8
  const labelHeight = mode === 'thumbnail' ? 12 : 17
  const padX = mode === 'thumbnail' ? 4 : 7
  const minGap = mode === 'thumbnail' ? 3 : 6
  const maxWidth = mode === 'thumbnail' ? 104 : 225

  const sortedByY = [...keyNodes].sort((a, b) => a.node.y - b.node.y)

  for (const item of sortedByY) {
    const estimatedWidth = clamp(item.label.length * fontSize * 0.56 + padX * 2, 40, maxWidth)
    let side: 'left' | 'right' = item.node.x > config.width * 0.62 ? 'left' : 'right'
    let x =
      side === 'right'
        ? item.node.x + config.nodeW + minGap
        : item.node.x - estimatedWidth - minGap

    if (x + estimatedWidth > config.width - 4) {
      side = 'left'
      x = item.node.x - estimatedWidth - minGap
    }
    if (x < 4) {
      side = 'right'
      x = item.node.x + config.nodeW + minGap
    }

    x = clamp(x, 4, config.width - estimatedWidth - 4)
    let y = clamp(item.node.y + config.nodeH / 2 - labelHeight / 2, 3, config.height - labelHeight - 3)
    let safety = 0

    while (
      labels.some(
        (placed) =>
          placed.side === side &&
          Math.abs(placed.y - y) < labelHeight + 1 &&
          Math.abs(placed.x - x) < (placed.width + estimatedWidth) / 2
      ) &&
      safety < 20
    ) {
      y += labelHeight + minGap
      if (y > config.height - labelHeight - 3) {
        y = clamp(item.node.y - labelHeight - minGap, 3, config.height - labelHeight - 3)
      }
      safety += 1
    }

    labels.push({
      nodeId: item.node.id,
      label: item.label,
      x,
      y,
      width: estimatedWidth,
      height: labelHeight,
      side,
      nodeAnchorX: item.node.x + config.nodeW / 2,
      nodeAnchorY: item.node.y + config.nodeH / 2,
    })
  }

  return labels
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  return prefersReducedMotion
}

function useScrollActivity(enabled: boolean) {
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const onScroll = () => {
      setIsScrolling(true)
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setIsScrolling(false), 140)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [enabled])

  return isScrolling
}

export function N8nNodeGraph({
  nodes,
  connections,
  mode = 'thumbnail',
  className,
}: N8nNodeGraphProps) {
  const config = useMemo(() => getGraphConfig(mode, nodes.length), [mode, nodes.length])
  const normalized = useMemo(() => normalizeNodes(nodes, config, mode), [nodes, config, mode])
  const nodeByName = useMemo(() => new Map(normalized.map((node) => [node.name, node])), [normalized])
  const maxLabels = mode === 'full' ? 6 : nodes.length >= 18 ? 2 : nodes.length >= 12 ? 3 : 4
  const keyNodes = useMemo(
    () => getKeyNodes(normalized, connections, mode, maxLabels),
    [normalized, connections, mode, maxLabels]
  )
  const showInlineLabels = mode === 'full'
  const labelPlacements = useMemo(
    () => (showInlineLabels ? placeLabels(keyNodes, mode, config) : []),
    [showInlineLabels, keyNodes, mode, config]
  )
  const thumbnailLegend = useMemo(
    () => (mode === 'thumbnail' ? keyNodes.slice(0, maxLabels) : []),
    [mode, keyNodes, maxLabels]
  )
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [isInViewport, setIsInViewport] = useState(mode === 'full')
  const prefersReducedMotion = usePrefersReducedMotion()
  const isScrolling = useScrollActivity(mode === 'thumbnail')
  const idBase = useId().replace(/:/g, '')
  const markerId = `${idBase}-${mode}-arrow`

  useEffect(() => {
    if (mode === 'full') {
      setIsInViewport(true)
      return
    }

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setIsInViewport(true)
      return
    }

    const element = svgRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        setIsInViewport(entries[0]?.isIntersecting ?? false)
      },
      { rootMargin: '120px 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [mode])

  const shouldAnimate = !prefersReducedMotion && isInViewport && !isScrolling
  const animatedConnectionCount = shouldAnimate ? (mode === 'thumbnail' ? connections.length : Math.min(connections.length, 8)) : 0

  if (normalized.length === 0) {
    return (
      <div
        className={cn(
          'flex h-full min-h-[120px] w-full items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground',
          className
        )}
      >
        No graph data
      </div>
    )
  }

  return (
    <svg
      ref={svgRef}
      className={cn('h-full w-full rounded-lg border border-border/70 bg-background/70', className)}
      viewBox={`0 0 ${config.width} ${config.height}`}
      role="img"
      aria-label="n8n workflow node graph"
    >
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 8 4 L 0 8 z" fill="hsl(var(--muted-foreground))" fillOpacity="0.55" />
        </marker>
      </defs>

      {connections.map((connection, index) => {
        const source = nodeByName.get(connection.from)
        const target = nodeByName.get(connection.to)
        if (!source || !target) return null

        const path = makeConnectionPath(source, target, config.nodeW, config.nodeH)

        return (
          <g key={`${connection.from}-${connection.to}-${index}`}>
            <path
              d={path}
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={mode === 'thumbnail' ? 0.52 : 0.44}
              strokeWidth={mode === 'thumbnail' ? 1.6 : 2.1}
              markerEnd={mode === 'full' ? `url(#${markerId})` : undefined}
            />
            {index < animatedConnectionCount && (
              <path
                d={path}
                fill="none"
                stroke="hsl(var(--background))"
                strokeWidth={mode === 'thumbnail' ? 2.3 : 2.8}
                strokeOpacity={0.96}
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={mode === 'thumbnail' ? '9 91' : '8 92'}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;-100"
                  dur={mode === 'thumbnail' ? '1.25s' : '1.65s'}
                  begin={`${(index % 4) * 0.16}s`}
                  repeatCount="indefinite"
                />
              </path>
            )}
          </g>
        )
      })}

      {normalized.map((node) => (
        <g key={node.id}>
          <rect
            x={node.x}
            y={node.y}
            width={config.nodeW}
            height={config.nodeH}
            rx={mode === 'thumbnail' ? 6 : 10}
            fill={getNodeColor(node.type)}
            fillOpacity={mode === 'thumbnail' ? 0.18 : 0.17}
            stroke={getNodeColor(node.type)}
            strokeOpacity={mode === 'thumbnail' ? 0.95 : 0.85}
            strokeWidth={mode === 'thumbnail' ? 1.2 : 1.5}
          />
          <circle
            cx={node.x + (mode === 'thumbnail' ? 8 : 10)}
            cy={node.y + config.nodeH / 2}
            r={mode === 'thumbnail' ? Math.max(1.6, config.nodeH * 0.17) : 3}
            fill={getNodeColor(node.type)}
            fillOpacity={mode === 'thumbnail' ? 0.95 : 0.82}
          />

          {mode === 'full' && (
            <>
              <text
                x={node.x + 18}
                y={node.y + 20}
                fontSize="11"
                className="fill-foreground"
              >
                {node.name.length > 18 ? `${node.name.slice(0, 18)}...` : node.name}
              </text>
              <text
                x={node.x + 18}
                y={node.y + 34}
                fontSize="9"
                className="fill-muted-foreground"
              >
                {node.type.split('.').pop()}
              </text>
            </>
          )}
        </g>
      ))}

      {labelPlacements.map((label) => {
        const labelAnchorX = label.side === 'right' ? label.x : label.x + label.width
        const labelAnchorY = label.y + label.height / 2
        const textAnchor = label.side === 'right' ? 'start' : 'end'
        const textX = label.side === 'right' ? label.x + (mode === 'thumbnail' ? 4 : 7) : label.x + label.width - (mode === 'thumbnail' ? 4 : 7)

        return (
          <g key={`${label.nodeId}-${label.label}`}>
            <path
              d={`M ${label.nodeAnchorX} ${label.nodeAnchorY} L ${labelAnchorX} ${labelAnchorY}`}
              fill="none"
              stroke="hsl(var(--border))"
              strokeOpacity={mode === 'thumbnail' ? 0.75 : 0.62}
              strokeWidth={mode === 'thumbnail' ? 0.85 : 1.15}
            />
            <rect
              x={label.x}
              y={label.y}
              width={label.width}
              height={label.height}
              rx={mode === 'thumbnail' ? 3 : 6}
              fill="hsl(var(--background))"
              fillOpacity={0.94}
              stroke="hsl(var(--border))"
              strokeOpacity={0.9}
            />
            <text
              x={textX}
              y={label.y + label.height / 2 + (mode === 'thumbnail' ? 2.1 : 3.3)}
              fontSize={mode === 'thumbnail' ? 6.8 : 10}
              className="fill-foreground"
              textAnchor={textAnchor}
            >
              {label.label}
            </text>
          </g>
        )
      })}

      {mode === 'thumbnail' && thumbnailLegend.length > 0 && (
        <g>
          <rect
            x={5}
            y={config.height - 10 - thumbnailLegend.length * 12}
            width={config.width - 10}
            height={thumbnailLegend.length * 12 + 5}
            rx={6}
            fill="hsl(var(--background))"
            fillOpacity={0.78}
          />
          {thumbnailLegend.map((item, idx) => (
            <text
              key={`${item.node.id}-legend`}
              x={10}
              y={config.height - 10 - (thumbnailLegend.length - idx - 1) * 12}
              fontSize={6.8}
              className="fill-foreground"
            >
              {truncateLabel(item.label, 34)}
            </text>
          ))}
        </g>
      )}
    </svg>
  )
}
