'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, Code2, PenTool, Puzzle, Calendar, Rocket, Sparkles } from 'lucide-react'

export default function HomePage() {
  // Prefetch projects data when the home page loads
  useEffect(() => {
    const prefetchProjects = async () => {
      try {
        // Prefetch featured projects specifically for better performance
        await fetch('/api/projects?featured=true')
        // Also prefetch all projects for when users navigate to projects page
        await fetch('/api/projects')
      } catch (error) {
        // Silently fail - prefetching is not critical
        console.log('Projects prefetch failed:', error)
      }
    }

    prefetchProjects()
  }, [])
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="pb-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pastel-rose via-pastel-lavender to-pastel-mint bg-clip-text text-transparent animate-float leading-tight py-2">
            Welcome to My World
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-scale-in">
          Discover my professional work, personal projects, and creative journey through technology and innovation.
        </p>
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
                <Code2 className="h-8 w-8 text-primary mb-2 animate-glow" />
                <CardTitle className="text-primary">Projects</CardTitle>
                <CardDescription>
                  Explore my professional work, GitHub projects, and home lab setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/projects" className="w-full" prefetch={true}>
                  <Button variant="default" className="w-full group">
                    <Code2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    View Projects
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
              <CardHeader>
                <PenTool className="h-8 w-8 text-primary mb-2 animate-pulse" />
                <CardTitle className="text-primary">Blog</CardTitle>
                <CardDescription>
                  Read insights, experiences, and technical articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/blog" className="w-full">
                  <Button variant="default" className="w-full group">
                    <PenTool className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    Read Blog
                  </Button>
                </Link>
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
                <Link href="/quiz" className="w-full">
                  <Button variant="info" className="w-full group">
                    <Puzzle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    Take Quiz
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2 animate-pulse" />
                <CardTitle className="text-primary">Book Consultation</CardTitle>
                <CardDescription>
                  Schedule a meeting to discuss your project needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/consultation" className="w-full">
                  <Button variant="success" className="w-full group">
                    <Calendar className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    Book Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}