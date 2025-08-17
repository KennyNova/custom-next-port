'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BlogPostGridSkeleton } from '@/components/ui/blog-skeleton'
import { PreloadLink } from '@/components/ui/preload-link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { BlogPost } from '@/types'

const defaultTags = ['All', 'Next.js', 'Home Lab', 'IoT', 'Automation', 'Web Development', 'Coffee', 'n8n', 'Docker', 'Self-hosting', 'Arduino', 'ESP32', 'Proxmox', 'Business', 'Workflow', 'Integration', 'Infrastructure']

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [tags, setTags] = useState<string[]>(defaultTags)
  const [selectedTag, setSelectedTag] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/blog')
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts')
        }
        const data = await response.json()
        const posts = data.posts || data // Handle both array and object response formats
        setBlogPosts(posts)
        
        // Extract unique tags from posts
        const allTags = posts.reduce((acc: string[], post: BlogPost) => {
          return [...acc, ...post.tags]
        }, [] as string[])
        const uniqueTags: string[] = ['All', ...Array.from(new Set<string>(allTags))]
        setTags(uniqueTags)
        
        setError(null)
      } catch (err) {
        console.error('Error fetching blog posts:', err)
        setError('Failed to load blog posts')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const filteredPosts = selectedTag === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.tags.includes(selectedTag))

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, experiences, and technical articles about web development, home labs, automation, and creative projects.
          </p>
        </motion.div>

        {/* Tags Filter Skeleton */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {defaultTags.slice(0, 8).map((tag, i) => (
              <div
                key={tag}
                className="h-8 bg-muted animate-pulse rounded-md mb-2"
                style={{ width: `${tag.length * 8 + 24}px` }}
              />
            ))}
          </div>
        </motion.div>

        {/* Blog Posts Grid Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <BlogPostGridSkeleton count={6} />
        </motion.div>

        {/* Load More Skeleton */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="h-10 w-48 bg-muted animate-pulse rounded mx-auto" />
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Insights, experiences, and technical articles about web development, home labs, automation, and creative projects.
        </p>
      </motion.div>

      {/* Tags Filter */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex flex-wrap gap-2 justify-center">
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={tag === selectedTag ? 'default' : 'outline'}
              size="sm"
              className="mb-2"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Blog Posts Grid */}
      <motion.div
        className="grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post._id?.toString() || post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <PreloadLink 
                href={`/blog/${post.slug}`} 
                className="block h-full"
                preloadBlogMetadata={true}
                blogSlug={post.slug}
                onMetadataPreloaded={(metadata) => {
                  console.log(`✨ Metadata preloaded for ${post.slug}:`, metadata)
                }}
              >
                <CardHeader className="hover:bg-accent/50 transition-colors duration-300 rounded-t-lg">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readingTime} min read
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="hover:bg-accent/50 transition-colors duration-300 rounded-b-lg">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md hover:bg-secondary/80 transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedTag(tag)
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    Read more <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </PreloadLink>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Load More */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Button variant="outline" size="lg">
          Load More Posts
        </Button>
      </motion.div>
    </div>
  )
}