'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Clock, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Project } from '@/types'

interface VideoCardProps {
  project: Project
  onPlay: (project: Project, videoIndex?: number) => void
  index: number
}

export function VideoCard({ project, onPlay, index }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Get the first ready video for the card
  const readyVideos = project.videos?.filter(video => video.status === 'ready') || []
  const primaryVideo = readyVideos[0]
  
  // Use first thumbnail or fallback
  const thumbnailUrl = primaryVideo?.thumbnailUrl || project.images?.[0]
  
  const formatDuration = (duration?: number) => {
    if (!duration) return '0:00'
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onPlay(project)}
      >
        <div className="relative">
          {/* Video Thumbnail */}
          <div className={`relative overflow-hidden bg-black ${
            project.orientation === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'
          }`}>
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            
            {/* Play Overlay */}
            <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isHovered ? 1 : 0.8 }}
                className="bg-white/90 rounded-full p-4 backdrop-blur-sm"
              >
                <Play className="h-8 w-8 text-primary" fill="currentColor" />
              </motion.div>
            </div>
            
            {/* Duration Badge */}
            {primaryVideo?.duration && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="bg-black/70 text-white">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(primaryVideo.duration)}
                </Badge>
              </div>
            )}
            
            {/* Video Count Badge */}
            {readyVideos.length > 1 && (
              <div className="absolute top-2 right-2">
                <Badge variant="default">
                  {readyVideos.length} videos
                </Badge>
              </div>
            )}
            
            {/* Orientation Badge */}
            <div className="absolute top-2 left-2">
              <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                {project.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}
              </Badge>
            </div>
          </div>
        </div>
        
        <CardContent className="p-3">
          <div className="space-y-2">
            {/* Title and Description */}
            <div>
              <h3 className="font-semibold text-base line-clamp-1">{project.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
            </div>
            
            {/* Technologies */}
            {project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.technologies.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {project.technologies.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.technologies.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Play Button */}
            <Button 
              className="w-full" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onPlay(project)
              }}
            >
              <Play className="h-3 w-3 mr-1" />
              Watch Video{readyVideos.length > 1 ? 's' : ''}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface VideoGridSkeletonProps {
  count?: number
  orientation?: 'vertical' | 'horizontal'
}

export function VideoGridSkeleton({ count = 6, orientation = 'horizontal' }: VideoGridSkeletonProps) {
  return (
    <div className={`grid gap-6 ${
      orientation === 'vertical' 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className={`bg-muted rounded-lg animate-pulse ${
            orientation === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'
          }`} />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            <div className="flex gap-1">
              <div className="h-5 bg-muted rounded animate-pulse w-16" />
              <div className="h-5 bg-muted rounded animate-pulse w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
