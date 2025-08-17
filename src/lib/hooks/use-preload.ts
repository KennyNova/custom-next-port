import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'
import type { BlogPost } from '@/types'

interface PreloadController {
  cancel: () => void
}

interface BlogMetadata {
  _id: string
  title: string
  slug: string
  excerpt: string
  featuredImage: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  readingTime: number
  metadata: {
    views: number
    likes: number
  }
}

interface BlogContent {
  content: string
  title: string
}

class PreloadManager {
  private activePreloads = new Set<string>()
  private preloadTimers = new Map<string, NodeJS.Timeout>()
  private preloadControllers = new Map<string, PreloadController>()
  private metadataCache = new Map<string, BlogMetadata>()
  private contentCache = new Map<string, BlogContent>()
  private metadataRequests = new Map<string, Promise<BlogMetadata | null>>()
  private contentRequests = new Map<string, Promise<BlogContent | null>>()

  preload(href: string, router: any, delay: number = 0): PreloadController {
    // Cancel any existing preload for this href
    this.cancelPreload(href)

    const controller: PreloadController = {
      cancel: () => this.cancelPreload(href)
    }

    const timer = setTimeout(() => {
      if (!this.activePreloads.has(href)) {
        this.activePreloads.add(href)
        router.prefetch(href)
        console.log(`🚀 Preloading: ${href}`)
      }
    }, delay)

    this.preloadTimers.set(href, timer)
    this.preloadControllers.set(href, controller)

    return controller
  }

  cancelPreload(href: string): void {
    const timer = this.preloadTimers.get(href)
    if (timer) {
      clearTimeout(timer)
      this.preloadTimers.delete(href)
    }

    this.activePreloads.delete(href)
    this.preloadControllers.delete(href)
    console.log(`⏹️ Cancelled preload: ${href}`)
  }

  cancelAll(): void {
    // Cancel all timers
    this.preloadTimers.forEach((timer) => clearTimeout(timer))
    this.preloadTimers.clear()
    
    // Clear all tracking
    this.activePreloads.clear()
    this.preloadControllers.clear()
    console.log('🛑 Cancelled all preloads')
  }

  isPreloading(href: string): boolean {
    return this.activePreloads.has(href)
  }

  // Blog metadata preloading
  async preloadBlogMetadata(slug: string): Promise<BlogMetadata | null> {
    // Return cached if available
    if (this.metadataCache.has(slug)) {
      console.log(`📋 Using cached metadata: ${slug}`)
      return this.metadataCache.get(slug)!
    }

    // Return ongoing request if exists
    if (this.metadataRequests.has(slug)) {
      console.log(`📋 Joining ongoing metadata request: ${slug}`)
      return this.metadataRequests.get(slug)!
    }

    // Start new request
    const request = this.fetchBlogMetadata(slug)
    this.metadataRequests.set(slug, request)

    try {
      const metadata = await request
      this.metadataRequests.delete(slug)
      return metadata
    } catch (error) {
      this.metadataRequests.delete(slug)
      throw error
    }
  }

  private async fetchBlogMetadata(slug: string): Promise<BlogMetadata | null> {
    try {
      const response = await fetch(`/api/blog/${slug}/metadata`)
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`📋 Blog metadata not found: ${slug}`)
          return null
        }
        throw new Error(`Failed to fetch metadata: ${response.status}`)
      }
      
      const metadata = await response.json()
      this.metadataCache.set(slug, metadata)
      console.log(`🚀 Preloaded blog metadata: ${slug} (${JSON.stringify(metadata).length} bytes)`)
      return metadata
    } catch (error) {
      console.error(`Failed to preload metadata for ${slug}:`, error)
      return null
    }
  }

  // Blog content loading
  async loadBlogContent(slug: string): Promise<BlogContent | null> {
    // Return cached if available
    if (this.contentCache.has(slug)) {
      console.log(`📄 Using cached content: ${slug}`)
      return this.contentCache.get(slug)!
    }

    // Return ongoing request if exists
    if (this.contentRequests.has(slug)) {
      console.log(`📄 Joining ongoing content request: ${slug}`)
      return this.contentRequests.get(slug)!
    }

    // Start new request
    const request = this.fetchBlogContent(slug)
    this.contentRequests.set(slug, request)

    try {
      const content = await request
      this.contentRequests.delete(slug)
      return content
    } catch (error) {
      this.contentRequests.delete(slug)
      throw error
    }
  }

  private async fetchBlogContent(slug: string): Promise<BlogContent | null> {
    try {
      const response = await fetch(`/api/blog/${slug}/content`)
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`📄 Blog content not found: ${slug}`)
          return null
        }
        throw new Error(`Failed to fetch content: ${response.status}`)
      }
      
      const content = await response.json()
      this.contentCache.set(slug, content)
      console.log(`📄 Loaded blog content: ${slug} (${content.content?.length || 0} chars)`)
      return content
    } catch (error) {
      console.error(`Failed to load content for ${slug}:`, error)
      return null
    }
  }

  // Cache getters
  getCachedMetadata(slug: string): BlogMetadata | null {
    return this.metadataCache.get(slug) || null
  }

  getCachedContent(slug: string): BlogContent | null {
    return this.contentCache.get(slug) || null
  }

  // Cache management
  clearBlogCache(): void {
    this.metadataCache.clear()
    this.contentCache.clear()
    this.metadataRequests.clear()
    this.contentRequests.clear()
    console.log('🧹 Cleared blog cache')
  }

  // Get cache stats
  getCacheStats() {
    return {
      metadataCount: this.metadataCache.size,
      contentCount: this.contentCache.size,
      activeMetadataRequests: this.metadataRequests.size,
      activeContentRequests: this.contentRequests.size
    }
  }
}

// Global instance
const preloadManager = new PreloadManager()

export function usePreload() {
  const router = useRouter()
  const currentPreloadRef = useRef<PreloadController | null>(null)

  const startPreload = useCallback((href: string, delay: number = 100) => {
    // Cancel any existing preload
    if (currentPreloadRef.current) {
      currentPreloadRef.current.cancel()
    }

    // Start new preload
    currentPreloadRef.current = preloadManager.preload(href, router, delay)
    
    return currentPreloadRef.current
  }, [router])

  const cancelPreload = useCallback((href?: string) => {
    if (href) {
      preloadManager.cancelPreload(href)
    } else if (currentPreloadRef.current) {
      currentPreloadRef.current.cancel()
      currentPreloadRef.current = null
    }
  }, [])

  const cancelAllPreloads = useCallback(() => {
    preloadManager.cancelAll()
    currentPreloadRef.current = null
  }, [])

  const isPreloading = useCallback((href: string) => {
    return preloadManager.isPreloading(href)
  }, [])

  // Blog-specific methods
  const preloadBlogMetadata = useCallback(async (slug: string) => {
    return preloadManager.preloadBlogMetadata(slug)
  }, [])

  const loadBlogContent = useCallback(async (slug: string) => {
    return preloadManager.loadBlogContent(slug)
  }, [])

  const getCachedMetadata = useCallback((slug: string) => {
    return preloadManager.getCachedMetadata(slug)
  }, [])

  const getCachedContent = useCallback((slug: string) => {
    return preloadManager.getCachedContent(slug)
  }, [])

  const clearBlogCache = useCallback(() => {
    preloadManager.clearBlogCache()
  }, [])

  const getCacheStats = useCallback(() => {
    return preloadManager.getCacheStats()
  }, [])

  return {
    // Page preloading
    startPreload,
    cancelPreload,
    cancelAllPreloads,
    isPreloading,
    // Blog-specific preloading
    preloadBlogMetadata,
    loadBlogContent,
    getCachedMetadata,
    getCachedContent,
    clearBlogCache,
    getCacheStats
  }
}
