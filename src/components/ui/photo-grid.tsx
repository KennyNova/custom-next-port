'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Camera, MapPin, Aperture, Clock, Settings, Focus } from 'lucide-react'
import type { Photo } from '@/types'
import Image from 'next/image'

interface PhotoGridProps {
  photos: Photo[]
  loading?: boolean
  onPhotoClick?: (photo: Photo) => void
}

export function PhotoGrid({ photos, loading = false, onPhotoClick }: PhotoGridProps) {
  if (loading) {
    return <PhotoGridSkeleton />
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No photos found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <PhotoCard 
          key={photo._id.toString()} 
          photo={photo} 
          index={index}
          onClick={() => onPhotoClick?.(photo)}
        />
      ))}
    </div>
  )
}

function PhotoCard({ photo, index, onClick }: { 
  photo: Photo; 
  index: number; 
  onClick?: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card 
        className={`group overflow-hidden hover:shadow-lg transition-all duration-300 ${
          onClick ? 'cursor-pointer' : ''
        }`}
        onClick={onClick}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0" />
          )}
          
          {!imageError ? (
            <Image
              src={photo.blobUrl}
              alt={photo.alt}
              fill
              className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Featured badge */}
          {photo.featured && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                Featured
              </Badge>
            </div>
          )}

          {/* Camera info overlay */}
          {(photo.metadata.camera || photo.metadata.lens) && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                {photo.metadata.camera && (
                  <div className="flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    {photo.metadata.camera}
                  </div>
                )}
                {photo.metadata.lens && (
                  <div className="text-xs opacity-80">{photo.metadata.lens}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Alt text as title */}
            <h3 className="font-medium text-sm line-clamp-2">{photo.alt}</h3>
            
            {/* Description */}
            {photo.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {photo.description}
              </p>
            )}

            {/* Camera settings */}
            {photo.metadata.settings && (
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                {photo.metadata.settings.aperture && (
                  <div className="flex items-center gap-1">
                    <Aperture className="h-3 w-3" />
                    {photo.metadata.settings.aperture}
                  </div>
                )}
                {photo.metadata.settings.shutterSpeed && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {photo.metadata.settings.shutterSpeed}
                  </div>
                )}
                {photo.metadata.settings.iso && (
                  <div className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    ISO {photo.metadata.settings.iso}
                  </div>
                )}
                {photo.metadata.settings.focalLength && (
                  <div className="flex items-center gap-1">
                    <Focus className="h-3 w-3" />
                    {photo.metadata.settings.focalLength}
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            {photo.metadata.location?.name && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {photo.metadata.location.name}
              </div>
            )}

            {/* Tags */}
            {photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {photo.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                    {tag}
                  </Badge>
                ))}
                {photo.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{photo.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function PhotoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-[4/3]" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-14" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
