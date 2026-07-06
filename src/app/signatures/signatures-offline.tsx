'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SignaturesPageSkeleton } from '@/components/ui/signatures-skeleton'
import { Github, Linkedin } from 'lucide-react'

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width="16" height="16">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const providerIcons = {
  github: Github,
  linkedin: Linkedin,
  google: GoogleIcon,
  clerk: User,
}

const providerColors = {
  github: 'text-gray-600 dark:text-gray-400',
  linkedin: 'text-blue-500 dark:text-blue-400',
  google: '',
  clerk: 'text-purple-500 dark:text-purple-400',
}

type SignatureItem = {
  _id: string
  name: string
  message: string
  provider: keyof typeof providerIcons
  avatarUrl?: string
  useRandomIcon?: boolean
  createdAt: Date
}

export function SignaturesOffline() {
  const [signatures, setSignatures] = useState<SignatureItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadSignatures = async (page = 1, append = false) => {
    try {
      if (!append) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }

      const response = await fetch(`/api/signatures?page=${page}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        const signaturesWithDates = (data.signatures || []).map((sig: SignatureItem) => ({
          ...sig,
          createdAt: new Date(sig.createdAt),
        }))

        setSignatures((prev) => (append ? [...prev, ...signaturesWithDates] : signaturesWithDates))
        setCurrentPage(data.pagination?.page || page)
        setHasNextPage(data.pagination?.hasNext || false)
      }
    } catch (error) {
      console.error('Error loading signatures:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    loadSignatures()
  }, [])

  if (isLoading) {
    return <SignaturesPageSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold mb-4">Digital Signature Wall</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Leave your mark! Sign the wall with your GitHub, LinkedIn, or Google account and share your thoughts.
        </p>
      </motion.div>

      <div className="mb-8 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
        Clerk is not configured in development, so sign-in is disabled. Add real Clerk keys to
        {' '}
        <code className="rounded bg-black/10 px-1 dark:bg-white/10">.env.local</code>
        {' '}
        to test authentication.
      </div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
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
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={signature.avatarUrl}
                          alt={signature.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      )}
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

      {hasNextPage && (
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={() => loadSignatures(currentPage + 1, true)}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Load More Signatures'}
          </Button>
        </div>
      )}
    </div>
  )
}
