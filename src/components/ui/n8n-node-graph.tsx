'use client'

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

const VIEWBOX = {
  thumbnail: { width: 240, height: 140, nodeW: 34, nodeH: 14 },
  full: { width: 1000, height: 600, nodeW: 120, nodeH: 42 },
} as const

function getNodeColor(nodeType: string): string {
  const normalized = nodeType.toLowerCase()

  if (normalized.includes('webhook') || normalized.includes('trigger')) return '#22c55e'
  if (normalized.includes('langchain') || normalized.includes('openai') || normalized.includes('anthropic') || normalized.includes('cohere')) return '#a855f7'
  if (normalized.includes('slack') || normalized.includes('gmail') || normalized.includes('sheets') || normalized.includes('notion')) return '#3b82f6'
  if (normalized.includes('vectorstore') || normalized.includes('pinecone') || normalized.includes('supabase')) return '#14b8a6'

  return '#64748b'
}

function normalizeNodes(nodes: N8nTemplateNode[], mode: GraphMode): NormalizedNode[] {
  const config = VIEWBOX[mode]

  if (nodes.length === 0) return []

  const xs = nodes.map((node) => node.position?.[0] ?? 0)
  const ys = nodes.map((node) => node.position?.[1] ?? 0)

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const rawWidth = Math.max(maxX - minX, 1)
  const rawHeight = Math.max(maxY - minY, 1)
  const padding = mode === 'thumbnail' ? 10 : 32

  const usableWidth = config.width - padding * 2 - config.nodeW
  const usableHeight = config.height - padding * 2 - config.nodeH

  return nodes.map((node) => {
    const x = ((node.position?.[0] ?? 0) - minX) / rawWidth
    const y = ((node.position?.[1] ?? 0) - minY) / rawHeight

    return {
      ...node,
      x: padding + x * usableWidth,
      y: padding + y * usableHeight,
    }
  })
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

  const dx = Math.max(20, (tx - sx) * 0.5)
  const c1x = sx + dx
  const c1y = sy
  const c2x = tx - dx
  const c2y = ty

  return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`
}

export function N8nNodeGraph({
  nodes,
  connections,
  mode = 'thumbnail',
  className,
}: N8nNodeGraphProps) {
  const config = VIEWBOX[mode]
  const normalized = normalizeNodes(nodes, mode)
  const nodeByName = new Map(normalized.map((node) => [node.name, node]))

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
      className={cn('h-full w-full rounded-md border bg-background/40', className)}
      viewBox={`0 0 ${config.width} ${config.height}`}
      role="img"
      aria-label="n8n workflow node graph"
    >
      <defs>
        <marker
          id={`arrow-${mode}`}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 8 4 L 0 8 z" fill="currentColor" />
        </marker>
      </defs>

      {connections.map((connection, index) => {
        const source = nodeByName.get(connection.from)
        const target = nodeByName.get(connection.to)
        if (!source || !target) return null

        return (
          <path
            key={`${connection.from}-${connection.to}-${index}`}
            d={makeConnectionPath(source, target, config.nodeW, config.nodeH)}
            fill="none"
            stroke="currentColor"
            strokeWidth={mode === 'thumbnail' ? 1.2 : 1.8}
            className="text-muted-foreground/50"
            markerEnd={mode === 'full' ? `url(#arrow-${mode})` : undefined}
          />
        )
      })}

      {normalized.map((node) => (
        <g key={node.id}>
          <rect
            x={node.x}
            y={node.y}
            width={config.nodeW}
            height={config.nodeH}
            rx={mode === 'thumbnail' ? 4 : 8}
            fill={getNodeColor(node.type)}
            fillOpacity={mode === 'thumbnail' ? 0.85 : 0.24}
            stroke={getNodeColor(node.type)}
            strokeWidth={mode === 'thumbnail' ? 0.8 : 1.4}
          />

          {mode === 'full' && (
            <>
              <text
                x={node.x + 8}
                y={node.y + 18}
                fontSize="11"
                className="fill-foreground"
              >
                {node.name.length > 18 ? `${node.name.slice(0, 18)}...` : node.name}
              </text>
              <text
                x={node.x + 8}
                y={node.y + 32}
                fontSize="9"
                className="fill-muted-foreground"
              >
                {node.type.split('.').pop()}
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  )
}
