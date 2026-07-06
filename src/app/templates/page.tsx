'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { N8nNodeGraph } from '@/components/ui/n8n-node-graph'
import { N8nTemplateModal } from '@/components/ui/n8n-template-modal'
import type { N8nTemplateIndexData, N8nTemplateIndexItem } from '@/types'
import { captureEvent } from '@/lib/posthog/client'
import { Filter, Loader2, Search, Sparkles, Workflow } from 'lucide-react'

type NodeSize = 'all' | 'small' | 'medium' | 'large'

function matchesNodeSize(nodeCount: number, nodeSize: NodeSize) {
  if (nodeSize === 'all') return true
  if (nodeSize === 'small') return nodeCount <= 5
  if (nodeSize === 'medium') return nodeCount >= 6 && nodeCount <= 10
  return nodeCount > 10
}

function prettyCategory(category: string): string {
  return category.replace(/_/g, ' ')
}

export default function TemplatesPage() {
  const [indexData, setIndexData] = useState<N8nTemplateIndexData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [nodeSize, setNodeSize] = useState<NodeSize>('all')
  const [onlyAI, setOnlyAI] = useState(false)

  const [activeTemplate, setActiveTemplate] = useState<N8nTemplateIndexItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadTemplateIndex() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/n8n-templates')
        if (!response.ok) {
          throw new Error(`Failed to load templates (${response.status})`)
        }

        const data = (await response.json()) as N8nTemplateIndexData
        if (!isCancelled) {
          setIndexData(data)
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load templates')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadTemplateIndex()

    return () => {
      isCancelled = true
    }
  }, [])

  const templates = indexData?.templates ?? []
  const categories = indexData?.categories ?? []
  const services = indexData?.services ?? []

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return templates.filter((template) => {
      const queryMatch =
        normalizedQuery.length === 0 ||
        template.name.toLowerCase().includes(normalizedQuery) ||
        template.category.toLowerCase().includes(normalizedQuery) ||
        template.services.some((service) => service.toLowerCase().includes(normalizedQuery)) ||
        template.nodeTypes.some((type) => type.toLowerCase().includes(normalizedQuery))

      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(template.category)

      const serviceMatch =
        selectedServices.length === 0 ||
        selectedServices.every((service) => template.services.includes(service))

      const aiMatch = !onlyAI || template.hasAI
      const nodeSizeMatch = matchesNodeSize(template.nodeCount, nodeSize)

      return queryMatch && categoryMatch && serviceMatch && aiMatch && nodeSizeMatch
    })
  }, [templates, query, selectedCategories, selectedServices, onlyAI, nodeSize])

  function toggleCategory(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((value) => value !== category) : [...prev, category]
    )
  }

  function toggleService(service: string) {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((value) => value !== service) : [...prev, service]
    )
  }

  function openTemplate(template: N8nTemplateIndexItem) {
    captureEvent('template_opened', {
      template_id: template.id,
      template_name: template.name,
      category: template.category,
      node_count: template.nodeCount,
      has_ai: template.hasAI,
    })
    setActiveTemplate(template)
    setIsModalOpen(true)
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="space-y-4 text-center"
      >
        <h1 className="text-4xl font-bold md:text-5xl">n8n Templates</h1>
        <p className="mx-auto max-w-3xl text-muted-foreground">
          Search curated workflows, inspect their node graph, customize provider preferences, and download production-ready JSONs.
        </p>
      </motion.div>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="space-y-1 p-4 text-center">
            <Workflow className="mx-auto h-5 w-5 text-primary" />
            <p className="text-2xl font-semibold">{indexData?.stats.totalTemplates ?? 0}</p>
            <p className="text-xs text-muted-foreground">Templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4 text-center">
            <Filter className="mx-auto h-5 w-5 text-primary" />
            <p className="text-2xl font-semibold">{filteredTemplates.length}</p>
            <p className="text-xs text-muted-foreground">Filtered Results</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4 text-center">
            <Sparkles className="mx-auto h-5 w-5 text-primary" />
            <p className="text-2xl font-semibold">{categories.length}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4 text-center">
            <Search className="mx-auto h-5 w-5 text-primary" />
            <p className="text-2xl font-semibold">{services.length}</p>
            <p className="text-xs text-muted-foreground">Service Tags</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by workflow name, category, service, or node type..."
            className="pl-9"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Node Count</p>
            <div className="flex flex-wrap gap-2">
              {(['all', 'small', 'medium', 'large'] as NodeSize[]).map((size) => (
                <Button
                  key={size}
                  variant={nodeSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNodeSize(size)}
                >
                  {size === 'all' ? 'All' : size === 'small' ? 'Small (1-5)' : size === 'medium' ? 'Medium (6-10)' : 'Large (10+)'}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <p className="text-sm font-medium">Category Filters</p>
            <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {prettyCategory(category)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Services</p>
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <Badge
                key={service}
                variant={selectedServices.includes(service) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleService(service)}
              >
                {service}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="only-ai-workflows"
            checked={onlyAI}
            onCheckedChange={(checked) => setOnlyAI(Boolean(checked))}
          />
          <label htmlFor="only-ai-workflows" className="text-sm text-muted-foreground">
            Show only workflows that include AI nodes
          </label>
        </div>
      </section>

      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border p-8 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading n8n templates...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="group flex h-full cursor-pointer flex-col transition hover:-translate-y-1 hover:shadow-lg"
              onClick={() => openTemplate(template)}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-lg">{template.name}</CardTitle>
                  <Badge variant="secondary">{template.nodeCount} nodes</Badge>
                </div>
                <CardDescription className="line-clamp-1">
                  {prettyCategory(template.category)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="h-[140px] w-full rounded-md border bg-muted/20 p-1">
                  <N8nNodeGraph
                    mode="thumbnail"
                    nodes={template.nodes}
                    connections={template.connections}
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.services.slice(0, 5).map((service) => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {template.services.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.services.length - 5}
                    </Badge>
                  )}
                </div>

                <Button className="w-full" variant="outline">
                  Open Workflow
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {!isLoading && !error && filteredTemplates.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <h3 className="text-lg font-semibold">No templates match your filters</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try clearing some filters or searching with broader terms.
          </p>
        </div>
      )}

      <N8nTemplateModal
        template={activeTemplate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}