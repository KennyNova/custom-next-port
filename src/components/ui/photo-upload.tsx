'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload, Camera, Loader2, CheckCircle, X } from 'lucide-react'
import type { Photo } from '@/types'

interface PhotoUploadProps {
  onUploadSuccess?: (photo: Photo) => void
  onUploadError?: (error: string) => void
  onBulkUploadProgress?: (current: number, total: number, currentFile: string) => void
  onBulkUploadComplete?: (successCount: number, errorCount: number) => void
}

export function PhotoUpload({ onUploadSuccess, onUploadError, onBulkUploadProgress, onBulkUploadComplete }: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0)
  const [bulkUploadResults, setBulkUploadResults] = useState<{
    successCount: number
    errorCount: number
    errors: string[]
  }>({ successCount: 0, errorCount: 0, errors: [] })
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form fields
  const [alt, setAlt] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [camera, setCamera] = useState('')
  const [lens, setLens] = useState('')
  const [aperture, setAperture] = useState('')
  const [shutterSpeed, setShutterSpeed] = useState('')
  const [iso, setIso] = useState('')
  const [focalLength, setFocalLength] = useState('')
  const [locationName, setLocationName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  // Parse filename to extract metadata (same logic as backend)
  const parseFilename = (filename: string) => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    const parts = nameWithoutExt.split('-')
    
    if (parts.length < 2) {
      return {
        tags: [],
        title: nameWithoutExt.replace(/[_-]/g, ' '),
        dateString: '',
      }
    }

    const dateString = parts[parts.length - 1]
    const titleParts = parts.slice(1, -1)
    const title = titleParts.join(' ').replace(/_/g, ' ')
    const tagsPart = parts[0]
    const tags = tagsPart.split('_').map(tag => tag.trim()).filter(Boolean)

    return { tags, title, dateString }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 30 * 1024 * 1024 // 30MB

    // Validate all files
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
    const oversizedFiles = files.filter(file => file.size > maxSize)

    if (invalidFiles.length > 0) {
      onUploadError?.(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Please select JPEG, PNG, or WebP files.`)
      return
    }

    if (oversizedFiles.length > 0) {
      onUploadError?.(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 30MB.`)
      return
    }

    setSelectedFiles(files)
    setUploadSuccess(false)
    setBulkUploadResults({ successCount: 0, errorCount: 0, errors: [] })

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)

    // For single file, auto-populate fields from first file
    if (files.length === 1) {
      const parsed = parseFilename(files[0].name)
      
      if (!alt && parsed.title) {
        setAlt(parsed.title)
      }
      
      if (!tags && parsed.tags.length > 0) {
        setTags(parsed.tags.join(', '))
      }
    } else {
      // For multiple files, clear individual form fields
      setAlt('')
      setDescription('')
      setTags('')
      setCamera('')
      setLens('')
      setAperture('')
      setShutterSpeed('')
      setIso('')
      setFocalLength('')
      setLocationName('')
      setLat('')
      setLng('')
    }
  }

  const uploadSingleFile = async (file: File, metadata: any) => {
    const formData = new FormData()
    formData.append('file', file)
    
    // Add metadata
    Object.entries(metadata).forEach(([key, value]) => {
      if (value && String(value).trim()) {
        formData.append(key, String(value).trim())
      }
    })

    const response = await fetch('/api/photos/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Upload failed')
    }

    return data.photo
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      onUploadError?.('Please select at least one file')
      return
    }

    setUploading(true)
    setCurrentUploadIndex(0)
    
    if (selectedFiles.length === 1) {
      // Single file upload
      if (!alt.trim()) {
        onUploadError?.('Please provide alt text')
        setUploading(false)
        return
      }

      try {
        const metadata = {
          alt: alt.trim(),
          description: description.trim(),
          tags: tags.trim(),
          camera: camera.trim(),
          lens: lens.trim(),
          aperture: aperture.trim(),
          shutterSpeed: shutterSpeed.trim(),
          iso: iso.trim(),
          focalLength: focalLength.trim(),
          locationName: locationName.trim(),
          lat: lat.trim(),
          lng: lng.trim(),
        }

        const photo = await uploadSingleFile(selectedFiles[0], metadata)
        setUploadSuccess(true)
        onUploadSuccess?.(photo)
        
        setTimeout(() => {
          resetForm()
        }, 2000)

      } catch (error) {
        console.error('Upload error:', error)
        onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    } else {
      // Bulk upload
      const results = { successCount: 0, errorCount: 0, errors: [] as string[] }
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        setCurrentUploadIndex(i)
        onBulkUploadProgress?.(i + 1, selectedFiles.length, file.name)

        try {
          // Use shared metadata for all files
          const metadata = {
            alt: '', // Will be auto-generated from filename
            description: description.trim(),
            tags: tags.trim(),
            camera: camera.trim(),
            lens: lens.trim(),
            aperture: aperture.trim(),
            shutterSpeed: shutterSpeed.trim(),
            iso: iso.trim(),
            focalLength: focalLength.trim(),
            locationName: locationName.trim(),
            lat: lat.trim(),
            lng: lng.trim(),
          }

          const photo = await uploadSingleFile(file, metadata)
          results.successCount++
          onUploadSuccess?.(photo)

        } catch (error) {
          results.errorCount++
          const errorMessage = error instanceof Error ? error.message : 'Upload failed'
          results.errors.push(`${file.name}: ${errorMessage}`)
        }

        // Small delay to prevent overwhelming the server
        if (i < selectedFiles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      setBulkUploadResults(results)
      onBulkUploadComplete?.(results.successCount, results.errorCount)
      setUploading(false)
      
      if (results.errorCount === 0) {
        setUploadSuccess(true)
        setTimeout(() => {
          resetForm()
        }, 3000)
      } else {
        onUploadError?.(
          `Upload completed with ${results.errorCount} errors: ${results.errors.join('; ')}`
        )
      }
    }
  }

  const resetForm = () => {
    setSelectedFiles([])
    setPreviewUrls([])
    setUploadSuccess(false)
    setCurrentUploadIndex(0)
    setBulkUploadResults({ successCount: 0, errorCount: 0, errors: [] })
    setAlt('')
    setDescription('')
    setTags('')
    setCamera('')
    setLens('')
    setAperture('')
    setShutterSpeed('')
    setIso('')
    setFocalLength('')
    setLocationName('')
    setLat('')
    setLng('')
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    // Cleanup preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url))
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)
    
    // Cleanup the removed URL
    URL.revokeObjectURL(previewUrls[index])
    
    setSelectedFiles(newFiles)
    setPreviewUrls(newUrls)
    
    // If removing the last file, reset the form
    if (newFiles.length === 0) {
      resetForm()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Upload Photo
        </CardTitle>
        <CardDescription>
          Upload a new photo to the photography collection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file">Photo File *</Label>
          <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />
            
            {selectedFiles.length > 0 ? (
              <div className="space-y-4">
                {selectedFiles.length === 1 ? (
                  // Single file preview
                  <div className="relative inline-block">
                    <img
                      src={previewUrls[0]}
                      alt="Preview"
                      className="max-w-full max-h-64 object-contain rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={resetForm}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  // Multiple files grid preview
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedFiles.slice(0, 6).map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={previewUrls[index]}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {selectedFiles.length > 6 && (
                      <div className="flex items-center justify-center bg-muted rounded h-24">
                        <span className="text-sm text-muted-foreground">
                          +{selectedFiles.length - 6} more
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total size: {(selectedFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    Choose Photo
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  JPEG, PNG, or WebP up to 30MB each<br/>
                  Select multiple files for bulk upload
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6"
          >
            {/* Upload Progress for Bulk Upload */}
            {uploading && selectedFiles.length > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">📤 Upload Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading: {selectedFiles[currentUploadIndex]?.name}</span>
                    <span>{currentUploadIndex + 1} of {selectedFiles.length}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentUploadIndex + 1) / selectedFiles.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Upload Results */}
            {bulkUploadResults.successCount > 0 && !uploading && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-900 mb-2">✅ Upload Results</h3>
                <div className="text-sm text-green-700">
                  <p>Successfully uploaded: {bulkUploadResults.successCount} photos</p>
                  {bulkUploadResults.errorCount > 0 && (
                    <p className="text-red-700">Failed: {bulkUploadResults.errorCount} photos</p>
                  )}
                </div>
              </div>
            )}

            {/* Parsed Data Preview for Single File */}
            {selectedFiles.length === 1 && (() => {
              const parsed = parseFilename(selectedFiles[0]?.name || '')
              if (parsed.tags.length > 0 || parsed.title) {
                return (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">📁 Auto-detected from filename:</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      {parsed.tags.length > 0 && (
                        <p><span className="font-medium">Tags:</span> {parsed.tags.join(', ')}</p>
                      )}
                      {parsed.title && (
                        <p><span className="font-medium">Title:</span> {parsed.title}</p>
                      )}
                      {parsed.dateString && (
                        <p><span className="font-medium">Date:</span> {parsed.dateString}</p>
                      )}
                    </div>
                  </div>
                )
              }
              return null
            })()}

            {/* Parsed Data Preview for Multiple Files */}
            {selectedFiles.length > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">📁 Detected from {selectedFiles.length} filenames:</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  {(() => {
                    const allParsed = selectedFiles.map(file => parseFilename(file.name))
                    const allTags = Array.from(new Set(allParsed.flatMap(p => p.tags))).sort()
                    const dateRange = allParsed
                      .map(p => p.dateString)
                      .filter(Boolean)
                      .sort()
                    
                    return (
                      <>
                        {allTags.length > 0 && (
                          <p><span className="font-medium">All Tags:</span> {allTags.join(', ')}</p>
                        )}
                        {dateRange.length > 0 && (
                          <p><span className="font-medium">Date Range:</span> {dateRange[0]} - {dateRange[dateRange.length - 1]}</p>
                        )}
                        <p className="text-xs">Each photo will use its individual filename metadata + shared settings below</p>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                {selectedFiles.length === 1 ? 'Required Information' : 'Optional Information'}
              </h3>
              {selectedFiles.length === 1 ? (
                <div>
                  <Label htmlFor="alt">Alt Text *</Label>
                  <Input
                    id="alt"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Describe the photo for accessibility"
                    required
                  />
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    📝 <span className="font-medium">Bulk Upload Mode:</span> Alt text will be auto-generated from filenames. 
                    The settings below will be applied to all photos.
                  </p>
                </div>
              )}
            </div>

            {/* Optional Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                {selectedFiles.length === 1 ? 'Optional Information' : 'Shared Settings (Applied to All Photos)'}
              </h3>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional description or story behind the photo"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="landscape, portrait, nature (comma separated)"
                />
              </div>

              {/* Camera Equipment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="camera">Camera</Label>
                  <Input
                    id="camera"
                    value={camera}
                    onChange={(e) => setCamera(e.target.value)}
                    placeholder="Canon EOS R5"
                  />
                </div>
                <div>
                  <Label htmlFor="lens">Lens</Label>
                  <Input
                    id="lens"
                    value={lens}
                    onChange={(e) => setLens(e.target.value)}
                    placeholder="24-70mm f/2.8"
                  />
                </div>
              </div>

              {/* Camera Settings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="aperture">Aperture</Label>
                  <Input
                    id="aperture"
                    value={aperture}
                    onChange={(e) => setAperture(e.target.value)}
                    placeholder="f/2.8"
                  />
                </div>
                <div>
                  <Label htmlFor="shutterSpeed">Shutter</Label>
                  <Input
                    id="shutterSpeed"
                    value={shutterSpeed}
                    onChange={(e) => setShutterSpeed(e.target.value)}
                    placeholder="1/125s"
                  />
                </div>
                <div>
                  <Label htmlFor="iso">ISO</Label>
                  <Input
                    id="iso"
                    value={iso}
                    onChange={(e) => setIso(e.target.value)}
                    placeholder="400"
                  />
                </div>
                <div>
                  <Label htmlFor="focalLength">Focal Length</Label>
                  <Input
                    id="focalLength"
                    value={focalLength}
                    onChange={(e) => setFocalLength(e.target.value)}
                    placeholder="50mm"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="locationName">Location</Label>
                <Input
                  id="locationName"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Yosemite National Park"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Latitude (optional)"
                  />
                  <Input
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Longitude (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleUpload}
                disabled={uploading || (selectedFiles.length === 1 && !alt.trim()) || uploadSuccess}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {selectedFiles.length === 1 ? 'Uploading...' : `Uploading ${currentUploadIndex + 1}/${selectedFiles.length}...`}
                  </>
                ) : uploadSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {selectedFiles.length === 1 ? 'Uploaded!' : `Uploaded ${bulkUploadResults.successCount} photos!`}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedFiles.length === 1 ? 'Upload Photo' : `Upload ${selectedFiles.length} Photos`}
                  </>
                )}
              </Button>
              
              {!uploading && !uploadSuccess && (
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
