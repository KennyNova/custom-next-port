'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Get theme-aware gradient colors
const getThemeGradients = () => {
  if (typeof window !== 'undefined') {
    const html = document.documentElement
    const isDark = html.classList.contains('dark')
    const isPastel = html.classList.contains('pastel')
    
    if (isPastel) {
      return {
        progress: 'linear-gradient(90deg, hsl(340, 60%, 75%) 0%, hsl(270, 50%, 85%) 50%, hsl(200, 60%, 75%) 100%)',
      }
    } else if (isDark) {
      return {
        progress: 'linear-gradient(90deg, hsl(217, 91%, 35%) 0%, hsl(142, 76%, 36%) 50%, hsl(190, 95%, 40%) 100%)',
      }
    } else {
      return {
        progress: 'linear-gradient(90deg, hsl(217, 91%, 60%) 0%, hsl(142, 76%, 50%) 50%, hsl(190, 95%, 55%) 100%)',
      }
    }
  }
  
  // Fallback for SSR
  return {
    progress: 'linear-gradient(90deg, hsl(217, 91%, 60%) 0%, hsl(142, 76%, 50%) 100%)',
  }
}

interface ReadingProgressProps {
  content: string
  className?: string
}

export function ReadingProgress({ content, className }: ReadingProgressProps) {
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollTop / docHeight
      setReadingProgress(Math.min(Math.max(progress, 0), 1))
    }

    updateReadingProgress()
    window.addEventListener('scroll', updateReadingProgress)
    window.addEventListener('resize', updateReadingProgress)
    
    return () => {
      window.removeEventListener('scroll', updateReadingProgress)
      window.removeEventListener('resize', updateReadingProgress)
    }
  }, [])

  return (
    <div className={className}>
      {/* Fixed top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-background/80 backdrop-blur-sm">
        <motion.div
          className="h-full relative overflow-hidden"
          style={{ background: getThemeGradients().progress }}
          initial={{ width: 0 }}
          animate={{ width: `${readingProgress * 100}%` }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          {/* Animated shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: [-100, 200] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  )
}
