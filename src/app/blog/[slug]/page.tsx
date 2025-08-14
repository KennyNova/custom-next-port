'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, ArrowLeft, Heart, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// This would normally come from an API call
const mockBlogPost = {
  id: '1',
  title: 'Building a Modern Portfolio with Next.js and Framer Motion',
  content: `
# Building a Modern Portfolio with Next.js and Framer Motion

Creating a standout portfolio in today's competitive tech landscape requires more than just showcasing your projects. It demands an interactive, engaging experience that tells your story and demonstrates your technical skills simultaneously.

## Why Next.js?

Next.js has become the go-to framework for React applications, and for good reason:

- **Performance**: Server-side rendering and static generation out of the box
- **SEO**: Better search engine optimization with server-side rendering
- **Developer Experience**: Hot reloading, TypeScript support, and excellent tooling
- **Deployment**: Seamless integration with Vercel and other platforms

## Adding Motion with Framer Motion

Framer Motion brings your portfolio to life with smooth, professional animations:

### Basic Animation Setup

\`\`\`jsx
import { motion } from 'framer-motion'

const AnimatedComponent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1>Hello, World!</h1>
    </motion.div>
  )
}
\`\`\`

### Advanced Interactions

For more complex interactions, you can combine hover effects, page transitions, and scroll-triggered animations:

\`\`\`jsx
const ProjectCard = () => {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Card content */}
    </motion.div>
  )
}
\`\`\`

## Design Principles

When building your portfolio, keep these principles in mind:

1. **User Experience First**: Every animation should serve a purpose
2. **Performance**: Don't sacrifice loading speed for fancy effects
3. **Accessibility**: Ensure animations respect user preferences
4. **Mobile Responsive**: Design for mobile-first

## Conclusion

A well-crafted portfolio using Next.js and Framer Motion can set you apart from the competition. The combination of performance, SEO benefits, and engaging animations creates a memorable experience for potential employers and clients.

Remember to keep your content updated, showcase your best work, and let your personality shine through your design choices.
  `,
  excerpt: 'Learn how to create an interactive, animated portfolio website using Next.js 14, Tailwind CSS, and Framer Motion for smooth animations.',
  publishedAt: new Date('2024-01-15'),
  readingTime: 8,
  tags: ['Next.js', 'Framer Motion', 'Web Development'],
  slug: 'building-modern-portfolio-nextjs-framer-motion',
  metadata: {
    views: 1234,
    likes: 89
  }
}

export default function BlogPostPage() {
  const params = useParams()
  
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
            {mockBlogPost.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{mockBlogPost.publishedAt.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{mockBlogPost.readingTime} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{mockBlogPost.metadata.views} views</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {mockBlogPost.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Like ({mockBlogPost.metadata.likes})
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
              <div 
                className="prose prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: mockBlogPost.content.replace(/\n/g, '<br />') 
                }}
              />
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