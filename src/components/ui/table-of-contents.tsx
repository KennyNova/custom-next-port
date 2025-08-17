'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TOCItem {
  id: string
  title: string
  level: number
  children: TOCItem[]
  parent?: string
}

// Get theme-aware gradient colors (shared function)
const getThemeGradients = () => {
  if (typeof window !== 'undefined') {
    const html = document.documentElement
    const isDark = html.classList.contains('dark')
    const isPastel = html.classList.contains('pastel')
    
    if (isPastel) {
      return {
        active: 'linear-gradient(135deg, hsl(340, 60%, 75%) 0%, hsl(270, 50%, 85%) 50%, hsl(200, 60%, 75%) 100%)',
        completed: 'linear-gradient(135deg, hsl(340, 60%, 85%) 0%, hsl(270, 50%, 90%) 100%)',
        progress: 'linear-gradient(90deg, hsl(340, 60%, 75%) 0%, hsl(270, 50%, 85%) 50%, hsl(200, 60%, 75%) 100%)',
        shadow: 'rgba(340, 60%, 75%, 0.3)'
      }
    } else if (isDark) {
      return {
        active: 'linear-gradient(135deg, hsl(217, 91%, 35%) 0%, hsl(142, 76%, 36%) 50%, hsl(190, 95%, 40%) 100%)',
        completed: 'linear-gradient(135deg, hsl(217, 91%, 25%) 0%, hsl(142, 76%, 26%) 100%)',
        progress: 'linear-gradient(90deg, hsl(217, 91%, 35%) 0%, hsl(142, 76%, 36%) 50%, hsl(190, 95%, 40%) 100%)',
        shadow: 'rgba(59, 130, 246, 0.4)'
      }
    } else {
      return {
        active: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(142, 76%, 50%) 50%, hsl(190, 95%, 55%) 100%)',
        completed: 'linear-gradient(135deg, hsl(217, 91%, 70%) 0%, hsl(142, 76%, 60%) 100%)',
        progress: 'linear-gradient(90deg, hsl(217, 91%, 60%) 0%, hsl(142, 76%, 50%) 50%, hsl(190, 95%, 55%) 100%)',
        shadow: 'rgba(59, 130, 246, 0.3)'
      }
    }
  }
  
  // Fallback for SSR
  return {
    active: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(142, 76%, 50%) 100%)',
    completed: 'linear-gradient(135deg, hsl(217, 91%, 70%) 0%, hsl(142, 76%, 60%) 100%)',
    progress: 'linear-gradient(90deg, hsl(217, 91%, 60%) 0%, hsl(142, 76%, 50%) 100%)',
    shadow: 'rgba(59, 130, 246, 0.3)'
  }
}

interface TableOfContentsProps {
  content: string
  className?: string
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set())
  const [readingProgress, setReadingProgress] = useState(0)

  // Build hierarchical TOC structure
  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const flatHeadings: Array<{id: string, title: string, level: number}> = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const title = match[2].trim()
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      flatHeadings.push({ id, title, level })
    }

    // Build hierarchical structure
    const buildHierarchy = (headings: Array<{id: string, title: string, level: number}>): TOCItem[] => {
      const result: TOCItem[] = []
      const stack: TOCItem[] = []

      headings.forEach(heading => {
        const item: TOCItem = {
          id: heading.id,
          title: heading.title,
          level: heading.level,
          children: []
        }

        // Find the correct parent
        while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
          stack.pop()
        }

        if (stack.length === 0) {
          result.push(item)
        } else {
          const parent = stack[stack.length - 1]
          parent.children.push(item)
          item.parent = parent.id
        }

        stack.push(item)
      })

      return result
    }

    setTocItems(buildHierarchy(flatHeadings))
  }, [content])

  // Get all headings in flat order for intersection observer
  const getAllHeadings = (items: TOCItem[]): TOCItem[] => {
    const result: TOCItem[] = []
    const traverse = (items: TOCItem[]) => {
      items.forEach(item => {
        result.push(item)
        if (item.children.length > 0) {
          traverse(item.children)
        }
      })
    }
    traverse(items)
    return result
  }

  // Enhanced intersection observer with better scroll reactivity
  useEffect(() => {
    const allHeadings = getAllHeadings(tocItems)
    let currentActiveId = ''
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Sort entries by their position in the viewport
        const visibleEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => {
            const aTop = a.boundingClientRect.top
            const bTop = b.boundingClientRect.top
            return Math.abs(aTop) - Math.abs(bTop)
          })

        // Get the most prominent visible entry
        const mostVisible = visibleEntries[0]
        
        if (mostVisible && mostVisible.target.id !== currentActiveId) {
          const newActiveId = mostVisible.target.id
          currentActiveId = newActiveId
          setActiveId(newActiveId)
          
          // Find the active heading and manage expansions
          const activeHeading = allHeadings.find(h => h.id === newActiveId)
          if (activeHeading) {
            setExpandedSections(prev => {
              const newExpanded = new Set<string>()
              
              // Always expand the active section if it has children
              if (activeHeading.children && activeHeading.children.length > 0) {
                newExpanded.add(activeHeading.id)
              }
              
              // If this is a sub-heading, expand its parent
              if (activeHeading.parent) {
                newExpanded.add(activeHeading.parent)
              }
              
              // If this is a top-level heading, expand it
              if (activeHeading.level <= 2) {
                newExpanded.add(activeHeading.id)
              }
              
              return newExpanded
            })
            
            // Mark previous sections as completed based on scroll progress
            const activeIndex = allHeadings.findIndex(h => h.id === newActiveId)
            if (activeIndex >= 0) {
              setCompletedSections(prev => {
                const newCompleted = new Set(prev)
                
                // Only mark as completed if we've scrolled past the midpoint
                for (let i = 0; i < activeIndex; i++) {
                  const element = document.getElementById(allHeadings[i].id)
                  if (element) {
                    const rect = element.getBoundingClientRect()
                    const viewportHeight = window.innerHeight
                    
                    // Mark as completed if the heading is above the viewport middle
                    if (rect.bottom < viewportHeight * 0.5) {
                      newCompleted.add(allHeadings[i].id)
                    }
                  }
                }
                
                return newCompleted
              })
            }
          }
        }
      },
      {
        rootMargin: '-10% 0% -50% 0%', // More responsive margins
        threshold: [0, 0.25, 0.5, 0.75, 1], // Multiple thresholds for better tracking
      }
    )

    allHeadings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [tocItems])

  // Calculate reading progress
  useEffect(() => {
    const allHeadings = getAllHeadings(tocItems)
    if (allHeadings.length === 0) return
    const activeIndex = allHeadings.findIndex(item => item.id === activeId)
    if (activeIndex !== -1) {
      setReadingProgress((activeIndex + 1) / allHeadings.length)
    }
  }, [activeId, tocItems])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -100
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }



  // Render a TOC item and its children
  const renderTOCItem = (item: TOCItem, depth: number = 0) => {
    const isActive = activeId === item.id
    const isCompleted = completedSections.has(item.id)
    const isExpanded = expandedSections.has(item.id)
    const hasChildren = item.children.length > 0
    const gradients = getThemeGradients()

    return (
      <motion.div
        key={item.id}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative"
      >
        {/* Main heading button */}
        <motion.button
          onClick={() => scrollToHeading(item.id)}
          className={cn(
            'group w-full text-left py-2 px-3 rounded-lg transition-all duration-300',
            'hover:bg-muted/30 flex items-center gap-3 relative overflow-hidden',
            isActive && 'text-foreground font-medium',
            isCompleted && !isActive && 'text-muted-foreground/70',
            depth > 0 && 'text-sm'
          )}
          style={{ 
            marginLeft: `${depth * 16}px`,
            fontSize: `${1 - depth * 0.1}rem`,
            background: isActive ? 'rgba(var(--primary), 0.05)' : 'transparent'
          }}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Active gradient background */}
          {isActive && (
            <motion.div
              className="absolute inset-0 opacity-10 rounded-lg"
              style={{ background: gradients.active }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Expand/Collapse indicator for headings with children */}
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 relative z-10"
            >
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </motion.div>
          )}
          
          {/* Gradient indicator dot */}
          <motion.div
            className={cn(
              'w-3 h-3 rounded-full relative flex-shrink-0 border',
              !hasChildren && 'block',
              hasChildren && 'hidden'
            )}
            style={{
              background: isActive 
                ? gradients.active
                : isCompleted 
                  ? gradients.completed
                  : 'transparent',
              borderColor: isActive || isCompleted 
                ? 'transparent' 
                : 'rgb(var(--border))',
              boxShadow: isActive 
                ? `0 0 12px ${gradients.shadow}, 0 0 24px ${gradients.shadow}` 
                : 'none'
            }}
            animate={{
              scale: isActive ? 1.3 : isCompleted ? 1.1 : 1,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Inner glow for active state */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: gradients.active }}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            
            {/* Completion checkmark */}
            {isCompleted && !isActive && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </motion.div>
            )}
          </motion.div>

          {/* Title with enhanced crossout effect */}
          <motion.span
            className={cn(
              'flex-1 relative overflow-hidden transition-all duration-300',
              isActive && 'font-medium',
              isActive && 'bg-gradient-to-r from-foreground to-foreground bg-clip-text'
            )}
            style={{
              textDecoration: isCompleted && !isActive ? 'line-through' : 'none',
              textDecorationColor: 'rgb(var(--muted-foreground))',
              textDecorationThickness: '1px'
            }}
          >
            {item.title}
            
            {/* Enhanced animated crossout line */}
            {isCompleted && !isActive && (
              <motion.div
                className="absolute left-0 top-1/2 h-px rounded-full"
                style={{ background: gradients.completed }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 0.8 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}
          </motion.span>

          {/* Enhanced progress indicator for active section */}
          {isActive && (
            <motion.div
              className="h-1.5 rounded-full relative overflow-hidden"
              style={{ background: gradients.active }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 32, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: gradients.active }}
                animate={{ x: [-32, 32] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </motion.button>

        {/* Children - only render if expanded */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-2 pl-3 mt-1 relative">
                {/* Gradient border line */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-px rounded-full opacity-30"
                  style={{ background: gradients.progress }}
                />
                {item.children.map(child => renderTOCItem(child, depth + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  if (tocItems.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        'sticky top-24 w-72 max-h-[calc(100vh-8rem)]',
        'hidden xl:block',
        className
      )}
    >
      {/* Minimal header */}
      <div className="flex items-center gap-2 mb-6 px-3">
        <Book className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm text-muted-foreground">Contents</span>
        <motion.div
          className="h-px bg-gradient-to-r from-border to-transparent flex-1 ml-2"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
      </div>

      {/* Reading progress bar */}
      <div className="mb-6 px-3">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{ background: getThemeGradients().progress }}
            initial={{ width: 0 }}
            animate={{ width: `${readingProgress * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Animated shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: [-100, 200] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
        <motion.p 
          className="text-xs text-muted-foreground mt-2 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span>{Math.round(readingProgress * 100)}% complete</span>
          <span className="text-xs opacity-60">
            {getAllHeadings(tocItems).findIndex(h => h.id === activeId) + 1} / {getAllHeadings(tocItems).length}
          </span>
        </motion.p>
      </div>

      {/* TOC Items */}
      <motion.div
        className="overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-border/30 scrollbar-track-transparent max-h-[60vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="space-y-1 px-3 pb-4">
          {tocItems.map(item => renderTOCItem(item))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Mobile TOC Component (simple collapsible)

// Mobile TOC Component
export function MobileTableOfContents({ content }: { content: string }) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set())
  const [readingProgress, setReadingProgress] = useState(0)

  // Build hierarchical TOC structure (same as desktop)
  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const flatHeadings: Array<{id: string, title: string, level: number}> = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const title = match[2].trim()
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      flatHeadings.push({ id, title, level })
    }

    // Build hierarchical structure
    const buildHierarchy = (headings: Array<{id: string, title: string, level: number}>): TOCItem[] => {
      const result: TOCItem[] = []
      const stack: TOCItem[] = []

      headings.forEach(heading => {
        const item: TOCItem = {
          id: heading.id,
          title: heading.title,
          level: heading.level,
          children: []
        }

        while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
          stack.pop()
        }

        if (stack.length === 0) {
          result.push(item)
        } else {
          const parent = stack[stack.length - 1]
          parent.children.push(item)
          item.parent = parent.id
        }

        stack.push(item)
      })

      return result
    }

    setTocItems(buildHierarchy(flatHeadings))
  }, [content])

  // Get all headings in flat order for mobile
  const getAllHeadingsMobile = (items: TOCItem[]): TOCItem[] => {
    const result: TOCItem[] = []
    const traverse = (items: TOCItem[]) => {
      items.forEach(item => {
        result.push(item)
        if (item.children.length > 0) {
          traverse(item.children)
        }
      })
    }
    traverse(items)
    return result
  }

  // Mobile intersection observer with enhanced reactivity
  useEffect(() => {
    const allHeadings = getAllHeadingsMobile(tocItems)
    let currentActiveId = ''
    
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => {
            const aTop = a.boundingClientRect.top
            const bTop = b.boundingClientRect.top
            return Math.abs(aTop) - Math.abs(bTop)
          })

        const mostVisible = visibleEntries[0]
        
        if (mostVisible && mostVisible.target.id !== currentActiveId) {
          const newActiveId = mostVisible.target.id
          currentActiveId = newActiveId
          setActiveId(newActiveId)
          
          const activeHeading = allHeadings.find(h => h.id === newActiveId)
          if (activeHeading) {
            setExpandedSections(prev => {
              const newExpanded = new Set<string>()
              if (activeHeading.children && activeHeading.children.length > 0) {
                newExpanded.add(activeHeading.id)
              }
              if (activeHeading.parent) {
                newExpanded.add(activeHeading.parent)
              }
              if (activeHeading.level <= 2) {
                newExpanded.add(activeHeading.id)
              }
              return newExpanded
            })
            
            const activeIndex = allHeadings.findIndex(h => h.id === newActiveId)
            if (activeIndex >= 0) {
              setCompletedSections(prev => {
                const newCompleted = new Set(prev)
                for (let i = 0; i < activeIndex; i++) {
                  const element = document.getElementById(allHeadings[i].id)
                  if (element) {
                    const rect = element.getBoundingClientRect()
                    const viewportHeight = window.innerHeight
                    if (rect.bottom < viewportHeight * 0.5) {
                      newCompleted.add(allHeadings[i].id)
                    }
                  }
                }
                return newCompleted
              })
            }
          }
        }
      },
      {
        rootMargin: '-10% 0% -50% 0%',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    )

    allHeadings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [tocItems])

  // Calculate reading progress for mobile
  useEffect(() => {
    const allHeadings = getAllHeadingsMobile(tocItems)
    if (allHeadings.length === 0) return
    const activeIndex = allHeadings.findIndex(item => item.id === activeId)
    if (activeIndex !== -1) {
      setReadingProgress((activeIndex + 1) / allHeadings.length)
    }
  }, [activeId, tocItems])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  // Render mobile TOC item with gradients
  const renderMobileTOCItem = (item: TOCItem, depth: number = 0) => {
    const isActive = activeId === item.id
    const isCompleted = completedSections.has(item.id)
    const isExpanded = expandedSections.has(item.id)
    const hasChildren = item.children.length > 0
    const gradients = getThemeGradients()

    return (
      <motion.div
        key={item.id}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative"
      >
        <motion.button
          onClick={() => scrollToHeading(item.id)}
          className={cn(
            'group w-full text-left py-2 px-3 rounded-lg transition-all duration-300',
            'hover:bg-muted/30 flex items-center gap-3 relative overflow-hidden',
            isActive && 'text-foreground font-medium',
            isCompleted && !isActive && 'text-muted-foreground/70',
            depth > 0 && 'text-sm'
          )}
          style={{ 
            marginLeft: `${depth * 12}px`,
            fontSize: `${0.9 - depth * 0.05}rem`,
            background: isActive ? 'rgba(var(--primary), 0.05)' : 'transparent'
          }}
          whileHover={{ x: 1 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Active gradient background */}
          {isActive && (
            <motion.div
              className="absolute inset-0 opacity-10 rounded-lg"
              style={{ background: gradients.active }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 relative z-10"
            >
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </motion.div>
          )}
          
          <motion.div
            className={cn(
              'w-2.5 h-2.5 rounded-full relative flex-shrink-0 border',
              !hasChildren && 'block',
              hasChildren && 'hidden'
            )}
            style={{
              background: isActive 
                ? gradients.active
                : isCompleted 
                  ? gradients.completed
                  : 'transparent',
              borderColor: isActive || isCompleted 
                ? 'transparent' 
                : 'rgb(var(--border))',
              boxShadow: isActive 
                ? `0 0 8px ${gradients.shadow}` 
                : 'none'
            }}
            animate={{
              scale: isActive ? 1.3 : isCompleted ? 1.1 : 1,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: gradients.active }}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            
            {isCompleted && !isActive && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div className="w-1 h-1 bg-white rounded-full" />
              </motion.div>
            )}
          </motion.div>

          <motion.span
            className={cn(
              'flex-1 relative overflow-hidden transition-all duration-300',
              isActive && 'font-medium'
            )}
            style={{
              textDecoration: isCompleted && !isActive ? 'line-through' : 'none',
              textDecorationColor: 'rgb(var(--muted-foreground))',
              textDecorationThickness: '1px'
            }}
          >
            {item.title}
            
            {isCompleted && !isActive && (
              <motion.div
                className="absolute left-0 top-1/2 h-px rounded-full"
                style={{ background: gradients.completed }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 0.8 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}
          </motion.span>

          {isActive && (
            <motion.div
              className="h-1 rounded-full relative overflow-hidden"
              style={{ background: gradients.active }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 24, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: gradients.active }}
                animate={{ x: [-24, 24] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </motion.button>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-2 pl-2 mt-1 relative">
                <div 
                  className="absolute left-0 top-0 bottom-0 w-px rounded-full opacity-30"
                  style={{ background: gradients.progress }}
                />
                {item.children.map(child => renderMobileTOCItem(child, depth + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  if (tocItems.length === 0) return null

  return (
    <div className="xl:hidden">
      {/* Floating toggle button with progress indicator */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-primary/90 backdrop-blur-sm text-primary-foreground rounded-full shadow-lg border border-primary/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <Book className="h-5 w-5" />
          {/* Progress ring */}
          <svg className="absolute -inset-1 w-7 h-7 transform -rotate-90">
            <circle
              cx="14"
              cy="14"
              r="12"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="opacity-20"
            />
            <motion.circle
              cx="14"
              cy="14"
              r="12"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 12}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 12 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 12 * (1 - readingProgress)
              }}
              transition={{ duration: 0.5 }}
              className="opacity-80"
            />
          </svg>
        </div>
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
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-20 right-4 left-4 bg-card/95 backdrop-blur-sm border rounded-xl p-6 shadow-xl z-50 max-h-[70vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Contents</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ background: getThemeGradients().progress }}
                    initial={{ width: 0 }}
                    animate={{ width: `${readingProgress * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-100, 200] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {Math.round(readingProgress * 100)}% complete
                  </p>
                  <p className="text-xs text-muted-foreground opacity-60">
                    {getAllHeadingsMobile(tocItems).findIndex(h => h.id === activeId) + 1} / {getAllHeadingsMobile(tocItems).length}
                  </p>
                </div>
              </div>

              {/* TOC Items */}
              <div className="overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-border/30 scrollbar-track-transparent max-h-[50vh]">
                <div className="space-y-1">
                  {tocItems.map(item => renderMobileTOCItem(item))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
