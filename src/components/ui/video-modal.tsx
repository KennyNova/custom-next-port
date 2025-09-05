'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Monitor, 
  Share2, 
  Check,
  Calendar,
  Video,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import type { Project } from '@/types'
import { MuxVideoPlayer } from '@/components/ui/mux-video-player'

interface VideoModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  initialVideoIndex?: number
}

export function VideoModal({ project, isOpen, onClose, initialVideoIndex = 0 }: VideoModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialVideoIndex)
  const [copiedLink, setCopiedLink] = useState(false)
  const touchStartXRef = useRef<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  type VideoItem = {
    id: string
    muxAssetId: string
    muxPlaybackId: string
    thumbnailUrl?: string
    duration?: number
    status: 'uploading' | 'preparing' | 'ready' | 'error'
    aspectRatio?: string
    createdAt: Date
    projectTitle: string
    projectSlug: string
    projectTechnologies: string[]
    orientation?: 'vertical' | 'horizontal'
  }

  const [allVideos, setAllVideos] = useState<VideoItem[]>([])
  const [loadedCount, setLoadedCount] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)

  // Flatten all videography videos across projects
  const currentVideo = allVideos[currentVideoIndex]
  const visibleVideos = allVideos.slice(0, loadedCount)

  // Load all videos once on open
  useEffect(() => {
    const loadVideos = async () => {
      if (!isOpen || isLoading || allVideos.length > 0) return
      setIsLoading(true)
      try {
        const res = await fetch('/api/projects?type=videography')
        if (!res.ok) throw new Error('Failed to fetch projects')
        const data = await res.json()
        const flattened: VideoItem[] = []
        data.projects.forEach((proj: Project) => {
          proj.videos?.forEach((video) => {
            if (video.status === 'ready') {
              const orientation: 'vertical' | 'horizontal' | undefined = proj.orientation || (video.aspectRatio && Number(video.aspectRatio.split(':')[1]) > Number(video.aspectRatio.split(':')[0]) ? 'vertical' : 'horizontal')
              flattened.push({
                id: `${proj._id}_${video.muxAssetId}`,
                muxAssetId: video.muxAssetId,
                muxPlaybackId: video.muxPlaybackId,
                thumbnailUrl: video.thumbnailUrl,
                duration: video.duration,
                status: video.status,
                aspectRatio: video.aspectRatio,
                createdAt: video.createdAt,
                projectTitle: proj.title,
                projectSlug: proj.slug,
                projectTechnologies: proj.technologies,
                orientation,
              })
            }
          })
        })
        setAllVideos(flattened)
        setLoadedCount(Math.min(10, flattened.length))
        // Try to set initial index to first video from the provided project, if any
        if (project) {
          const firstIdx = flattened.findIndex(v => v.projectSlug === project.slug)
          if (firstIdx !== -1) setCurrentVideoIndex(firstIdx)
        }
      } catch (e) {
        console.error('Error loading videos:', e)
      } finally {
        setIsLoading(false)
      }
    }
    loadVideos()
  }, [isOpen, isLoading, allVideos.length, project])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'ArrowRight') nextVideo()
      if (e.key === 'ArrowLeft') prevVideo()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, currentVideoIndex, allVideos.length])

  const formatDuration = (duration?: number) => {
    if (!duration) return '0:00'
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const shareVideo = async () => {
    if (!currentVideo) return
    const videoUrl = `${window.location.origin}/projects?video=${currentVideo.id}`
    
    try {
      await navigator.share({
        title: `${currentVideo.projectTitle} - Video`,
        text: `Check out this video from ${currentVideo.projectTitle}`,
        url: videoUrl,
      })
    } catch (err) {
      // Fallback to clipboard
      navigator.clipboard.writeText(videoUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const nextVideo = () => {
    if (currentVideoIndex < allVideos.length - 1) {
      setVideoLoading(true)
      const nextIndex = currentVideoIndex + 1
      // Auto-extend visible list when navigating beyond loaded items
      if (nextIndex >= loadedCount && loadedCount < allVideos.length) {
        setLoadedCount(c => Math.min(c + 10, allVideos.length))
      }
      setCurrentVideoIndex(nextIndex)
      // Reset video loading after a short delay to show skeleton
      setTimeout(() => setVideoLoading(false), 300)
    }
  }

  const prevVideo = () => {
    if (currentVideoIndex > 0) {
      setVideoLoading(true)
      setCurrentVideoIndex(prev => prev - 1)
      // Reset video loading after a short delay to show skeleton
      setTimeout(() => setVideoLoading(false), 300)
    }
  }

  if (!isOpen) return null

  // Video skeleton component that matches exact MuxVideoPlayer dimensions
  const VideoSkeleton = ({ orientation }: { orientation: 'vertical' | 'horizontal' }) => (
    <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/20 rounded-full p-4">
            <Video className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </div>
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent -translate-x-full animate-shimmer" 
             style={{
               animation: 'shimmer 2s infinite',
               background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
             }} />
      </div>
    </div>
  )

  const handleListScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return
    const { scrollTop, clientHeight, scrollHeight } = container
    if (scrollTop + clientHeight >= scrollHeight - 80) {
      if (loadedCount < allVideos.length) {
        setLoadedCount(c => Math.min(c + 10, allVideos.length))
      }
    }
  }

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
          <div className="mx-auto h-full flex items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-background sm:rounded-lg rounded-none shadow-2xl w-full sm:max-w-7xl h-full sm:h-[95dvh] sm:max-h-[95dvh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b min-h-[80px] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Videos</h2>
                    <p className="text-sm text-muted-foreground">
                      {allVideos.length > 0 ? (
                        `Video ${currentVideoIndex + 1} of ${allVideos.length}`
                      ) : (
                        'Loading videos...'
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={shareVideo}>
                    {copiedLink ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div 
                className="flex flex-col lg:flex-row flex-1 min-h-0"
                onTouchStart={(e) => { touchStartXRef.current = e.changedTouches[0].clientX }}
                onTouchEnd={(e) => {
                  const startX = touchStartXRef.current
                  if (startX == null) return
                  const deltaX = e.changedTouches[0].clientX - startX
                  if (Math.abs(deltaX) > 60) {
                    if (deltaX < 0) nextVideo()
                    else prevVideo()
                  }
                  touchStartXRef.current = null
                }}
              >
                {/* Video Player */}
                <div className="flex-1 p-4 sm:p-6 flex items-center justify-center min-h-0">
                  <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
                    {/* Fixed container that maintains size regardless of video orientation */}
                    <div className="relative w-full h-full max-w-4xl max-h-[70vh] flex items-center justify-center">
                      <div className={`relative ${
                        (currentVideo?.orientation || 'horizontal') === 'vertical' 
                          ? 'w-auto h-full aspect-[9/16]' 
                          : 'w-full h-auto aspect-video'
                      }`}>
                        {videoLoading || !currentVideo ? (
                          <VideoSkeleton orientation={(currentVideo?.orientation || 'horizontal') as 'vertical' | 'horizontal'} />
                        ) : (
                          <MuxVideoPlayer 
                            playbackId={currentVideo.muxPlaybackId}
                            orientation={(currentVideo.orientation || 'horizontal') as 'vertical' | 'horizontal'}
                            title={currentVideo.projectTitle}
                            poster={currentVideo.thumbnailUrl}
                            autoPlay={false}
                            muted={true}
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Navigation Arrows */}
                    {allVideos.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                          onClick={prevVideo}
                          disabled={currentVideoIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                          onClick={nextVideo}
                          disabled={currentVideoIndex === allVideos.length - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l flex-shrink-0">
                  <div 
                    ref={scrollContainerRef}
                    onScroll={handleListScroll}
                    className="p-4 sm:p-6 space-y-6 h-full overflow-y-auto"
                  >

                    {/* Video Details */}
                    {currentVideo && !videoLoading ? (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Video Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {currentVideo.duration && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>Duration: {formatDuration(currentVideo.duration)}</span>
                            </div>
                          )}
                          {currentVideo.aspectRatio && (
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                              <span>Aspect Ratio: {currentVideo.aspectRatio}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Added: {new Date(currentVideo.createdAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Video Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                            <div className="h-4 bg-muted rounded animate-pulse w-20" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                            <div className="h-4 bg-muted rounded animate-pulse w-16" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                            <div className="h-4 bg-muted rounded animate-pulse w-24" />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Technologies */}
                    {currentVideo?.projectTechnologies?.length > 0 && !videoLoading ? (
                      <div>
                        <h3 className="font-semibold mb-2">Technologies</h3>
                        <div className="flex flex-wrap gap-1">
                          {currentVideo.projectTechnologies.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : videoLoading && (
                      <div>
                        <h3 className="font-semibold mb-2">Technologies</h3>
                        <div className="flex flex-wrap gap-1">
                          <div className="h-5 bg-muted rounded animate-pulse w-16" />
                          <div className="h-5 bg-muted rounded animate-pulse w-12" />
                          <div className="h-5 bg-muted rounded animate-pulse w-20" />
                        </div>
                      </div>
                    )}

                    {/* All Videos List with infinite scroll */}
                    <div>
                      <h3 className="font-semibold mb-2">
                        {isLoading ? (
                          <div className="h-5 bg-muted rounded animate-pulse w-32" />
                        ) : (
                          `All Videos (${allVideos.length})`
                        )}
                      </h3>
                      <div className="space-y-2">
                        {isLoading ? (
                          // Show skeleton items while loading
                          Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="w-full p-3 rounded-lg border border-transparent">
                              <div className="flex gap-3">
                                <div className="relative flex-shrink-0 rounded overflow-hidden w-16 h-12 bg-muted animate-pulse" />
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                                  <div className="flex gap-2">
                                    <div className="h-3 bg-muted rounded animate-pulse w-12" />
                                    <div className="h-3 bg-muted rounded animate-pulse w-16" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          visibleVideos.map((video, index) => {
                            const globalIndex = index // since visibleVideos is a slice from 0
                            const isActive = globalIndex === currentVideoIndex
                            return (
                              <button
                                key={video.id}
                                onClick={() => {
                                  setVideoLoading(true)
                                  setCurrentVideoIndex(globalIndex)
                                  setTimeout(() => setVideoLoading(false), 300)
                                }}
                                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                  isActive 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-transparent hover:border-muted-foreground hover:bg-muted/50'
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className={`relative flex-shrink-0 rounded overflow-hidden ${
                                    (video.orientation || 'horizontal') === 'vertical' ? 'w-12 h-16' : 'w-16 h-12'
                                  } bg-muted`}>
                                    {video.thumbnailUrl ? (
                                      <Image 
                                        src={video.thumbnailUrl} 
                                        alt={video.projectTitle}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-muted flex items-center justify-center">
                                        <Video className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{video.projectTitle}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      {video.duration && (
                                        <span>{formatDuration(video.duration)}</span>
                                      )}
                                      <span className="capitalize">{video.orientation}</span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            )
                          })
                        )}
                        {!isLoading && loadedCount < allVideos.length && (
                          <div className="text-center py-2 text-xs text-muted-foreground">Scroll to load more…</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
