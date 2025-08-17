'use client'

import { usePreload } from '@/lib/hooks/use-preload'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function CacheDebugPanel() {
  const { getCacheStats, clearBlogCache } = usePreload()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const updateStats = () => {
      setStats(getCacheStats())
    }

    updateStats()
    const interval = setInterval(updateStats, 1000)
    return () => clearInterval(interval)
  }, [getCacheStats])

  if (!stats) return null

  return (
    <Card className="fixed bottom-4 right-4 w-64 z-50 bg-background/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          Cache Debug
          <Button 
            size="sm" 
            variant="outline" 
            onClick={clearBlogCache}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Metadata:</span>
          <span className="font-mono">{stats.metadataCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Content:</span>
          <span className="font-mono">{stats.contentCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Active Requests:</span>
          <span className="font-mono">
            {stats.activeMetadataRequests + stats.activeContentRequests}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Open browser console for detailed logs
        </div>
      </CardContent>
    </Card>
  )
}

// Optional: Add to any page for debugging
export function withCacheDebug<T extends {}>(Component: React.ComponentType<T>) {
  return function ComponentWithCache(props: T) {
    const [showDebug, setShowDebug] = useState(false)

    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === '`' && e.ctrlKey) {
          setShowDebug(prev => !prev)
        }
      }

      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }, [])

    return (
      <>
        <Component {...props} />
        {showDebug && <CacheDebugPanel />}
      </>
    )
  }
}
