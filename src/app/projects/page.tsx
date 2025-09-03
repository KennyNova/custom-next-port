'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProjectGridSkeleton } from '@/components/ui/project-card-skeleton'
import { usePreload } from '@/lib/hooks/use-preload'
import { Github, ExternalLink, Code2, Home, Camera, Wrench, Loader2, Video } from 'lucide-react'
import Link from 'next/link'
import type { Project } from '@/types'

const projectTypes = [
  { id: 'all', name: 'All Projects', icon: Code2 },
  { id: 'github', name: 'GitHub Projects', icon: Github },
  { id: 'homelab', name: 'Home Lab', icon: Home },
  { id: 'photography', name: 'Photography', icon: Camera },
  { id: 'videography', name: 'Videography', icon: Video },
  { id: 'other', name: 'Other Projects', icon: Wrench },
]

const orientationOptions = [
  { id: 'all', name: 'All Orientations' },
  { id: 'vertical', name: 'Vertical' },
  { id: 'horizontal', name: 'Horizontal' },
]

// Project Card Component with Preloading
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const router = useRouter()
  const { startPreload, cancelPreload, cancelAllPreloads } = usePreload()

  const handleMouseEnter = () => {
    startPreload(`/projects/${project.slug}`)
  }

  const handleMouseLeave = () => {
    cancelPreload(`/projects/${project.slug}`)
  }

  const handleClick = () => {
    cancelAllPreloads()
    router.push(`/projects/${project.slug}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card 
        className="h-full hover:shadow-lg transition-shadow cursor-pointer" 
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {project.type === 'github' && <Github className="h-5 w-5" />}
            {project.type === 'homelab' && <Home className="h-5 w-5" />}
            {project.type === 'photography' && <Camera className="h-5 w-5" />}
            {project.type === 'videography' && <Video className="h-5 w-5" />}
            {project.type === 'other' && <Wrench className="h-5 w-5" />}
            {project.title}
          </CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.type === 'videography' && project.orientation && (
              <span
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
              >
                {project.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}
              </span>
            )}
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            {project.links.github && (
              <Button variant="outline" size="sm" asChild>
                <Link href={project.links.github} target="_blank">
                  <Github className="h-4 w-4 mr-2" />
                  Code
                </Link>
              </Button>
            )}
            {project.links.live && (
              <Button size="sm" asChild>
                <Link href={project.links.live} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Live Demo
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedOrientation, setSelectedOrientation] = useState<'all' | 'vertical' | 'horizontal'>('all')
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({})
  const [showLeftBlur, setShowLeftBlur] = useState(false)
  const [showRightBlur, setShowRightBlur] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/projects')
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`)
        }
        
        const data = await response.json()
        setProjects(data.projects || [])
        
        // Calculate project counts by type
        const counts = data.projects.reduce((acc: Record<string, number>, project: Project) => {
          acc[project.type] = (acc[project.type] || 0) + 1
          acc.all = (acc.all || 0) + 1
          return acc
        }, {})
        
        setProjectCounts(counts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects')
        console.error('Error fetching projects:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Handle scroll position to show/hide blur gradients
  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    const isAtStart = scrollLeft <= 5 // Small threshold for precision
    const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 5 // Small threshold for precision

    setShowLeftBlur(!isAtStart)
    setShowRightBlur(!isAtEnd)
  }

  // Set up scroll and resize listeners
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Initial check
    handleScroll()

    container.addEventListener('scroll', handleScroll, { passive: true })

    const handleResize = () => {
      // Recompute after resize
      handleScroll()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [projects])

  // Filter projects based on selected type and orientation (when videography)
  const filteredByType = selectedType === 'all' 
    ? projects 
    : projects.filter(project => project.type === selectedType)

  const filteredProjects = selectedType === 'videography' && selectedOrientation !== 'all'
    ? filteredByType.filter(project => project.orientation === selectedOrientation)
    : filteredByType

  const featuredProjects = filteredProjects.filter(project => project.featured)

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Projects</h1>
          <p className="text-red-500 mb-4">Error loading projects: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold mb-4">Projects</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore my professional work, personal projects, and creative endeavors across different technologies and domains.
        </p>
      </motion.div>

      {/* Project Types Carousel */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-6">Project Categories</h2>
        
        {/* Horizontal scrollable carousel with blur edges */}
        <div className="relative">
          {/* Left blur gradient */}
          <div 
            className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
              showLeftBlur ? 'opacity-100' : 'opacity-0'
            }`} 
          />
          
          {/* Right blur gradient */}
          <div 
            className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
              showRightBlur ? 'opacity-100' : 'opacity-0'
            }`} 
          />
          
          {/* Scrollable container with extra padding for hover animations */}
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide py-2"
          >
            <div className="flex gap-4 pb-2 min-w-max px-2">
              {projectTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="flex-shrink-0"
                >
                  <Card 
                    className={`w-48 text-center cursor-pointer hover:shadow-lg transition-all duration-300 ${
                      selectedType === type.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedType(type.id)
                      if (type.id !== 'videography') {
                        setSelectedOrientation('all')
                      }
                    }}
                  >
                    <CardHeader className="pb-4">
                      <type.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                      <CardDescription>
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          `${projectCounts[type.id] || 0} projects`
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Orientation filter for videography */}
        {selectedType === 'videography' && (
          <motion.div 
            className="mt-6 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {orientationOptions.map(option => (
              <Button
                key={option.id}
                variant={selectedOrientation === (option.id as any) ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedOrientation(option.id as any)}
              >
                {option.name}
              </Button>
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* Loading State */}
      {loading && (
        <motion.section
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
          <ProjectGridSkeleton count={3} />
          
          <h2 className="text-2xl font-bold mb-6 mt-12">All Projects</h2>
          <ProjectGridSkeleton count={6} />
        </motion.section>
      )}

      {/* Featured Projects */}
      {!loading && featuredProjects.length > 0 && (
        <motion.section
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project, index) => (
              <ProjectCard key={project._id.toString()} project={project} index={index} />
            ))}
          </div>
        </motion.section>
      )}

      {/* All Projects */}
      {!loading && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-6">
            {selectedType === 'all' ? 'All Projects' : `${projectTypes.find(t => t.id === selectedType)?.name || 'Projects'}`}
          </h2>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects found in this category.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project._id.toString()} project={project} index={index} />
              ))}
            </div>
          )}
        </motion.section>
      )}
    </div>
  )
}