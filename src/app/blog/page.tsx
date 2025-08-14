'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const blogPosts = [
  {
    id: '1',
    title: 'Building a Modern Portfolio with Next.js and Framer Motion',
    excerpt: 'Learn how to create an interactive, animated portfolio website using Next.js 14, Tailwind CSS, and Framer Motion for smooth animations.',
    publishedAt: new Date('2024-01-15'),
    readingTime: 8,
    tags: ['Next.js', 'Framer Motion', 'Web Development'],
    slug: 'building-modern-portfolio-nextjs-framer-motion',
  },
  {
    id: '2',
    title: 'Home Lab Setup: From Zero to Hero',
    excerpt: 'A comprehensive guide to setting up your first home lab with Docker, Proxmox, and self-hosted services for learning and development.',
    publishedAt: new Date('2024-01-10'),
    readingTime: 12,
    tags: ['Home Lab', 'Docker', 'Self-hosting'],
    slug: 'home-lab-setup-zero-to-hero',
  },
  {
    id: '3',
    title: 'Automating Coffee: The Gagguino Project Journey',
    excerpt: 'Exploring the intersection of coffee culture and technology through the Gagguino project - automating espresso machine operations.',
    publishedAt: new Date('2024-01-05'),
    readingTime: 10,
    tags: ['IoT', 'Arduino', 'Coffee', 'Automation'],
    slug: 'automating-coffee-gagguino-project-journey',
  },
  {
    id: '4',
    title: 'Creating Reusable n8n Workflows for Business Automation',
    excerpt: 'Best practices for designing modular, reusable n8n workflows that can scale across different business processes and use cases.',
    publishedAt: new Date('2023-12-28'),
    readingTime: 6,
    tags: ['n8n', 'Automation', 'Business'],
    slug: 'creating-reusable-n8n-workflows-business-automation',
  },
]

const tags = ['All', 'Next.js', 'Home Lab', 'IoT', 'Automation', 'Web Development', 'Coffee']

export default function BlogPage() {
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
              variant={tag === 'All' ? 'default' : 'outline'}
              size="sm"
              className="mb-2"
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
        {blogPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.publishedAt.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readingTime} min read
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Button asChild variant="ghost" className="p-0 h-auto">
                  <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
                    Read more <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
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