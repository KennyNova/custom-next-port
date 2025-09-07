'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Camera, MapPin, Calendar, Aperture, Clock, Settings, Focus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Photo } from '@/types'
import Image from 'next/image'

interface PhotoModalProps {
  photos: Photo[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export function PhotoModal({ photos, initialIndex, isOpen, onClose }: PhotoModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [imageLoaded, setImageLoaded] = useState(false)

  const currentPhoto = photos[currentIndex]

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  // Reset image loaded state when photo changes
  useEffect(() => {
    setImageLoaded(false)
  }, [currentIndex])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return

    switch (event.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1)
        }
        break
      case 'ArrowRight':
        if (currentIndex < photos.length - 1) {
          setCurrentIndex(currentIndex + 1)
        }
        break
    }
  }, [isOpen, currentIndex, photos.length, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (!currentPhoto) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation buttons */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {currentIndex < photos.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Photo counter */}
          <div className="absolute top-4 left-4 z-10 text-white text-sm bg-black/50 px-3 py-1 rounded">
            {currentIndex + 1} / {photos.length}
          </div>

          {/* Main content */}
          <motion.div
            className="max-w-6xl w-full max-h-full flex flex-col lg:flex-row gap-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex-1 relative flex items-center justify-center">
              <div className="relative max-w-full max-h-[80vh] w-auto h-auto">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-800 animate-pulse rounded" 
                       style={{ 
                         width: Math.min(800, currentPhoto.metadata.width),
                         height: Math.min(600, currentPhoto.metadata.height) 
                       }} 
                  />
                )}
                <Image
                  src={currentPhoto.blobUrl}
                  alt={currentPhoto.alt}
                  width={currentPhoto.metadata.width}
                  height={currentPhoto.metadata.height}
                  className={`max-w-full max-h-[80vh] w-auto h-auto object-contain rounded transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
              </div>
            </div>

            {/* Metadata sidebar */}
            <div className="lg:w-80 bg-background/95 backdrop-blur rounded-lg p-6 overflow-y-auto max-h-[80vh]">
              <div className="space-y-6">
                {/* Title and description */}
                <div>
                  <h2 className="text-lg font-semibold mb-2">{currentPhoto.alt}</h2>
                  {currentPhoto.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {currentPhoto.description}
                    </p>
                  )}
                </div>

                {/* Camera equipment */}
                {(currentPhoto.metadata.camera || currentPhoto.metadata.lens) && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Equipment
                    </h3>
                    {currentPhoto.metadata.camera && (
                      <p className="text-sm text-muted-foreground pl-6">
                        {currentPhoto.metadata.camera}
                      </p>
                    )}
                    {currentPhoto.metadata.lens && (
                      <p className="text-sm text-muted-foreground pl-6">
                        {currentPhoto.metadata.lens}
                      </p>
                    )}
                  </div>
                )}

                {/* Camera settings */}
                {currentPhoto.metadata.settings && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Settings</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {currentPhoto.metadata.settings.aperture && (
                        <div className="flex items-center gap-2">
                          <Aperture className="h-3 w-3 text-muted-foreground" />
                          <span>{currentPhoto.metadata.settings.aperture}</span>
                        </div>
                      )}
                      {currentPhoto.metadata.settings.shutterSpeed && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{currentPhoto.metadata.settings.shutterSpeed}</span>
                        </div>
                      )}
                      {currentPhoto.metadata.settings.iso && (
                        <div className="flex items-center gap-2">
                          <Settings className="h-3 w-3 text-muted-foreground" />
                          <span>ISO {currentPhoto.metadata.settings.iso}</span>
                        </div>
                      )}
                      {currentPhoto.metadata.settings.focalLength && (
                        <div className="flex items-center gap-2">
                          <Focus className="h-3 w-3 text-muted-foreground" />
                          <span>{currentPhoto.metadata.settings.focalLength}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {currentPhoto.metadata.location?.name && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </h3>
                    <p className="text-sm text-muted-foreground pl-6">
                      {currentPhoto.metadata.location.name}
                    </p>
                  </div>
                )}

                {/* Date */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </h3>
                  <p className="text-sm text-muted-foreground pl-6">
                    {new Date(currentPhoto.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Tags */}
                {currentPhoto.tags.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {currentPhoto.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical details */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Technical</h3>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Dimensions: {currentPhoto.metadata.width} × {currentPhoto.metadata.height}</p>
                    <p>Format: {currentPhoto.metadata.format.toUpperCase()}</p>
                    <p>Size: {(currentPhoto.metadata.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
