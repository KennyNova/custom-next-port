'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BlogPostDetailSkeleton, 
  BlogMetadataSkeleton, 
  BlogContentSkeleton, 
  BlogProgressiveLoadingSkeleton 
} from '@/components/ui/blog-skeleton'
import { usePreload } from '@/lib/hooks/use-preload'
import { Calendar, Clock, ArrowLeft, Heart, Share2, Eye, User, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { BlogPost } from '@/types'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { ReadingProgress } from '@/components/ui/reading-progress'
import { FloatingActionBar, AuthorBio, RelatedArticles } from '@/components/ui/blog-enhancements'

export default function BlogPostPage() {
  const params = useParams()
  const { getCachedMetadata, loadBlogContent } = usePreload()
  
  // Progressive loading states
  const [metadata, setMetadata] = useState<any>(null)
  const [content, setContent] = useState<any>(null)
  const [loadingMetadata, setLoadingMetadata] = useState(true)
  const [loadingContent, setLoadingContent] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likes, setLikes] = useState(0)

  useEffect(() => {
    if (!params.slug) return

    // 1. Check for cached metadata first (from hover preload)
    const cachedMetadata = getCachedMetadata(params.slug as string)
    if (cachedMetadata) {
      setMetadata(cachedMetadata)
      setLoadingMetadata(false)
      console.log(`⚡ Using preloaded metadata for: ${params.slug}`)
    }

    // 2. Load metadata if not cached
    if (!cachedMetadata) {
      loadMetadata()
    }

    // 3. Always load content (happens in parallel)
    loadContent()
  }, [params.slug, getCachedMetadata])

  const loadMetadata = async () => {
    try {
      const response = await fetch(`/api/blog/${params.slug}/metadata`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Blog post not found')
        } else {
          setError('Failed to fetch blog post metadata')
        }
        return
      }
      const data = await response.json()
      setMetadata(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching blog metadata:', err)
      setError('Failed to load blog post metadata')
    } finally {
      setLoadingMetadata(false)
    }
  }

  const loadContent = async () => {
    try {
      const contentData = await loadBlogContent(params.slug as string)
      if (contentData) {
        setContent(contentData)
        setError(null)
      } else {
        setError('Failed to load blog post content')
      }
    } catch (err) {
      console.error('Error loading blog content:', err)
      setError('Failed to load blog post content')
    } finally {
      setLoadingContent(false)
    }
  }

  // Initialize likes from metadata
  useEffect(() => {
    if (metadata?.metadata?.likes) {
      setLikes(metadata.metadata.likes)
    }
  }, [metadata])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
    // Here you would typically make an API call to update the like count
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // Here you would typically make an API call to save/remove bookmark
  }

  // Progressive loading states
  if (loadingMetadata) {
    return <BlogMetadataSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button asChild variant="outline">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // If we have metadata but content is still loading, show progressive skeleton
  if (metadata && loadingContent) {
    return <BlogProgressiveLoadingSkeleton metadata={metadata} />
  }

  // Both metadata and content are loaded
  if (!metadata || !content) {
    return <BlogPostDetailSkeleton />
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <ReadingProgress content={content.content} />
      
      {/* Main Container */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div className="w-full">
            {/* Back Button */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button variant="ghost" asChild className="group">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Blog
                </Link>
              </Button>
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
                    <User className="h-4 w-4" />
                    <span className="font-medium">Nav Chaganti</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(metadata.publishedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{metadata.readingTime} min read</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{metadata.metadata?.views || 0} views</span>
                  </div>
                </div>

                {/* Tags */}
                {metadata.tags && metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="hover:bg-primary/10 transition-colors">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={`group ${isLiked ? 'text-red-500 border-red-200' : ''}`}
                    onClick={handleLike}
                  >
                    <Heart className={`mr-2 h-4 w-4 group-hover:text-red-500 transition-colors ${isLiked ? 'fill-current' : ''}`} />
                    Like ({likes})
                  </Button>
                  <Button size="sm" variant="outline" className="group">
                    <Share2 className="mr-2 h-4 w-4 group-hover:text-blue-500 transition-colors" />
                    Share
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={`group ${isBookmarked ? 'text-yellow-500 border-yellow-200' : ''}`}
                    onClick={handleBookmark}
                  >
                    <BookOpen className={`mr-2 h-4 w-4 group-hover:text-green-500 transition-colors ${isBookmarked ? 'fill-current' : ''}`} />
                    Save for Later
                  </Button>
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
                  <CardContent className="p-8 lg:p-12">
                    <MarkdownContent content={content.content} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Author Bio */}
              <AuthorBio />

              {/* Related Articles - You can populate this with actual related articles */}
              <RelatedArticles articles={[]} />

              {/* Enhanced Footer */}
              <motion.footer
                className="mt-16 pt-8 border-t border-border/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Enjoyed this article?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Follow me for more insights on web development, technology, and building amazing user experiences.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="default" size="sm">
                        Follow for More
                      </Button>
                      <Button variant="outline" size="sm">
                        Subscribe to Newsletter
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Navigation</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" size="sm" className="justify-start">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous Post
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        Next Post
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.footer>
            </article>
          </div>
        </div>
      </div>

      {/* Floating Action Bar for Mobile */}
      <FloatingActionBar
        title={metadata.title}
        url={`/blog/${params.slug}`}
        onLike={handleLike}
        onBookmark={handleBookmark}
        likes={likes}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
      />
    </div>
  )
}