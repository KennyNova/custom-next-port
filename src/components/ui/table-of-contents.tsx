'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book, ChevronRight, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TOCItem {
  id: string
  title: string
  level: number
  children?: TOCItem[]
}

interface TableOfContentsProps {
  content: string
  className?: string
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(true)

  // Extract headings from markdown content
  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const headings: TOCItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const title = match[2].trim()
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      headings.push({
        id,
        title,
        level,
      })
    }

    setTocItems(headings)
  }, [content])

  // Intersection Observer for active section detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    )

    // Observe all heading elements
    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [tocItems])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -100 // Account for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      })
    }
  }

  if (tocItems.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        "sticky top-24 w-64 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto",
        "bg-card/80 backdrop-blur-sm border rounded-lg p-4",
        "hidden xl:block",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Book className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Table of Contents</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded hover:bg-muted transition-colors"
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded && "rotate-90"
            )}
          />
        </button>
      </div>

      {/* TOC Items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1"
          >
            {tocItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => scrollToHeading(item.id)}
                className={cn(
                  "group flex items-start gap-2 w-full text-left p-2 rounded-md transition-all duration-200",
                  "hover:bg-muted/50 hover:translate-x-1",
                  activeId === item.id && "bg-primary/10 text-primary border-l-2 border-primary",
                  "text-sm"
                )}
                style={{
                  paddingLeft: `${(item.level - 1) * 12 + 8}px`,
                }}
              >
                <Hash 
                  className={cn(
                    "h-3 w-3 mt-0.5 flex-shrink-0 opacity-40 group-hover:opacity-70 transition-opacity",
                    activeId === item.id && "opacity-100 text-primary"
                  )} 
                />
                <span className="leading-tight group-hover:text-foreground transition-colors">
                  {item.title}
                </span>
              </motion.button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Reading Progress */}
      <div className="mt-6 pt-4 border-t">
        <ReadingProgress />
      </div>
    </motion.div>
  )
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setProgress(Math.min(100, Math.max(0, progress)))
    }

    window.addEventListener('scroll', updateProgress)
    updateProgress()

    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Reading Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </div>
  )
}

// Mobile TOC Component
export function MobileTableOfContents({ content }: { content: string }) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>('')

  // Extract headings from markdown content
  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const headings: TOCItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const title = match[2].trim()
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      headings.push({
        id,
        title,
        level,
      })
    }

    setTocItems(headings)
  }, [content])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      })
      setIsOpen(false)
    }
  }

  if (tocItems.length === 0) return null

  return (
    <div className="xl:hidden">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Book className="h-5 w-5" />
      </motion.button>

      {/* Mobile TOC Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 right-4 left-4 bg-card border rounded-lg p-4 shadow-xl z-50 max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Table of Contents</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToHeading(item.id)}
                    className={cn(
                      "flex items-start gap-2 w-full text-left p-2 rounded-md transition-colors",
                      "hover:bg-muted text-sm"
                    )}
                    style={{
                      paddingLeft: `${(item.level - 1) * 12 + 8}px`,
                    }}
                  >
                    <Hash className="h-3 w-3 mt-0.5 flex-shrink-0 opacity-40" />
                    <span className="leading-tight">{item.title}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
