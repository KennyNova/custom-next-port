'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HomepageSkeleton } from '@/components/ui/homepage-skeleton'
import { PreloadLink } from '@/components/ui/preload-link'
import WhispyBackground from '@/components/layout/whispy-background'
import { useTheme } from '@/components/providers/theme-provider'
import Link from 'next/link'
import { ArrowRight, Code2, PenTool, Puzzle, Calendar, Rocket, Sparkles, Workflow } from 'lucide-react'

export default function HomePage() {
  const [isPrefetching, setIsPrefetching] = useState(false)
  const { theme } = useTheme()

  // Prefetch projects data in background after page loads (non-blocking)
  useEffect(() => {
    const prefetchProjects = async () => {
      try {
        setIsPrefetching(true)
        
        // Prefetch in background - don't block page rendering
        const results = await Promise.allSettled([
          fetch('/api/projects?featured=true'),
          fetch('/api/projects'),
          fetch('/api/blog')
        ])
        
        // Log any failed requests for debugging
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const endpoints = ['/api/projects?featured=true', '/api/projects', '/api/blog']
            console.log(`Background prefetch failed for ${endpoints[index]}:`, result.reason)
          } else {
            const endpoints = ['/api/projects?featured=true', '/api/projects', '/api/blog']
            console.log(`✅ Background prefetch successful for ${endpoints[index]}`)
          }
        })
      } catch (error) {
        console.log('Background prefetch failed:', error)
      } finally {
        setIsPrefetching(false)
      }
    }

    // Start prefetching after a short delay to allow page to render first
    const timer = setTimeout(prefetchProjects, 100)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="relative">
      <WhispyBackground />
      
      {/* Optional: Small loading indicator for background prefetching */}
      {isPrefetching && (
        <div className="fixed bottom-4 left-4 z-50 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary/60 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Preloading...</span>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 relative z-10">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="pb-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight py-2 bg-gradient-to-r bg-clip-text text-transparent
            /* Light theme gradient */
            from-blue-600 via-purple-600 to-blue-800
            /* Dark theme gradient */
            dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400
            /* Pastel theme gradient with better contrast */
            pastel:from-pink-600 pastel:via-purple-500 pastel:to-teal-600
            /* Coffee theme gradient */
            coffee:from-coffee-espresso coffee:via-coffee-cinnamon coffee:to-coffee-caramel
            /* Developer theme gradient */
            developer:from-matrix-green developer:via-matrix-bright developer:to-matrix-glow
            /* Fallback for non-gradient support */
            [&:not(.bg-clip-text)]:text-foreground
            /* Theme-specific animations */
            animate-float
            developer:animate-matrix-flicker
            coffee:animate-coffee-aroma">
            The Practical Cinematic Engineer
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-scale-in">
          A blend of technical rigor and visual craft 
        </p>
        <p className="text-lg italic md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-scale-in">for makers who enjoy both</p>
        
        
        {theme === 'coffee' && (
          <div className="absolute inset-0 pointer-events-none flex justify-center">
            <div className="relative">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-8 bg-coffee-caramel/30 rounded-full animate-coffee-steam"
                  style={{
                    left: `${-10 + i * 10}px`,
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-scale-in">
          {/* Main CTA Button - Explore My Work */}
          <Link href="/projects" prefetch={true}>
            <Button 
              size="xl" 
              variant="gradient"
              className="group font-semibold px-8 py-4 h-auto rounded-2xl"
            >
              <Rocket className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
              Explore My Work 
              <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
              
              {/* Simple shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
            </Button>
          </Link>

          {/* Secondary CTA Button - Book Consultation */}
          <Link href="/consultation">
            <Button 
              size="xl" 
              variant="outline"
              className="group font-semibold px-8 py-4 h-auto rounded-2xl"
            >
              <Sparkles className="mr-3 h-5 w-5 transition-transform group-hover:rotate-12" />
              Book Consultation
              <Calendar className="ml-3 h-4 w-4 transition-transform group-hover:scale-110" />
              
              {/* Simple shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <h2 className="text-3xl font-bold text-center mb-12">What You'll Find Here</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
              <CardHeader>
                <Code2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-primary">Projects</CardTitle>
                <CardDescription>
                  Explore my professional work, GitHub projects, and home lab setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PreloadLink href="/projects" className="w-full">
                  <Button variant="default" className="w-full group">
                    <Code2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    View Projects
                  </Button>
                </PreloadLink>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
              <CardHeader>
                <PenTool className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-primary">Blog</CardTitle>
                <CardDescription>
                  Read insights, experiences, and technical articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PreloadLink href="/blog" className="w-full">
                  <Button variant="default" className="w-full group">
                    <PenTool className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    Read Blog
                  </Button>
                </PreloadLink>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
              <CardHeader>
                <Puzzle className="h-8 w-8 text-primary mb-2 animate-bounce" />
                <CardTitle className="text-primary">Consultation Quiz</CardTitle>
                <CardDescription>
                  Discover how we can work together through interactive questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/quiz">
                  <Button variant="info" className="w-full group">
                    <Puzzle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    Take Quiz
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <Card className="h-full transition-all duration-300 border-2 opacity-50 blur-sm pointer-events-none grayscale">
              <CardHeader>
                <Workflow className="h-8 w-8 text-muted-foreground mb-2" />
                <CardTitle className="text-muted-foreground">n8n Templates</CardTitle>
                <CardDescription>
                  {/* Ready-to-use automation workflows for common business processes */}
                  Nice try! If you must know its n8n templates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full group" disabled>
                  <Workflow className="mr-2 h-4 w-4" />
                  Browse Templates
                </Button>
              </CardContent>
            </Card>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/90 backdrop-blur-sm rounded-lg px-6 py-4 border shadow-lg">
                <p className="text-lg font-semibold text-foreground">Coming Soon 🤫</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}