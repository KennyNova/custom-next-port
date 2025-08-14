'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Github, 
  ExternalLink, 
  ArrowLeft, 
  Star, 
  GitFork, 
  Eye, 
  Calendar,
  Code2,
  Download,
  Share2,
  Heart,
  Zap,
  Users,
  FileText,
  Monitor,
  Smartphone,
  Tablet,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Copy,
  Check
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/types'

interface GitHubStats {
  stars: number
  forks: number
  watchers: number
  language: string
  size: number
  openIssues: number
  lastCommit: string
  createdAt: string
  updatedAt: string
}

interface ProjectPageData extends Project {
  readme?: string
  stats?: GitHubStats
  languages?: Record<string, number>
  commits?: number
  contributors?: number
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [project, setProject] = useState<ProjectPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // First get the basic project data
        const projectResponse = await fetch('/api/projects')
        if (!projectResponse.ok) {
          throw new Error(`Failed to fetch projects: ${projectResponse.status}`)
        }
        
        const projectData = await projectResponse.json()
        const foundProject = projectData.projects.find((p: Project) => p.slug === slug)
        
        if (!foundProject) {
          throw new Error('Project not found')
        }

        // If it's a GitHub project, fetch additional data
        if (foundProject.type === 'github' && foundProject.links.github) {
          const repoUrl = foundProject.links.github
          const [, , , owner, repo] = repoUrl.split('/')
          
          try {
            // Fetch README and stats in parallel
            const [readmeRes, statsRes, languagesRes] = await Promise.all([
              fetch(`/api/projects/${slug}/readme`),
              fetch(`/api/projects/${slug}/stats`),
              fetch(`/api/projects/${slug}/languages`)
            ])

            const readme = readmeRes.ok ? await readmeRes.text() : null
            const stats = statsRes.ok ? await statsRes.json() : null
            const languages = languagesRes.ok ? await languagesRes.json() : null

            setProject({
              ...foundProject,
              readme,
              stats,
              languages
            })
          } catch (err) {
            console.warn('Failed to fetch GitHub data:', err)
            setProject(foundProject)
          }
        } else {
          setProject(foundProject)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch project')
        console.error('Error fetching project:', err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProject()
    }
  }, [slug])

  const shareProject = async () => {
    try {
      await navigator.share({
        title: project?.title,
        text: project?.description,
        url: window.location.href,
      })
    } catch (err) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const getPreviewDimensions = () => {
    switch (previewDevice) {
      case 'mobile':
        return { width: '375px', height: '667px' }
      case 'tablet':
        return { width: '768px', height: '1024px' }
      default:
        return { width: '100%', height: '600px' }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading project...</span>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'The project you\'re looking for doesn\'t exist.'}</p>
          <Button onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </motion.div>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  {project.type === 'github' && <Github className="h-8 w-8 text-primary" />}
                  {project.type === 'homelab' && <Code2 className="h-8 w-8 text-primary" />}
                  {project.type === 'photography' && <Eye className="h-8 w-8 text-primary" />}
                  {project.type === 'other' && <Zap className="h-8 w-8 text-primary" />}
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{project.title}</h1>
                  <p className="text-lg text-muted-foreground mt-1">{project.description}</p>
                </div>
              </div>

              {/* Technology Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="px-3 py-1">
                    {tech}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {project.links.github && (
                  <Button asChild size="lg">
                    <Link href={project.links.github} target="_blank">
                      <Github className="h-5 w-5 mr-2" />
                      View Code
                    </Link>
                  </Button>
                )}
                {project.links.live && (
                  <Button variant="outline" size="lg" asChild>
                    <Link href={project.links.live} target="_blank">
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Live Demo
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="lg" onClick={shareProject}>
                  {copiedLink ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-5 w-5 mr-2" />
                      Share
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setLiked(!liked)}
                  className={liked ? 'text-red-500 border-red-200' : ''}
                >
                  <Heart className={`h-5 w-5 mr-2 ${liked ? 'fill-current' : ''}`} />
                  {liked ? 'Liked' : 'Like'}
                </Button>
              </div>
            </div>

            {/* Stats Card */}
            {project.stats && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="w-full lg:w-80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Github className="h-5 w-5" />
                      Repository Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                          <Star className="h-5 w-5 text-yellow-500" />
                          {project.stats.stars}
                        </div>
                        <div className="text-sm text-muted-foreground">Stars</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                          <GitFork className="h-5 w-5 text-blue-500" />
                          {project.stats.forks}
                        </div>
                        <div className="text-sm text-muted-foreground">Forks</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Language:</span>
                        <span className="font-medium">{project.stats.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span className="font-medium">{Math.round(project.stats.size / 1024)} KB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Issues:</span>
                        <span className="font-medium">{project.stats.openIssues}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">
                          {new Date(project.stats.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Live Preview Section */}
        {project.links.live && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Live Preview
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice('tablet')}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFullPreview(true)}
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div 
                    className="border rounded-lg overflow-hidden shadow-lg bg-white transition-all duration-300"
                    style={getPreviewDimensions()}
                  >
                    <iframe
                      src={project.links.live}
                      className="w-full h-full border-0"
                      title={`${project.title} Preview`}
                      loading="lazy"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Project Gallery */}
        {project.images && project.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={project.images[activeImageIndex]}
                      alt={`${project.title} screenshot ${activeImageIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                    {project.images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute left-2 top-1/2 -translate-y-1/2"
                          onClick={() => setActiveImageIndex(prev => 
                            prev === 0 ? project.images!.length - 1 : prev - 1
                          )}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setActiveImageIndex(prev => 
                            prev === project.images!.length - 1 ? 0 : prev + 1
                          )}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Strip */}
                  {project.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {project.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                            index === activeImageIndex 
                              ? 'border-primary' 
                              : 'border-transparent hover:border-muted-foreground'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* README Section */}
        {project.readme && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: project.readme }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Languages Chart */}
        {project.languages && Object.keys(project.languages).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(project.languages)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 8)
                    .map(([language, percentage]) => (
                      <div key={language} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{language}</span>
                          <span className="text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            className="h-2 rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Full Preview Modal */}
        <AnimatePresence>
          {showFullPreview && project.links.live && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setShowFullPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg overflow-hidden w-full h-full max-w-6xl max-h-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">{project.title} - Full Preview</h3>
                  <Button variant="ghost" onClick={() => setShowFullPreview(false)}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
                <iframe
                  src={project.links.live}
                  className="w-full h-full border-0"
                  title={`${project.title} Full Preview`}
                  style={{ height: 'calc(100% - 64px)' }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}