'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { SignaturesPageSkeleton } from '@/components/ui/signatures-skeleton'
import { Github, Linkedin, Mail, Heart, User, Edit3, Check, X } from 'lucide-react'

// Google Logo Component - maintains brand colors
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width="16" height="16">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)
import { useState, useEffect } from 'react'
import { useUser, useAuth, SignInButton, SignOutButton } from '@clerk/nextjs'

const mockSignatures = [
  {
    _id: '1' as any,
    userId: 'mock-user-1',
    name: 'John Doe',
    message: 'Amazing work! Your portfolio inspired me to start my own coding journey.',
    provider: 'github' as const,
    avatarUrl: 'https://github.com/github.png',
    profileUrl: 'https://github.com/johndoe',
    useRandomIcon: false,
    createdAt: new Date('2024-01-15')
  },
  {
    _id: '2' as any,
    userId: 'mock-user-2',
    name: 'Sarah Wilson',
    message: 'Love the clean design and smooth animations. Great job!',
    provider: 'linkedin' as const,
    avatarUrl: '',
    profileUrl: 'https://linkedin.com/in/sarahwilson',
    useRandomIcon: true,
    createdAt: new Date('2024-01-14')
  },
  {
    _id: '3' as any,
    userId: 'mock-user-3',
    name: 'Mike Chen',
    message: 'The Gagguino project is incredible! Coffee and code - perfect combination.',
    provider: 'google' as const,
    avatarUrl: 'https://github.com/github.png',
    profileUrl: '#',
    useRandomIcon: false,
    createdAt: new Date('2024-01-13')
  }
]

const providerIcons = {
  github: Github,
  linkedin: Linkedin,
  google: GoogleIcon,
  clerk: Heart
}

const providerColors = {
  github: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
  linkedin: 'text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300',
  google: '', // Google logo maintains its own brand colors
  clerk: 'text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300'
}

export default function SignaturesPage() {
  const { user, isLoaded } = useUser()
  const { isSignedIn } = useAuth()
  const [isSigningMode, setIsSigningMode] = useState(false)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [useRandomIcon, setUseRandomIcon] = useState(false)
  const [signatures, setSignatures] = useState(mockSignatures)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [existingSignature, setExistingSignature] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showIconSelector, setShowIconSelector] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const handleSignWall = () => {
    if (isSignedIn) {
      setIsSigningMode(true)
      if (isEditMode && existingSignature) {
        // Pre-populate form for editing
        setName(existingSignature.name)
        setMessage(existingSignature.message)
        setUseRandomIcon(existingSignature.useRandomIcon || false)
      }
    } else {
      // User needs to sign in first
      setIsSigningMode(true)
    }
  }

  const handleSubmitSignature = async () => {
    if (!isSignedIn || !user || !message.trim() || !name.trim()) return

    setIsSubmitting(true)
    try {
      const method = isEditMode ? 'PUT' : 'POST'
      const url = isEditMode ? `/api/signatures/${existingSignature._id}` : '/api/signatures'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
          provider: user.externalAccounts?.[0]?.provider || 'clerk',
          profileUrl: user.externalAccounts?.[0]?.publicMetadata?.profileUrl || '',
          avatarUrl: useRandomIcon ? '' : (user.imageUrl || ''),
          useRandomIcon: useRandomIcon,
        }),
      })

      if (response.ok) {
        // Successfully submitted, refresh the signatures list
        await loadSignatures()
        await checkExistingSignature() // Refresh existing signature data
        setMessage('')
        setIsSigningMode(false)
        
        if (!isEditMode) {
          // Reset name to auto-filled value for next time (only for new signatures)
          const autoName = user.fullName || user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0] || ''
          setName(autoName)
          setUseRandomIcon(false)
        }
      } else {
        const error = await response.json()
        console.error('Error submitting signature:', error)
        alert(`Error: ${error.error || `Failed to ${isEditMode ? 'update' : 'submit'} signature`}`)
      }
    } catch (error) {
      console.error('Error submitting signature:', error)
      alert(`Failed to ${isEditMode ? 'update' : 'submit'} signature. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if user has existing signature
  const checkExistingSignature = async () => {
    if (!isSignedIn || !user) {
      return
    }
    try {
      const response = await fetch('/api/signatures/user')
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.signature) {
          
          // Handle backward compatibility for old signatures
          const signature = {
            ...data.signature,
            useRandomIcon: data.signature.useRandomIcon !== undefined ? data.signature.useRandomIcon : false
          }
          
          setExistingSignature(signature)
          setIsEditMode(true)
          // Pre-populate form with existing data
          setName(signature.name || '')
          setMessage(signature.message || '')
          setUseRandomIcon(signature.useRandomIcon || false)
        } else {
          setIsEditMode(false)
          setExistingSignature(null)
        }
      }
    } catch (error) {
      console.error('Error checking existing signature:', error)
    }
  }

  // Load signatures function
  const loadSignatures = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      
      const response = await fetch(`/api/signatures?page=${page}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        // Convert createdAt strings back to Date objects
        const signaturesWithDates = (data.signatures || []).map((sig: any) => ({
          ...sig,
          createdAt: new Date(sig.createdAt)
        }))
        
        if (append) {
          setSignatures(prev => [...prev, ...signaturesWithDates])
        } else {
          setSignatures(signaturesWithDates)
        }
        
        // Update pagination state
        setCurrentPage(data.pagination?.page || page)
        setHasNextPage(data.pagination?.hasNext || false)
      } else {
        console.log('Signatures API returned:', response.status)
      }
    } catch (error) {
      console.error('Error loading signatures:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // Auto-fill name when user data is available (only if not in edit mode)
  useEffect(() => {
    if (isSignedIn && user && !name && !isEditMode) {
      const autoName = user.fullName || user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0] || ''
      setName(autoName)
    }
  }, [isSignedIn, user, name, isEditMode])

  // Check for existing signature when user signs in
  useEffect(() => {
    if (isSignedIn && user && isLoaded) {
      checkExistingSignature()
    }
  }, [isSignedIn, user, isLoaded])

  // Load signatures on component mount
  useEffect(() => {
    loadSignatures()
  }, [])

  if (isLoading || !isLoaded) {
    return <SignaturesPageSkeleton />
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
        <h1 className="text-4xl font-bold mb-4">Digital Signature Wall</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Leave your mark! Sign the wall with your GitHub, LinkedIn, or Google account and share your thoughts.
        </p>
      </motion.div>

      {/* Sign Wall Button */}
      {!isSigningMode && (
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="space-y-4">
            <Button onClick={handleSignWall} size="lg" className="px-8">
              <Heart className="mr-2 h-5 w-5" />
              {isEditMode ? 'Edit Signature' : 'Sign the Wall'}

            </Button>

          </div>
        </motion.div>
      )}

      {/* Signing Form */}
      {isSigningMode && (
        <motion.div
          className="max-w-md mx-auto mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{isEditMode ? 'Edit Signature' : 'Sign the Wall'}</CardTitle>
              <CardDescription>
                {isSignedIn && user
                  ? `Signed in as ${user.fullName || user.username || user.emailAddresses[0]?.emailAddress}` 
                  : 'Sign in with your preferred method and leave a message'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isSignedIn ? (
                <>
                  <div className="flex justify-center">
                    <SignInButton mode="modal">
                      <Button className="w-full">
                        Sign In to Leave Your Mark
                      </Button>
                    </SignInButton>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Sign in to leave your signature
                  </p>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Leave a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Profile Icon</Label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center border-2 border-purple-200 dark:border-purple-700">
                          {useRandomIcon ? (
                            <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          ) : user?.imageUrl ? (
                            <img 
                              src={user.imageUrl} 
                              alt={user.fullName || 'Profile'}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0"
                          onClick={() => setShowIconSelector(!showIconSelector)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                      {showIconSelector && (
                        <div className="flex items-center gap-2 p-2 border rounded-lg bg-background">
                          <Button
                            type="button"
                            size="sm"
                            variant={!useRandomIcon ? "default" : "outline"}
                            onClick={() => {
                              setUseRandomIcon(false)
                              setShowIconSelector(false)
                            }}
                            className="text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            OAuth Avatar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={useRandomIcon ? "default" : "outline"}
                            onClick={() => {
                              setUseRandomIcon(true)
                              setShowIconSelector(false)
                            }}
                            className="text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Random Icon
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowIconSelector(false)}
                            className="text-xs p-1"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitSignature} 
                      className="flex-1"
                      disabled={!message.trim() || !name.trim() || isSubmitting}
                    >
                      {isSubmitting ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Signature' : 'Submit Signature')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSigningMode(false)
                        setShowIconSelector(false)
                        if (isEditMode && existingSignature) {
                          // Reset to existing values
                          setName(existingSignature.name)
                          setMessage(existingSignature.message)
                          setUseRandomIcon(existingSignature.useRandomIcon || false)
                        } else {
                          // Reset to default values for new signature
                          setMessage('')
                          const autoName = user?.fullName || user?.username || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || ''
                          setName(autoName)
                          setUseRandomIcon(false)
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-muted-foreground">
                      Signed in via {user?.externalAccounts?.[0]?.provider || 'Clerk'}
                    </span>
                    <SignOutButton>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        Sign Out
                      </Button>
                    </SignOutButton>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Signatures Grid */}
      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {signatures.map((signature, index) => {
          const ProviderIcon = providerIcons[signature.provider]
          const providerColorClass = providerColors[signature.provider]

          return (
            <motion.div
              key={signature._id?.toString() || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center border-2 border-purple-200 dark:border-purple-700">
                      {signature.useRandomIcon || !signature.avatarUrl ? (
                        <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      ) : signature.avatarUrl ? (
                        <img 
                          src={signature.avatarUrl} 
                          alt={signature.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {signature.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{signature.name}</h3>
                        <div className="group">
                          <ProviderIcon className={`h-4 w-4 transition-colors ${providerColorClass}`} />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {signature.createdAt instanceof Date 
                          ? signature.createdAt.toLocaleDateString()
                          : new Date(signature.createdAt).toLocaleDateString()
                        }
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{signature.message}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Load More */}
      {hasNextPage && (
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button 
            variant="outline"
            onClick={() => loadSignatures(currentPage + 1, true)}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Load More Signatures'}
          </Button>
        </motion.div>
      )}
    </div>
  )
}