'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HomepageSkeleton } from '@/components/ui/homepage-skeleton'
import { PreloadLink } from '@/components/ui/preload-link'
import WhispyBackground from '@/components/layout/whispy-background'
import Link from 'next/link'
import { ArrowRight, Code2, PenTool, Puzzle, Calendar, Rocket, Sparkles, Workflow, HelpCircle, Clock, Target, Zap, X } from 'lucide-react'

// Quiz popup component
const QuizPopup = ({ isOpen, onClose, onStartQuiz }: {
  isOpen: boolean
  onClose: () => void
  onStartQuiz: () => void
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <Card className="relative border-2 border-primary/20 bg-background/95 backdrop-blur-xl shadow-2xl">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Not Sure What You Need?</CardTitle>
                <CardDescription>
                  Take our quick quiz to discover the perfect solution for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Takes just 2-3 minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Get personalized recommendations</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Discover services you might not know you need</span>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={onStartQuiz} className="flex-1">
                      <Zap className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Button>
                    <Button variant="outline" onClick={onClose} className="flex-1">
                      Maybe Later
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Floating Quiz Icon component
const FloatingQuizIcon = ({ isVisible, onClick }: {
  isVisible: boolean
  onClick: () => void
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <Button
            onClick={onClick}
            size="lg"
            className="group relative h-14 w-14 rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <HelpCircle className="h-6 w-6 text-primary-foreground transition-transform group-hover:scale-110" />
            
            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-blue-600 animate-ping opacity-20"></div>
            
            {/* Hover shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out rounded-full"></div>
          </Button>
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-2 text-sm font-medium shadow-lg whitespace-nowrap"
          >
            Need help choosing? Take our quiz!
            <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-l-4 border-l-background/95 border-y-4 border-y-transparent"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function HomePage() {
  const [isPrefetching, setIsPrefetching] = useState(false)
  const [showQuizPopup, setShowQuizPopup] = useState(false)
  const [showQuizIcon, setShowQuizIcon] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [popupHasBeenShown, setPopupHasBeenShown] = useState(false)
  const [timeTriggered, setTimeTriggered] = useState(false)

  // Debug component mount
  useEffect(() => {
    console.log('🏠 HomePage mounted, starting quiz timers...')
  }, [])

  // Debug state changes
  useEffect(() => {
    console.log('🔍 State update:', {
      showQuizPopup,
      showQuizIcon,
      hasScrolled,
      popupHasBeenShown,
      timeTriggered
    })
  }, [showQuizPopup, showQuizIcon, hasScrolled, popupHasBeenShown, timeTriggered])

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

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0 && !hasScrolled) {
        console.log('📜 User scrolled past 200px, triggering scroll state')
        setHasScrolled(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasScrolled])

  // Show quiz popup/icon after 3 seconds of scrolling OR 7 seconds without scrolling
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (hasScrolled && !popupHasBeenShown) {
      // User scrolled - show popup after 3 seconds
      console.log('🚀 User scrolled, setting 3-second timer for popup')
      timer = setTimeout(() => {
        console.log('⏰ 3 seconds elapsed, showing quiz popup')
        setShowQuizPopup(true)
        setPopupHasBeenShown(true)
      }, 3000)
    } else if (!hasScrolled && !timeTriggered && !popupHasBeenShown) {
      // User hasn't scrolled - show icon after 7 seconds
      console.log('⏱️ User hasnt scrolled, setting 7-second timer for icon')
      timer = setTimeout(() => {
        console.log('⏰ 7 seconds elapsed, showing quiz icon')
        setShowQuizIcon(true)
        setTimeTriggered(true)
      }, 7000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [hasScrolled, popupHasBeenShown, timeTriggered])

  // Show icon when popup is closed or when time trigger activates
  useEffect(() => {
    if (popupHasBeenShown && !showQuizPopup) {
      setShowQuizIcon(true)
    }
  }, [popupHasBeenShown, showQuizPopup])

  const handleStartQuiz = () => {
    setShowQuizPopup(false)
    window.location.href = '/quiz'
  }

  const handleClosePopup = () => {
    setShowQuizPopup(false)
    setPopupHasBeenShown(true)
    setShowQuizIcon(true)
  }

  const handleOpenPopup = () => {
    setShowQuizPopup(true)
  }
  
  return (
    <div className="relative">
      <WhispyBackground />
      
      {/* Optional: Small loading indicator for background prefetching */}
      {isPrefetching && (
        <div className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border shadow-lg">
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
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-float leading-tight py-2 bg-gradient-to-r bg-clip-text text-transparent
            /* Light theme gradient */
            from-blue-600 via-purple-600 to-blue-800
            /* Dark theme gradient */
            dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400
            /* Pastel theme gradient with better contrast */
            pastel:from-pink-600 pastel:via-purple-500 pastel:to-teal-600
            /* Fallback for non-gradient support */
            [&:not(.bg-clip-text)]:text-foreground">
            The Practical Cinematic Engineer
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-scale-in">
          A blend of technical rigor and visual craft 
        </p>
        <p className="text-lg italic md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-scale-in">for makers who enjoy both</p>
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
      
      {/* Quiz Popup */}
      <QuizPopup
        isOpen={showQuizPopup}
        onClose={handleClosePopup}
        onStartQuiz={handleStartQuiz}
      />
      
      {/* Floating Quiz Icon */}
      <FloatingQuizIcon
        isVisible={showQuizIcon && !showQuizPopup}
        onClick={handleOpenPopup}
      />
    </div>
  )
}