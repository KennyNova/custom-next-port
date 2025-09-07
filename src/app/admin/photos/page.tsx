'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { PhotoGrid } from '@/components/ui/photo-grid'
import { PhotoModal } from '@/components/ui/photo-modal'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Upload, Grid3X3, RefreshCw } from 'lucide-react'
import type { Photo } from '@/types'

export default function PhotoAdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState<string>('')
  const [uploadError, setUploadError] = useState<string>('')
  const [bulkUploadProgress, setBulkUploadProgress] = useState<string>('')

  // Fetch photos
  const fetchPhotos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/photos?sort=newest&limit=100')
      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.status}`)
      }
      
      const data = await response.json()
      setPhotos(data.photos || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch photos')
      console.error('Error fetching photos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  // Clear success/error messages
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => setUploadSuccess(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [uploadSuccess])

  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [uploadError])

  const handleUploadSuccess = (photo: Photo) => {
    setUploadSuccess(`Successfully uploaded "${photo.alt}"`)
    setPhotos(prev => [photo, ...prev]) // Add to beginning of list
  }

  const handleUploadError = (error: string) => {
    setUploadError(error)
  }

  const handleBulkUploadProgress = (current: number, total: number, currentFile: string) => {
    setBulkUploadProgress(`Uploading ${current}/${total}: ${currentFile}`)
  }

  const handleBulkUploadComplete = (successCount: number, errorCount: number) => {
    setBulkUploadProgress('')
    if (errorCount === 0) {
      setUploadSuccess(`Successfully uploaded ${successCount} photos!`)
    } else {
      setUploadSuccess(`Uploaded ${successCount} photos with ${errorCount} errors`)
    }
    // Refresh the photo list
    fetchPhotos()
  }

  const handlePhotoClick = (photo: Photo) => {
    const photoIndex = photos.findIndex(p => p._id.toString() === photo._id.toString())
    console.log('Photo clicked:', { 
      clickedPhotoId: photo._id.toString(), 
      foundIndex: photoIndex,
      totalPhotos: photos.length 
    })
    setSelectedPhotoIndex(photoIndex >= 0 ? photoIndex : 0)
    setIsPhotoModalOpen(true)
  }

  const handlePhotoModalClose = () => {
    setIsPhotoModalOpen(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Camera className="h-8 w-8" />
          Photo Management
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload and manage photography collection stored in Vercel Blob
        </p>
      </motion.div>

      {/* Success/Error Messages */}
      {uploadSuccess && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <p className="text-green-800">{uploadSuccess}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {bulkUploadProgress && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-blue-800">{bulkUploadProgress}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {uploadError && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-800">{uploadError}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Photos
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Manage Photos ({photos.length})
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PhotoUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              onBulkUploadProgress={handleBulkUploadProgress}
              onBulkUploadComplete={handleBulkUploadComplete}
            />
          </motion.div>
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Photo Collection
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPhotos}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage your photography collection stored in Vercel Blob
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-500">{photos.length}</div>
                    <div className="text-sm text-muted-foreground">Total Photos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">
                      {photos.filter(p => p.featured).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Featured</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-500">
                      {new Set(photos.flatMap(p => p.tags)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">Unique Tags</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">
                      {(photos.reduce((sum, p) => sum + p.metadata.size, 0) / 1024 / 1024).toFixed(1)}MB
                    </div>
                    <div className="text-sm text-muted-foreground">Total Size</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Grid */}
            {error ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-red-500 mb-4">Error loading photos: {error}</p>
                  <Button onClick={fetchPhotos}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <PhotoGrid 
                photos={photos} 
                loading={loading}
                onPhotoClick={handlePhotoClick}
              />
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Photo Modal */}
      <PhotoModal
        photos={photos}
        initialIndex={selectedPhotoIndex}
        isOpen={isPhotoModalOpen}
        onClose={handlePhotoModalClose}
      />
    </div>
  )
}
