'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, ExternalLink, Server, Box, Layers, Globe, Home, Monitor, Cloud, Film, Code, FileText, 
  Shield, Settings, Tv, Play, Search, Database, Music, Book, Download, 
  Gamepad2, Disc, GitBranch, Workflow, Code2, Container, ScrollText, Brain, 
  RefreshCw, StickyNote, BookOpen, Library, DollarSign, Receipt, 
  TrendingUp, ShieldCheck, Route, KeyRound, Network, Activity, BarChart3, 
  Cpu, Zap, Blocks, CloudCog, Image, Building, Calendar
} from 'lucide-react'
import type { HomelabNode, HomelabTechnology } from '@/types'
import { getHomelabTechnologyBySlug } from '@/lib/homelab-data'

// Icon mapping
const iconMap: Record<string, any> = {
  Server, Box, Layers, Globe, Home, Monitor, Cloud, Film, Code, FileText,
  Shield, Settings, Tv, Play, Search, Database, Music, Book, Download,
  Gamepad2, Disc, GitBranch, Workflow, Code2, Container, ScrollText, Brain,
  RefreshCw, StickyNote, BookOpen, Library, DollarSign, Receipt,
  TrendingUp, ShieldCheck, Route, KeyRound, Network, Activity, BarChart3,
  Cpu, Zap, Blocks, CloudCog, Image, Building, Calendar
}

interface FlowchartNodeModalProps {
  node: HomelabNode | null
  isOpen: boolean
  onClose: () => void
}

export function FlowchartNodeModal({ node, isOpen, onClose }: FlowchartNodeModalProps) {
  const [technology, setTechnology] = useState<HomelabTechnology | null>(null)

  // Get detailed technology information if available
  useEffect(() => {
    if (node) {
      // Try to find technology data by node ID or name
      const techData = getHomelabTechnologyBySlug(node.id) || 
                      getHomelabTechnologyBySlug(node.name.toLowerCase().replace(/\s+/g, '-'))
      setTechnology(techData || null)
    } else {
      setTechnology(null)
    }
  }, [node])

  if (!node) return null

  const Icon = iconMap[node.icon] || Settings

  // Get type-specific styling
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'hardware':
        return { bgColor: 'bg-gray-50 dark:bg-gray-900', textColor: 'text-gray-700 dark:text-gray-300', label: 'Hardware' }
      case 'hypervisor':
        return { bgColor: 'bg-orange-50 dark:bg-orange-900/20', textColor: 'text-orange-700 dark:text-orange-300', label: 'Hypervisor' }
      case 'vm':
        return { bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-300', label: 'Virtual Machine' }
      case 'service':
        return { bgColor: 'bg-green-50 dark:bg-green-900/20', textColor: 'text-green-700 dark:text-green-300', label: 'Service' }
      case 'app':
        return { bgColor: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-700 dark:text-purple-300', label: 'Application' }
      default:
        return { bgColor: 'bg-gray-50 dark:bg-gray-900', textColor: 'text-gray-700 dark:text-gray-300', label: 'Component' }
    }
  }

  const typeInfo = getTypeInfo(node.type)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-hidden"
          >
            <Card className="h-full overflow-hidden flex flex-col">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${node.color}20`, color: node.color }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{node.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={`${typeInfo.bgColor} ${typeInfo.textColor} border-0`}>
                          {typeInfo.label}
                        </Badge>
                        {technology && (
                          <Badge variant="outline">
                            {technology.kind}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Basic Description */}
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{node.description}</p>
                  </div>

                  {technology ? (
                    <>
                      {/* What It Is */}
                      <div>
                        <h3 className="font-semibold mb-2">What It Is</h3>
                        <p className="text-muted-foreground">{technology.whatItIs}</p>
                      </div>

                      {/* Why Chosen */}
                      <div>
                        <h3 className="font-semibold mb-2">Why This Technology</h3>
                        <p className="text-muted-foreground">{technology.whyChosen}</p>
                      </div>

                      {/* What It Replaces */}
                      {technology.replaces && (
                        <div>
                          <h3 className="font-semibold mb-2">Replaces</h3>
                          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                            <p className="text-orange-800 dark:text-orange-200 text-sm">
                              🔄 {technology.replaces}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* How It Fits */}
                      <div>
                        <h3 className="font-semibold mb-2">Role in Homelab</h3>
                        <p className="text-muted-foreground">{technology.howItFits}</p>
                      </div>

                      {/* Key Features */}
                      {technology.keyDetails && technology.keyDetails.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Key Features</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {technology.keyDetails.map((detail, index) => (
                              <div 
                                key={index}
                                className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="text-sm">{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Links */}
                      {technology.links && technology.links.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Resources</h3>
                          <div className="flex flex-wrap gap-2">
                            {technology.links.map((link, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  {link.label}
                                </a>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Fallback for nodes without detailed technology data */
                    <div className="text-center py-8">
                      <div className="text-muted-foreground mb-4">
                        <Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>This component is part of the homelab infrastructure.</p>
                        <p className="text-sm mt-2">
                          Detailed information is not yet available for this node.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Technical Details */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Technical Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <span className="ml-2 text-muted-foreground">{typeInfo.label}</span>
                      </div>
                      <div>
                        <span className="font-medium">Component ID:</span>
                        <span className="ml-2 text-muted-foreground font-mono">{node.id}</span>
                      </div>
                      {node.category && (
                        <div>
                          <span className="font-medium">Category:</span>
                          <span className="ml-2 text-muted-foreground">{node.category}</span>
                        </div>
                      )}
                      {node.url && (
                        <div className="md:col-span-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={node.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Access Service
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
