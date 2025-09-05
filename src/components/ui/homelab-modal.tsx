'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'
import type { HomelabTechnology } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HomelabModalProps {
  technology: HomelabTechnology | null
  isOpen: boolean
  onClose: () => void
}

export function HomelabModal({ technology, isOpen, onClose }: HomelabModalProps) {
  if (!isOpen || !technology) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <div className="mx-auto h-full flex items-center justify-center p-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-background rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${technology.brandColor || 'hsl(var(--primary))'}20` }}>
                    <div className="h-6 w-6 rounded" style={{ backgroundColor: technology.brandColor || 'hsl(var(--primary))' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{technology.name}</h2>
                    <p className="text-xs text-muted-foreground capitalize">{technology.kind}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4 grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">What it is</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{technology.whatItIs}</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Why I chose it</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{technology.whyChosen}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">How it fits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{technology.howItFits}</p>
                    </CardContent>
                  </Card>
                </div>

                {technology.keyDetails?.length ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Key details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {technology.keyDetails.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : null}

                {technology.links?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {technology.links.map((l) => (
                      <Button
                        key={l.url}
                        asChild
                        variant="outline"
                        className="text-sm"
                      >
                        <a href={l.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" /> {l.label}
                        </a>
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


