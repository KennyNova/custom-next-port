import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

export function BlogPostCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-6 w-4/5" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </CardContent>
    </Card>
  )
}

export function BlogPostGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <BlogPostCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function BlogPostDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Container */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            {/* Back Button */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Skeleton className="h-10 w-32" />
            </motion.div>

            <article className="space-y-8">
              {/* Enhanced Header */}
              <motion.header
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="space-y-4">
                  {/* Large gradient title skeleton */}
                  <div className="space-y-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-4/5" />
                  </div>
                  
                  {/* Excerpt skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                </div>
                
                {/* Article Meta - Enhanced */}
                <div className="flex flex-wrap items-center gap-6 py-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-16 rounded-md" />
                  <Skeleton className="h-7 w-20 rounded-md" />
                  <Skeleton className="h-7 w-14 rounded-md" />
                  <Skeleton className="h-7 w-18 rounded-md" />
                </div>

                {/* Action buttons - Enhanced */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </motion.header>

              {/* Enhanced Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <Card className="overflow-hidden border-0 shadow-lg bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-8 lg:p-12 space-y-6">
                    {/* Content paragraphs with better spacing */}
                    {Array.from({ length: 6 }, (_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-4/5" />
                      </div>
                    ))}
                    
                    {/* Enhanced code block placeholder */}
                    <div className="my-8">
                      <div className="space-y-3">
                        {/* Code block header */}
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-t-lg">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <div className="flex gap-1">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-6 w-6 rounded" />
                          </div>
                        </div>
                        {/* Code content */}
                        <Skeleton className="h-40 w-full rounded-b-lg" />
                      </div>
                    </div>
                    
                    {/* More content */}
                    {Array.from({ length: 4 }, (_, i) => (
                      <div key={i + 6} className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-5 w-3/4" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Author Bio Skeleton */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-muted/30 rounded-lg p-6"
              >
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex gap-3">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Related Articles Skeleton */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                <Skeleton className="h-8 w-48" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-4/5" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="flex gap-1">
                        <Skeleton className="h-5 w-12 rounded" />
                        <Skeleton className="h-5 w-16 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Enhanced Footer */}
              <motion.footer
                className="mt-16 pt-8 border-t border-border/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex gap-3">
                      <Skeleton className="h-8 w-28" />
                      <Skeleton className="h-8 w-36" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-24" />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-8 w-28" />
                    </div>
                  </div>
                </div>
              </motion.footer>
            </article>
          </div>

          {/* Desktop Table of Contents Skeleton */}
          <aside className="hidden xl:block flex-shrink-0">
            <div className="sticky top-24 w-64 h-[calc(100vh-6rem)] overflow-hidden bg-card/80 backdrop-blur-sm border rounded-lg flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
              
              {/* Scrollable TOC Items */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2 space-y-2 min-h-0">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="flex items-center gap-2 p-2" style={{ paddingLeft: `${Math.random() * 24 + 8}px` }}>
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
              
              {/* Sticky Reading Progress at Bottom */}
              <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t p-4 mt-auto space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile TOC Button Skeleton */}
      <div className="xl:hidden fixed bottom-4 right-4">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    </div>
  )
}

// Progressive loading skeletons for blog detail page
export function BlogMetadataSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 max-w-7xl mx-auto">
          <div className="flex-1 max-w-4xl">
            {/* Back Button */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Skeleton className="h-10 w-32" />
            </motion.div>

            <article className="space-y-8">
              {/* Header - loads instantly with metadata */}
              <motion.header
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="space-y-4">
                  {/* Large gradient title skeleton */}
                  <div className="space-y-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-4/5" />
                  </div>
                  
                  {/* Excerpt skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                </div>
                
                {/* Article Meta - Enhanced */}
                <div className="flex flex-wrap items-center gap-6 py-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-16 rounded-md" />
                  <Skeleton className="h-7 w-20 rounded-md" />
                  <Skeleton className="h-7 w-14 rounded-md" />
                  <Skeleton className="h-7 w-18 rounded-md" />
                </div>

                {/* Action buttons - Enhanced */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </motion.header>
            </article>
          </div>

          {/* Desktop TOC Skeleton */}
          <aside className="hidden xl:block flex-shrink-0">
            <div className="sticky top-24 w-64 h-[calc(100vh-6rem)] overflow-hidden bg-card/80 backdrop-blur-sm border rounded-lg flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
              
              {/* Scrollable TOC Items */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2 space-y-2 min-h-0">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex items-center gap-2 p-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
              
              {/* Sticky Reading Progress at Bottom */}
              <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t p-4 mt-auto space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export function BlogContentSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative"
    >
      <Card className="overflow-hidden border-0 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardContent className="p-8 lg:p-12 space-y-6">
          {/* Loading indicator */}
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm">Loading article content...</span>
            </div>
          </div>
          
          {/* Content placeholder with shimmer effect */}
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-full animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
              <Skeleton className="h-5 w-full animate-pulse" style={{ animationDelay: `${i * 75}ms` }} />
              <Skeleton className="h-5 w-4/5 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            </div>
          ))}
          
          {/* Enhanced code block placeholder */}
          <div className="my-8">
            <div className="space-y-3">
              {/* Code block header */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded animate-pulse" />
                  <Skeleton className="h-4 w-20 animate-pulse" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-6 w-6 rounded animate-pulse" />
                  <Skeleton className="h-6 w-6 rounded animate-pulse" />
                </div>
              </div>
              {/* Code content */}
              <Skeleton className="h-40 w-full rounded-b-lg animate-pulse" />
            </div>
          </div>
          
          {/* More content with staggered animation */}
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i + 8} className="space-y-3">
              <Skeleton className="h-5 w-full animate-pulse" style={{ animationDelay: `${(i + 8) * 75}ms` }} />
              <Skeleton className="h-5 w-5/6 animate-pulse" style={{ animationDelay: `${(i + 8) * 100}ms` }} />
              <Skeleton className="h-5 w-3/4 animate-pulse" style={{ animationDelay: `${(i + 8) * 125}ms` }} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Author Bio Skeleton */}
      <div className="bg-muted/30 rounded-lg p-6 my-8">
        <div className="flex items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-full flex-shrink-0 animate-pulse" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-40 animate-pulse" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full animate-pulse" />
              <Skeleton className="h-4 w-3/4 animate-pulse" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-8 w-20 animate-pulse" />
              <Skeleton className="h-8 w-20 animate-pulse" />
              <Skeleton className="h-8 w-24 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles Skeleton */}
      <div className="space-y-6 my-12">
        <Skeleton className="h-8 w-48 animate-pulse" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-5 w-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
              <Skeleton className="h-5 w-4/5 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                <Skeleton className="h-4 w-3/4 animate-pulse" style={{ animationDelay: `${i * 250}ms` }} />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16 animate-pulse" />
                <Skeleton className="h-3 w-2 animate-pulse" />
                <Skeleton className="h-3 w-16 animate-pulse" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-5 w-12 rounded animate-pulse" />
                <Skeleton className="h-5 w-16 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Footer skeleton */}
      <footer className="mt-16 pt-8 border-t border-border/50">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 animate-pulse" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full animate-pulse" />
              <Skeleton className="h-4 w-3/4 animate-pulse" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-8 w-28 animate-pulse" />
              <Skeleton className="h-8 w-36 animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-5 w-24 animate-pulse" />
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-8 w-32 animate-pulse" />
              <Skeleton className="h-8 w-28 animate-pulse" />
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

// Enhanced skeleton for when metadata is available but content is loading
export function BlogProgressiveLoadingSkeleton({ metadata }: { metadata: any }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Container */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            {/* Back Button */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Skeleton className="h-10 w-32" />
            </motion.div>

            <article className="space-y-8">
              {/* Header - actual data from preloaded metadata */}
              <motion.header
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {metadata.title}
                  </h1>
                  
                  {metadata.excerpt && (
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                      {metadata.excerpt}
                    </p>
                  )}
                </div>
                
                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-6 py-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Nav Chaganti</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(metadata.publishedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{metadata.readingTime} min read</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{metadata.metadata?.views || 0} views</span>
                  </div>
                </div>

                {/* Tags */}
                {metadata.tags && metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-md hover:bg-primary/10 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action buttons skeleton */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </motion.header>

              {/* Content skeleton - while content loads */}
              <BlogContentSkeleton />
            </article>
          </div>

          {/* Desktop Table of Contents Skeleton */}
          <aside className="hidden xl:block flex-shrink-0">
            <div className="sticky top-24 w-64 h-[calc(100vh-6rem)] overflow-hidden bg-card/80 backdrop-blur-sm border rounded-lg flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
              
              {/* Scrollable TOC Items */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2 space-y-2 min-h-0">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center gap-2 p-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
              
              {/* Sticky Reading Progress at Bottom */}
              <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t p-4 mt-auto space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile TOC Button Skeleton */}
      <div className="xl:hidden fixed bottom-4 right-4">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    </div>
  )
}
