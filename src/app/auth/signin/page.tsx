'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Github, Linkedin, Mail, ArrowLeft } from 'lucide-react'
import { signIn, getProviders } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'

interface Provider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

const providerIcons = {
  github: Github,
  google: Mail,
  linkedin: Linkedin,
}

const providerColors = {
  github: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  google: 'hover:bg-red-50 dark:hover:bg-red-950',
  linkedin: 'hover:bg-blue-50 dark:hover:bg-blue-950',
}

function SignInContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')
  
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)

  useEffect(() => {
    const loadProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    loadProviders()
  }, [])

  const handleSignIn = async (providerId: string) => {
    try {
      await signIn(providerId, { callbackUrl })
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={callbackUrl}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <motion.div
                className="p-4 rounded-md bg-destructive/10 border border-destructive/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-sm text-destructive">
                  {error === 'OAuthSignin' && 'Error occurred during sign in.'}
                  {error === 'OAuthCallback' && 'Error occurred during callback.'}
                  {error === 'OAuthCreateAccount' && 'Could not create account.'}
                  {error === 'EmailCreateAccount' && 'Could not create account.'}
                  {error === 'Callback' && 'Error occurred during callback.'}
                  {error === 'OAuthAccountNotLinked' && 'Account is already linked to another user.'}
                  {error === 'EmailSignin' && 'Check your email for a sign in link.'}
                  {error === 'CredentialsSignin' && 'Invalid credentials.'}
                  {error === 'SessionRequired' && 'Please sign in to access this page.'}
                  {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'EmailCreateAccount', 'Callback', 'OAuthAccountNotLinked', 'EmailSignin', 'CredentialsSignin', 'SessionRequired'].includes(error) && 'An error occurred during sign in.'}
                </p>
              </motion.div>
            )}

            <div className="space-y-3">
              {providers && Object.values(providers).map((provider, index) => {
                if (provider.type !== 'oauth') return null
                
                const Icon = providerIcons[provider.id as keyof typeof providerIcons] || Mail
                const colorClass = providerColors[provider.id as keyof typeof providerColors] || 'hover:bg-gray-100 dark:hover:bg-gray-800'

                return (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className={`w-full justify-start gap-3 h-12 ${colorClass}`}
                      onClick={() => handleSignIn(provider.id)}
                    >
                      <Icon className="h-5 w-5" />
                      Continue with {provider.name}
                    </Button>
                  </motion.div>
                )
              })}
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>

        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <p className="text-sm text-muted-foreground">
            New to our platform?{' '}
            <Link href="/about" className="text-primary hover:underline">
              Learn more about what we offer
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Loading...</CardTitle>
              <CardDescription>
                Please wait while we prepare the sign in page
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}