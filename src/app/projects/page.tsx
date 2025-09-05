	'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProjectGridSkeleton } from '@/components/ui/project-card-skeleton'
import { VideoCard, VideoGridSkeleton } from '@/components/ui/video-card'
import { VideoModal } from '@/components/ui/video-modal'
import { usePreload } from '@/lib/hooks/use-preload'
import { Github, ExternalLink, Code2, Home, Camera, Wrench, Loader2, Video, Cpu, MemoryStick, HardDrive, Server, Monitor } from 'lucide-react'
import Link from 'next/link'
import type { Project } from '@/types'
import { HomelabGrid } from '@/components/ui/homelab-grid'
import { HomelabModal } from '@/components/ui/homelab-modal'
import { InteractiveHomelabFlowchart } from '@/components/ui/interactive-homelab-flowchart'
import { getHomelabTechnologies, getHomelabHardware, getHomelabNodes } from '@/lib/homelab-data'

const projectTypes = [
  { id: 'all', name: 'All Projects', icon: Code2 },
  { id: 'github', name: 'GitHub', icon: Github },
  { id: 'homelab', name: 'Home Lab', icon: Home },
  { id: 'photography', name: 'Photography', icon: Camera },
  { id: 'videography', name: 'Videography', icon: Video },
  // { id: 'other', name: 'Other Projects', icon: Wrench },
]

const orientationOptions = [
  { id: 'all', name: 'All Orientations' },
  { id: 'vertical', name: 'Vertical' },
  { id: 'horizontal', name: 'Horizontal' },
]

// Project Card Component with Preloading
function ProjectCard({ project, index, onVideoPlay }: { 
  project: Project; 
  index: number; 
  onVideoPlay?: (project: Project) => void;
}) {
  const router = useRouter()
  const { startPreload, cancelPreload, cancelAllPreloads } = usePreload()

  const handleMouseEnter = () => {
    if (project.type !== 'videography') {
      startPreload(`/projects/${project.slug}`)
    }
  }

  const handleMouseLeave = () => {
    if (project.type !== 'videography') {
      cancelPreload(`/projects/${project.slug}`)
    }
  }

  const handleClick = () => {
    cancelAllPreloads()
    if (project.type === 'videography' && onVideoPlay) {
      onVideoPlay(project)
    } else {
      router.push(`/projects/${project.slug}`)
    }
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
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {project.type === 'github' && <Github className="h-4 w-4" />}
            {project.type === 'homelab' && <Home className="h-4 w-4" />}
            {project.type === 'photography' && <Camera className="h-4 w-4" />}
            {project.type === 'videography' && <Video className="h-4 w-4" />}
            {project.type === 'other' && <Wrench className="h-4 w-4" />}
            {project.title}
          </CardTitle>
          <CardDescription className="text-xs line-clamp-2">{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
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

function ProjectsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedOrientation, setSelectedOrientation] = useState<'all' | 'vertical' | 'horizontal'>('all')
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({})
  const [showLeftBlur, setShowLeftBlur] = useState(false)
  const [showRightBlur, setShowRightBlur] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Video modal state
  const [selectedVideoProject, setSelectedVideoProject] = useState<Project | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [initialVideoIndex, setInitialVideoIndex] = useState(0)

  // Homelab modal state
  const [homelabOpenSlug, setHomelabOpenSlug] = useState<string | null>(null)
  const homelabTechnologies = getHomelabTechnologies()
  const homelabSpecs = getHomelabHardware()
  const homelabNodes = getHomelabNodes()
  const activeHomelabTech = homelabOpenSlug ? (homelabTechnologies.find((t: any) => t.slug === homelabOpenSlug) || null) : null

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

  // Handle URL-based video modal
  useEffect(() => {
    const videoSlug = searchParams.get('video')
    const videoIndex = searchParams.get('index')
    
    if (videoSlug && projects.length > 0) {
      const project = projects.find(p => p.slug === videoSlug && p.type === 'videography')
      if (project) {
        setSelectedVideoProject(project)
        setInitialVideoIndex(videoIndex ? parseInt(videoIndex, 10) : 0)
        setIsVideoModalOpen(true)
      }
    } else {
      setIsVideoModalOpen(false)
      setSelectedVideoProject(null)
    }
  }, [searchParams, projects])

  // Video modal handlers
  const handleVideoPlay = (project: Project, videoIndex: number = 0) => {
    setSelectedVideoProject(project)
    setInitialVideoIndex(videoIndex)
    setIsVideoModalOpen(true)
  }

  const handleVideoModalClose = () => {
    setIsVideoModalOpen(false)
    setSelectedVideoProject(null)
  }

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
          {selectedType !== 'videography' && (
            <>
              <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
              <ProjectGridSkeleton count={3} />
            </>
          )}
          
          <h2 className="text-2xl font-bold mb-6 mt-12">
            {selectedType === 'videography' ? 'Video Projects' : 'All Projects'}
          </h2>
          {selectedType === 'videography' ? (
            <VideoGridSkeleton 
              count={6} 
              orientation={selectedOrientation === 'all' ? 'horizontal' : selectedOrientation}
            />
          ) : (
            <ProjectGridSkeleton count={6} />
          )}
        </motion.section>
      )}

      {/* Featured Projects */}
      {!loading && featuredProjects.length > 0 && selectedType !== 'videography' && selectedType !== 'homelab' && (
        <motion.section
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredProjects.map((project, index) => (
              <ProjectCard 
                key={project._id.toString()} 
                project={project} 
                index={index}
                onVideoPlay={handleVideoPlay}
              />
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
          {selectedType === 'homelab' ? (
            <div className="space-y-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Home Lab</h2>
                <p className="text-muted-foreground">Hardware → Proxmox VE → CasaOS, Coolify, Home Assistant & More</p>
              </div>

              {/* Server Specifications */}
              <section>
                <h3 className="text-xl font-semibold mb-4">Server Specifications</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* CPU */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500/10">
                            <Cpu className="h-5 w-5 text-red-500" />
                          </div>
                          <h4 className="font-semibold text-red-500">Processor</h4>
                        </div>
                        <div className="space-y-1 pl-10">
                          <p className="font-medium">{homelabSpecs.cpu}</p>
                          <p className="text-sm text-muted-foreground">{homelabSpecs.cores}</p>
                          <p className="text-xs text-muted-foreground">{homelabSpecs.baseClockPowerSpecStorage}</p>
                        </div>
                      </div>

                      {/* Memory */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <MemoryStick className="h-5 w-5 text-blue-500" />
                          </div>
                          <h4 className="font-semibold text-blue-500">Memory</h4>
                        </div>
                        <div className="space-y-1 pl-10">
                          <p className="font-medium">{homelabSpecs.memory}</p>
                          <p className="text-sm text-muted-foreground">DDR4 DIMM</p>
                          <p className="text-xs text-muted-foreground">ECC Support</p>
                        </div>
                      </div>

                      {/* Storage */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <HardDrive className="h-5 w-5 text-green-500" />
                          </div>
                          <h4 className="font-semibold text-green-500">Storage</h4>
                        </div>
                        <div className="space-y-1 pl-10">
                          <p className="font-medium">{homelabSpecs.storage}</p>
                          <p className="text-sm text-muted-foreground">NVMe + SATA</p>
                          <p className="text-xs text-muted-foreground">ZFS RAID-1</p>
                        </div>
                      </div>

                      {/* Motherboard */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <Server className="h-5 w-5 text-purple-500" />
                          </div>
                          <h4 className="font-semibold text-purple-500">Motherboard</h4>
                        </div>
                        <div className="space-y-1 pl-10">
                          <p className="font-medium">{homelabSpecs.motherboard}</p>
                          <p className="text-sm text-muted-foreground">AMD B550 Chipset</p>
                          <p className="text-xs text-muted-foreground">PCIe 4.0 Support</p>
                        </div>
                      </div>

                      {/* Graphics */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-500/10">
                            <Monitor className="h-5 w-5 text-orange-500" />
                          </div>
                          <h4 className="font-semibold text-orange-500">Graphics</h4>
                        </div>
                        <div className="space-y-1 pl-10">
                          <p className="font-medium">{homelabSpecs.gpu}</p>
                          <p className="text-sm text-muted-foreground">Hardware Acceleration</p>
                          <p className="text-xs text-muted-foreground">Media Transcoding</p>
                        </div>
                      </div>

                      {/* Operating System */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-500/10">
                            <Server className="h-5 w-5 text-slate-500" />
                          </div>
                          <h4 className="font-semibold text-slate-500">Base OS</h4>
                        </div>
                        <div className="space-y-1 pl-10">
                          <p className="font-medium">Debian 12 (Bookworm)</p>
                          <p className="text-sm text-muted-foreground">Stable Branch</p>
                          <p className="text-xs text-muted-foreground">All VMs & Containers</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Interactive Architecture Flowchart */}
              <section>
                <h3 className="text-xl font-semibold mb-4">Interactive Architecture</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Explore the complete homelab setup. Pan the canvas to navigate, scroll to zoom, and click nodes for detailed information.
                      </p>
                    </div>
                    <InteractiveHomelabFlowchart
                      nodes={homelabNodes}
                    />
                  </CardContent>
                </Card>
              </section>

              {/* Quick Stats */}
              <section>
                <h3 className="text-xl font-semibold mb-4">Services Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-500">50+</div>
                      <div className="text-sm text-muted-foreground">Docker Containers</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-500">5</div>
                      <div className="text-sm text-muted-foreground">Core Services</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-500">1</div>
                      <div className="text-sm text-muted-foreground">Physical Server</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-500">24/7</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Homelab Modal */}
              <HomelabModal
                technology={activeHomelabTech}
                isOpen={Boolean(activeHomelabTech)}
                onClose={() => setHomelabOpenSlug(null)}
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6">
                {selectedType === 'all' ? 'All Projects' : `${projectTypes.find(t => t.id === selectedType)?.name || 'Projects'}`}
              </h2>
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No projects found in this category.</p>
                </div>
              ) : selectedType === 'videography' ? (
                <motion.div 
                  className={`grid gap-4 ${
                  selectedOrientation === 'vertical' 
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05, duration: 0.3 }}
                  layout
                >
                  {filteredProjects.map((project, index) => (
                    <div key={project._id.toString()}>
                      <VideoCard 
                        project={project} 
                        onPlay={handleVideoPlay} 
                        index={index} 
                      />
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05, duration: 0.3 }}
                  layout
                >
                  {filteredProjects.map((project, index) => (
                    <div key={project._id.toString()}>
                      <ProjectCard 
                        project={project} 
                        index={index}
                        onVideoPlay={handleVideoPlay}
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </motion.section>
      )}

      {/* Video Modal */}
      <VideoModal
        project={selectedVideoProject}
        isOpen={isVideoModalOpen}
        onClose={handleVideoModalClose}
        initialVideoIndex={initialVideoIndex}
      />

      {/* Homelab Modal duplication safeguard for SSR hydration order */}
      <HomelabModal
        technology={activeHomelabTech}
        isOpen={Boolean(activeHomelabTech)}
        onClose={() => setHomelabOpenSlug(null)}
      />
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Projects</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore my professional work, personal projects, and creative endeavors across different technologies and domains.
          </p>
        </div>
        <ProjectGridSkeleton count={6} />
      </div>
    }>
      <ProjectsPageContent />
    </Suspense>
  )
}