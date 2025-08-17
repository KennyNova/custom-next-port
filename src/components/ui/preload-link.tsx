'use client'

import Link from 'next/link'
import { usePreload } from '@/lib/hooks/use-preload'
import { useCallback, ReactNode } from 'react'

interface PreloadLinkProps {
  href: string
  children: ReactNode
  className?: string
  preloadDelay?: number
  disabled?: boolean
  onClick?: () => void
  // Blog-specific preloading
  preloadBlogMetadata?: boolean
  blogSlug?: string
  onMetadataPreloaded?: (metadata: any) => void
  [key: string]: any // Allow other props to pass through
}

export function PreloadLink({ 
  href, 
  children, 
  className, 
  preloadDelay = 100,
  disabled = false,
  onClick,
  preloadBlogMetadata = false,
  blogSlug,
  onMetadataPreloaded,
  ...props 
}: PreloadLinkProps) {
  const { 
    startPreload, 
    cancelPreload, 
    cancelAllPreloads, 
    preloadBlogMetadata: preloadMetadata 
  } = usePreload()

  const handleMouseEnter = useCallback(async () => {
    if (!disabled) {
      // 1. Start page preload (existing behavior)
      startPreload(href, preloadDelay)
      
      // 2. Preload blog metadata if enabled
      if (preloadBlogMetadata && blogSlug) {
        try {
          const metadata = await preloadMetadata(blogSlug)
          if (metadata && onMetadataPreloaded) {
            onMetadataPreloaded(metadata)
          }
        } catch (error) {
          console.log('Blog metadata preload failed:', error)
        }
      }
    }
  }, [href, preloadDelay, disabled, startPreload, preloadBlogMetadata, blogSlug, preloadMetadata, onMetadataPreloaded])

  const handleMouseLeave = useCallback(() => {
    if (!disabled) {
      cancelPreload(href)
    }
  }, [href, disabled, cancelPreload])

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Cancel all other preloads when this link is clicked
    cancelAllPreloads()
    
    if (onClick) {
      onClick()
    }
    
    if (disabled) {
      e.preventDefault()
    }
  }, [disabled, onClick, cancelAllPreloads])

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  )
}

// Higher-order component version for wrapping existing components
export function withPreload<T extends Record<string, any>>(
  Component: React.ComponentType<T & { href: string; disabled?: boolean }>,
  preloadDelay: number = 100
) {
  return function PreloadWrapper(props: T & { href: string; disabled?: boolean; onClick?: () => void }) {
    const { href, disabled = false, onClick, ...restProps } = props
    const { startPreload, cancelPreload, cancelAllPreloads } = usePreload()

    const handleMouseEnter = useCallback(() => {
      if (!disabled && href) {
        startPreload(href, preloadDelay)
      }
    }, [href, disabled])

    const handleMouseLeave = useCallback(() => {
      if (!disabled && href) {
        cancelPreload(href)
      }
    }, [href, disabled])

    const handleClick = useCallback((e: React.MouseEvent) => {
      // Cancel all other preloads when this link is clicked
      cancelAllPreloads()
      
      if (onClick) {
        onClick()
      }
      
      if (disabled) {
        e.preventDefault()
      }
    }, [disabled, onClick])

    return (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <Component {...props} />
      </div>
    )
  }
}
