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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <div className="mb-8">
        <Skeleton className="h-10 w-32" />
      </div>

      <article>
        {/* Header */}
        <header className="mb-8 space-y-6">
          {/* Title */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-4/5" />
          </div>
          
          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </header>

        {/* Content */}
        <Card>
          <CardContent className="p-8 space-y-4">
            {/* Content paragraphs */}
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
            
            {/* Code block placeholder */}
            <div className="my-6">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            
            {/* More content */}
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i + 8} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </footer>
      </article>
    </div>
  )
}

// Progressive loading skeletons for blog detail page
export function BlogMetadataSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Skeleton className="h-10 w-32" />
      </motion.div>

      <article>
        {/* Header - loads instantly with metadata */}
        <motion.header
          className="mb-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Title */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-4/5" />
          </div>
          
          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </motion.header>
      </article>
    </div>
  )
}

export function BlogContentSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <Card>
        <CardContent className="p-8 space-y-4">
          {/* Loading indicator */}
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm">Loading article content...</span>
            </div>
          </div>
          
          {/* Content placeholder with shimmer effect */}
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full animate-pulse" />
              <Skeleton className="h-4 w-full animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
              <Skeleton className="h-4 w-3/4 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            </div>
          ))}
          
          {/* Code block placeholder */}
          <div className="my-6">
            <Skeleton className="h-32 w-full rounded-lg animate-pulse" />
          </div>
          
          {/* More content with staggered animation */}
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i + 12} className="space-y-2">
              <Skeleton className="h-4 w-full animate-pulse" style={{ animationDelay: `${(i + 12) * 75}ms` }} />
              <Skeleton className="h-4 w-5/6 animate-pulse" style={{ animationDelay: `${(i + 12) * 100}ms` }} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Footer skeleton */}
      <footer className="mt-12 pt-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

// Enhanced skeleton for when metadata is available but content is loading
export function BlogProgressiveLoadingSkeleton({ metadata }: { metadata: any }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Skeleton className="h-10 w-32" />
      </motion.div>

      <article>
        {/* Header - actual data from preloaded metadata */}
        <motion.header
          className="mb-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {metadata.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>📅</span>
              <span>{new Date(metadata.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{metadata.readingTime} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{metadata.metadata?.views || 0} views</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {metadata.tags?.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </motion.header>

        {/* Content skeleton - while content loads */}
        <BlogContentSkeleton />
      </article>
    </div>
  )
}
