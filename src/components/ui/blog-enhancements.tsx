'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Share2, Heart, MessageCircle, Facebook, Linkedin, User, Check } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

// Floating Action Bar for mobile with social sharing and quick actions
export function FloatingActionBar({ 
  title, 
  url, 
  onLike, 
  onShare,
  likes = 0,
  isLiked = false
}: {
  title: string
  url: string
  onLike?: () => void
  onShare?: () => void
  likes?: number
  isLiked?: boolean
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : url
  const shareText = encodeURIComponent(title)

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const handleMainShare = () => {
    if (onShare) {
      onShare()
    } else {
      setShowShareMenu(!showShareMenu)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50 md:hidden"
        >
          <div className="flex flex-col gap-2">
            {/* Share Menu */}
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="bg-card border rounded-lg p-2 shadow-lg backdrop-blur-sm mb-2"
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(shareLinks.facebook, '_blank')}
                      className="justify-start"
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(shareLinks.linkedin, '_blank')}
                      className="justify-start"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="justify-start"
                      type="button"
                    >
                      {copiedToClipboard ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="h-4 w-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 bg-card border rounded-lg p-2 shadow-lg backdrop-blur-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e?.preventDefault()
                  e?.stopPropagation()
                  onLike?.()
                }}
                className={cn(
                  "relative",
                  isLiked && "text-red-500"
                )}
                type="button"
              >
                <motion.div
                  animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                </motion.div>
                {likes > 0 && (
                  <motion.span 
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {likes > 99 ? '99+' : likes}
                  </motion.span>
                )}
              </Button>
              

              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMainShare}
                type="button"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e?.preventDefault()
                  e?.stopPropagation()
                  scrollToTop()
                }}
                type="button"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Reading Time Estimator
export function ReadingTimeEstimate({ content }: { content: string }) {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const readingTime = Math.ceil(words / wordsPerMinute)

  return (
    <span className="text-sm text-muted-foreground">
      {readingTime} min read • {words.toLocaleString()} words
    </span>
  )
}

// Article Series Navigation
export function ArticleSeries({ 
  series, 
  currentSlug 
}: { 
  series: {
    name: string
    articles: Array<{
      title: string
      slug: string
      publishedAt: string
    }>
  }
  currentSlug: string 
}) {
  const currentIndex = series.articles.findIndex(article => article.slug === currentSlug)
  const previousArticle = currentIndex > 0 ? series.articles[currentIndex - 1] : null
  const nextArticle = currentIndex < series.articles.length - 1 ? series.articles[currentIndex + 1] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-muted/30 rounded-lg p-6 my-8"
    >
      <h3 className="font-semibold mb-4 text-primary">Part of the "{series.name}" Series</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {previousArticle && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Previous Article</p>
            <Button variant="outline" asChild className="h-auto p-4 text-left justify-start">
              <a href={`/blog/${previousArticle.slug}`}>
                <div>
                  <p className="font-medium">{previousArticle.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(previousArticle.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </a>
            </Button>
          </div>
        )}
        {nextArticle && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Next Article</p>
            <Button variant="outline" asChild className="h-auto p-4 text-left justify-start">
              <a href={`/blog/${nextArticle.slug}`}>
                <div>
                  <p className="font-medium">{nextArticle.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(nextArticle.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </a>
            </Button>
          </div>
        )}
      </div>
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Article {currentIndex + 1} of {series.articles.length} in this series
        </p>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / series.articles.length) * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// Author Bio Section
export function AuthorBio({ 
  author = {
    name: "Navid Madani",
    bio: "Full-stack developer passionate about creating amazing user experiences and sharing knowledge about web development, automation, and technology.",
    avatar: "/avatar.jpg",
    social: {
      github: "KennyNova",
      linkedin: "navid-madani"
    }
  }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-muted/30 rounded-lg p-6 my-8"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">About {author.name}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {author.bio}
          </p>
          <div className="flex gap-3">
            {author.social.github && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://github.com/${author.social.github}`} target="_blank" rel="noopener noreferrer">
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </Button>
            )}
            {author.social.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://linkedin.com/in/${author.social.linkedin}`} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Related Articles Section
export function RelatedArticles({ 
  articles = [] 
}: { 
  articles: Array<{
    title: string
    slug: string
    excerpt: string
    publishedAt: string
    readingTime: number
    tags: string[]
  }> 
}) {
  if (articles.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="my-12"
    >
      <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <motion.div
            key={article.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Button
              variant="outline" 
              asChild 
              className="h-auto p-4 text-left justify-start hover:shadow-md transition-shadow"
            >
              <a href={`/blog/${article.slug}`}>
                <div className="space-y-2">
                  <h4 className="font-semibold line-clamp-2">{article.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{article.readingTime} min read</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-muted px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
