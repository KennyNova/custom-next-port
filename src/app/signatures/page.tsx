'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SignaturesPageSkeleton } from '@/components/ui/signatures-skeleton'
import { Github, Linkedin, Mail, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

const mockSignatures = [
  {
    id: '1',
    name: 'John Doe',
    message: 'Amazing work! Your portfolio inspired me to start my own coding journey.',
    provider: 'github' as const,
    avatarUrl: 'https://github.com/github.png',
    profileUrl: 'https://github.com/johndoe',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    message: 'Love the clean design and smooth animations. Great job!',
    provider: 'linkedin' as const,
    avatarUrl: 'https://github.com/github.png',
    profileUrl: 'https://linkedin.com/in/sarahwilson',
    createdAt: new Date('2024-01-14')
  },
  {
    id: '3',
    name: 'Mike Chen',
    message: 'The Gagguino project is incredible! Coffee and code - perfect combination.',
    provider: 'google' as const,
    avatarUrl: 'https://github.com/github.png',
    profileUrl: '#',
    createdAt: new Date('2024-01-13')
  }
]

const providerIcons = {
  github: Github,
  linkedin: Linkedin,
  google: Mail
}

const providerColors = {
  github: 'text-gray-900 dark:text-gray-100',
  linkedin: 'text-blue-600',
  google: 'text-red-500'
}

export default function SignaturesPage() {
  const { data: session, status } = useSession()
  const [isSigningMode, setIsSigningMode] = useState(false)
  const [message, setMessage] = useState('')
  const [signatures, setSignatures] = useState(mockSignatures)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleSignWall = () => {
    if (session) {
      setIsSigningMode(true)
    } else {
      // User needs to sign in first
      setIsSigningMode(true)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    try {
      await signIn(provider, { 
        callbackUrl: '/signatures',
        redirect: false 
      })
    } catch (error) {
      console.error('OAuth sign in error:', error)
    }
  }

  const handleSubmitSignature = async () => {
    if (!session || !message.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: (session.user as any)?.id || session.user?.email,
          name: session.user?.name || 'Anonymous',
          message: message.trim(),
          provider: (session as any).account?.provider || 'unknown',
          profileUrl: session.user?.image || '',
          avatarUrl: session.user?.image || '',
        }),
      })

      if (response.ok) {
        // Refresh signatures list
        const newSignature = {
          id: Date.now().toString(),
          name: session.user?.name || 'Anonymous',
          message: message.trim(),
          provider: ((session as any).account?.provider || 'unknown') as 'github' | 'google' | 'linkedin',
          avatarUrl: session.user?.image || '',
          profileUrl: session.user?.image || '',
          createdAt: new Date()
        }
        setSignatures(prev => [newSignature, ...prev])
        setMessage('')
        setIsSigningMode(false)
      } else {
        const error = await response.json()
        console.error('Error submitting signature:', error)
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error submitting signature:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Load signatures on component mount
  useEffect(() => {
    const loadSignatures = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/signatures')
        if (response.ok) {
          const data = await response.json()
          setSignatures(data.signatures || [])
        }
        // Small delay to show skeleton briefly for better UX
        await new Promise(resolve => setTimeout(resolve, 600))
      } catch (error) {
        console.error('Error loading signatures:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSignatures()
  }, [])

  if (isLoading) {
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
          <Button onClick={handleSignWall} size="lg" className="px-8">
            <Heart className="mr-2 h-5 w-5" />
            Sign the Wall
          </Button>
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
              <CardTitle>Sign the Wall</CardTitle>
              <CardDescription>
                {session 
                  ? `Signed in as ${session.user?.name || session.user?.email}` 
                  : 'Choose your preferred login method and leave a message'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      className="p-3"
                      onClick={() => handleOAuthSignIn('github')}
                    >
                      <Github className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="p-3"
                      onClick={() => handleOAuthSignIn('linkedin')}
                    >
                      <Linkedin className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="p-3"
                      onClick={() => handleOAuthSignIn('google')}
                    >
                      <Mail className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Sign in to leave your signature
                  </p>
                </>
              ) : (
                <>
                  <Textarea
                    placeholder="Leave a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitSignature} 
                      className="flex-1"
                      disabled={!message.trim() || isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Signature'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSigningMode(false)
                        setMessage('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-muted-foreground">
                      Signed in via {(session as any).account?.provider || 'OAuth'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </Button>
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
              key={signature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {signature.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{signature.name}</h3>
                        <ProviderIcon className={`h-4 w-4 ${providerColorClass}`} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {signature.createdAt.toLocaleDateString()}
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
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Button variant="outline">
          Load More Signatures
        </Button>
      </motion.div>
    </div>
  )
}