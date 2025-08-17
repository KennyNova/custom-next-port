'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BlogPostDetailSkeleton, 
  BlogMetadataSkeleton, 
  BlogContentSkeleton, 
  BlogProgressiveLoadingSkeleton 
} from '@/components/ui/blog-skeleton'
import { usePreload } from '@/lib/hooks/use-preload'
import { Calendar, Clock, ArrowLeft, Heart, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { BlogPost } from '@/types'
// @ts-ignore
import ReactMarkdown from 'react-markdown'
// @ts-ignore
import remarkGfm from 'remark-gfm'
// @ts-ignore  
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// @ts-ignore
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function BlogPostPage() {
  const params = useParams()
  const { getCachedMetadata, loadBlogContent } = usePreload()
  
  // Progressive loading states
  const [metadata, setMetadata] = useState<any>(null)
  const [content, setContent] = useState<any>(null)
  const [loadingMetadata, setLoadingMetadata] = useState(true)
  const [loadingContent, setLoadingContent] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="ghost" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </motion.div>

      <article>
        {/* Header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {metadata.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(metadata.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{metadata.readingTime} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{metadata.metadata?.views || 0} views</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {metadata.tags?.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Like ({metadata.metadata?.likes || 0})
            </Button>
            <Button size="sm" variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </motion.header>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {content.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-12 pt-8 border-t"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-semibold mb-2">Enjoyed this article?</h3>
              <p className="text-muted-foreground">
                Follow me for more insights on web development and technology.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                Previous Post
              </Button>
              <Button variant="outline">
                Next Post
              </Button>
            </div>
          </div>
        </motion.footer>
      </article>
    </div>
  )
}