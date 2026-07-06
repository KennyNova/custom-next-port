'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { N8nNodeGraph } from '@/components/ui/n8n-node-graph'
import {
  applyTemplatePreferences,
  getDetectedPreferences,
  getPreferenceQuestions,
  type N8nPreferenceKey,
} from '@/lib/n8n-swap-rules'
import type { N8nTemplateIndexItem, N8nWorkflowTemplate } from '@/types'
import { captureEvent } from '@/lib/posthog/client'
import { Download, Loader2, X } from 'lucide-react'

const STORAGE_KEY = 'n8n-template-preferences'

interface N8nTemplateModalProps {
  template: N8nTemplateIndexItem | null
  isOpen: boolean
  onClose: () => void
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function N8nTemplateModal({ template, isOpen, onClose }: N8nTemplateModalProps) {
  const [templateJson, setTemplateJson] = useState<N8nWorkflowTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<Partial<Record<N8nPreferenceKey, string>>>({})

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = 'auto'
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    const templateId = template?.id
    if (!isOpen || !templateId) return

    let isCancelled = false

    async function loadTemplate() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/n8n-templates/${templateId}.json`)
        if (!response.ok) {
          throw new Error(`Failed to load template (${response.status})`)
        }

        const data = (await response.json()) as N8nWorkflowTemplate
        if (isCancelled) return

        setTemplateJson(data)

        const storedRaw = localStorage.getItem(STORAGE_KEY)
        const stored = storedRaw ? (JSON.parse(storedRaw) as Partial<Record<N8nPreferenceKey, string>>) : {}
        const detected = getDetectedPreferences(data)
        setPreferences({ ...detected, ...stored })
      } catch (loadError) {
        if (isCancelled) return
        setError(loadError instanceof Error ? loadError.message : 'Could not load template')
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    loadTemplate()

    return () => {
      isCancelled = true
    }
  }, [isOpen, template?.id])

  const questions = useMemo(() => {
    if (!templateJson) return []
    return getPreferenceQuestions(templateJson)
  }, [templateJson])

  const transformedTemplate = useMemo(() => {
    if (!templateJson) return null
    return applyTemplatePreferences(templateJson, preferences)
  }, [templateJson, preferences])

  function handlePreferenceChange(key: N8nPreferenceKey, value: string) {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function handleDownload() {
    if (!transformedTemplate || !template) return
    captureEvent('template_downloaded', {
      template_id: template.id,
      template_name: template.name,
      category: template.category,
      node_count: template.nodeCount,
      preference_count: Object.keys(preferences).length,
    })
    downloadJson(`${template.id}.json`, transformedTemplate)
  }

  if (!isOpen || !template) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <div className="mx-auto flex h-full items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              className="flex h-full w-full flex-col overflow-hidden bg-background shadow-2xl sm:h-[94vh] sm:max-w-6xl sm:rounded-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b p-4 sm:p-6">
                <div>
                  <h2 className="text-2xl font-bold">{template.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Category: {template.category.replace(/_/g, ' ')} • {template.nodeCount} nodes
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {template.services.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 sm:grid-cols-[2fr_1fr] sm:p-6">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-3">
                      <div className="h-[340px] w-full sm:h-[420px]">
                        <N8nNodeGraph
                          mode="full"
                          nodes={template.nodes}
                          connections={template.connections}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="space-y-4 p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Preferences
                      </h3>

                      {loading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading template...
                        </div>
                      )}

                      {error && <p className="text-sm text-destructive">{error}</p>}

                      {!loading && !error && questions.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          This template does not expose provider-specific swap rules.
                        </p>
                      )}

                      {!loading &&
                        !error &&
                        questions.map((question) => (
                          <div key={question.key} className="space-y-2">
                            <p className="text-sm font-medium">{question.question}</p>
                            <RadioGroup
                              value={preferences[question.key] || ''}
                              onValueChange={(value) => handlePreferenceChange(question.key, value)}
                            >
                              {question.options.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option.value} id={`${question.key}-${option.value}`} />
                                  <Label htmlFor={`${question.key}-${option.value}`}>{option.label}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="space-y-3 p-4">
                      <Button className="w-full" onClick={handleDownload} disabled={!transformedTemplate || loading}>
                        <Download className="mr-2 h-4 w-4" />
                        Download JSON
                      </Button>
                      <Button className="w-full" variant="secondary" asChild>
                        <Link href={`/templates/${template.id}/learn`}>
                          Learn how to use this workflow for free
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
