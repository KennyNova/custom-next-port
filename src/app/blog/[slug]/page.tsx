'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/blog/${params.slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Blog post not found')
          } else {
            setError('Failed to fetch blog post')
          }
          return
        }
        const data = await response.json()
        setBlogPost(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching blog post:', err)
        setError('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchBlogPost()
    }
  }, [params.slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    )
  }

  if (error || !blogPost) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Blog post not found'}</p>
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
            {blogPost.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(blogPost.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{blogPost.readingTime} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{blogPost.metadata.views} views</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {blogPost.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Like ({blogPost.metadata.likes})
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
                  {blogPost.content}
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