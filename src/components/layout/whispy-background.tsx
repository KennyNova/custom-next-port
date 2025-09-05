'use client'

import { useTheme } from '@/components/providers/theme-provider'
import { useEffect, useState } from 'react'

interface Line {
  id: number
  startX: number
  startY: number
  endX: number
  endY: number
  opacity: number
  strokeWidth: number
  length: number
  angle: number
  speed: number
  age: number
  maxAge: number
}

const WhispyBackground = () => {
  const { theme } = useTheme()
  const [lines, setLines] = useState<Line[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Theme-based color configurations
  const getThemeColors = () => {
    switch (theme) {
      case 'dark':
        return {
          primary: 'rgba(210, 240, 255, 0.4)',
          secondary: 'rgba(147, 197, 253, 0.3)',
          accent: 'rgba(99, 179, 237, 0.2)',
          glow: 'rgba(59, 130, 246, 0.5)'
        }
      case 'pastel':
        return {
          primary: 'rgba(255, 182, 193, 0.5)',
          secondary: 'rgba(221, 160, 221, 0.4)',
          accent: 'rgba(175, 238, 238, 0.3)',
          glow: 'rgba(255, 182, 193, 0.6)'
        }
      case 'coffee':
        return {
          primary: 'rgba(139, 83, 61, 0.4)',    // coffee-cinnamon
          secondary: 'rgba(101, 67, 33, 0.3)',  // coffee-espresso  
          accent: 'rgba(160, 113, 92, 0.2)',    // coffee-mocha
          glow: 'rgba(184, 123, 88, 0.5)'       // coffee-caramel
        }
      case 'developer':
        return {
          primary: 'rgba(0, 255, 65, 0.6)',     // matrix-green
          secondary: 'rgba(0, 255, 65, 0.4)',   // matrix-bright
          accent: 'rgba(0, 255, 65, 0.2)',      // matrix-dim
          glow: 'rgba(0, 255, 95, 0.8)'         // matrix-glow
        }
      default: // light
        return {
          primary: 'rgba(59, 130, 246, 0.3)',
          secondary: 'rgba(99, 179, 237, 0.2)',
          accent: 'rgba(147, 197, 253, 0.15)',
          glow: 'rgba(59, 130, 246, 0.4)'
        }
    }
  }

  // Initialize lines
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const createLines = () => {
      const newLines: Line[] = []
      const numLines = Math.floor((dimensions.width * dimensions.height) / 15000) // Responsive line count

      for (let i = 0; i < numLines; i++) {
        const angle = Math.random() * Math.PI * 2
        const length = 100 + Math.random() * 200
        const startX = Math.random() * dimensions.width
        const startY = Math.random() * dimensions.height
        const maxAge = 60 + Math.random() * 120 // Lines live for 1-3 seconds (at 20fps)
        
        newLines.push({
          id: i,
          startX,
          startY,
          endX: startX + Math.cos(angle) * length,
          endY: startY + Math.sin(angle) * length,
          opacity: 0.2 + Math.random() * 0.6,
          strokeWidth: 1 + Math.random() * 2,
          length,
          angle,
          speed: 0.5 + Math.random() * 1.5,
          age: Math.random() * maxAge, // Start at random age for staggered effect
          maxAge
        })
      }
      
      setLines(newLines)
    }

    createLines()
  }, [dimensions])

  // Animation loop
  useEffect(() => {
    if (lines.length === 0) return

    const animateLines = () => {
      setLines(prevLines => {
        const newLines = prevLines.map(line => {
          // Age the line
          const newAge = line.age + 1
          
          // If line is too old, respawn it at a random location
          if (newAge > line.maxAge) {
            const angle = Math.random() * Math.PI * 2
            const length = 100 + Math.random() * 200
            const startX = Math.random() * dimensions.width
            const startY = Math.random() * dimensions.height
            const maxAge = 60 + Math.random() * 120
            
            return {
              ...line,
              startX,
              startY,
              endX: startX + Math.cos(angle) * length,
              endY: startY + Math.sin(angle) * length,
              angle,
              length,
              age: 0, // Reset age for fade-in
              maxAge,
              speed: 0.5 + Math.random() * 1.5,
              opacity: 0.2 + Math.random() * 0.6,
              strokeWidth: 1 + Math.random() * 2
            }
          }

          // Move the line based on its speed and angle
          let newStartX = line.startX + Math.cos(line.angle) * line.speed
          let newStartY = line.startY + Math.sin(line.angle) * line.speed

          // Wrap around screen edges
          if (newStartX > dimensions.width + 100) newStartX = -100
          if (newStartX < -100) newStartX = dimensions.width + 100
          if (newStartY > dimensions.height + 100) newStartY = -100
          if (newStartY < -100) newStartY = dimensions.height + 100

          const newEndX = newStartX + Math.cos(line.angle) * line.length
          const newEndY = newStartY + Math.sin(line.angle) * line.length

          return {
            ...line,
            startX: newStartX,
            startY: newStartY,
            endX: newEndX,
            endY: newEndY,
            age: newAge
          }
        })
        
        return newLines
      })
    }

    const interval = setInterval(animateLines, 50) // 20 FPS for smooth animation
    return () => clearInterval(interval)
  }, [lines.length, dimensions])

  const colors = getThemeColors()

  if (dimensions.width === 0 || dimensions.height === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        style={{ background: 'transparent' }}
      >
        <defs>
          {/* Gradient definitions for each theme */}
          <linearGradient id="whispy-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="50%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={colors.accent} />
          </linearGradient>
          
          <linearGradient id="whispy-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.secondary} />
            <stop offset="50%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={colors.primary} />
          </linearGradient>

          <linearGradient id="whispy-gradient-3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="50%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Matrix-style glow for hacker theme */}
          <filter id="matrix-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feFlood flood-color="#00ff41" flood-opacity="0.8" result="flood"/>
            <feComposite in="flood" in2="coloredBlur" operator="in" result="compositeBlur"/>
            <feMerge> 
              <feMergeNode in="compositeBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Coffee steam effect */}
          <filter id="coffee-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feFlood flood-color="#d2691e" flood-opacity="0.6" result="flood"/>
            <feComposite in="flood" in2="coloredBlur" operator="in" result="compositeBlur"/>
            <feMerge> 
              <feMergeNode in="compositeBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {lines.map((line, index) => {
          // Assign different gradients to create variety
          const gradientId = `whispy-gradient-${(index % 3) + 1}`
          
          // Calculate fade-in effect based on age (fade in over first 20 frames = 1 second)
          const fadeInDuration = 20
          const fadeInOpacity = line.age < fadeInDuration ? (line.age / fadeInDuration) : 1
          
          // Calculate fade-out effect for the last 20 frames of life
          const fadeOutStart = line.maxAge - 20
          const fadeOutOpacity = line.age > fadeOutStart ? ((line.maxAge - line.age) / 20) : 1
          
          // Combine both effects with the base opacity
          const finalOpacity = line.opacity * fadeInOpacity * fadeOutOpacity
          
          // Theme-specific effects
          const getFilterEffect = () => {
            switch (theme) {
              case 'developer':
                return 'url(#matrix-glow)'
              case 'coffee':
                return 'url(#coffee-glow)'
              default:
                return 'url(#glow)'
            }
          }

          // Developer theme: smooth opacity transitions
          const getOpacity = () => {
            return finalOpacity
          }
          
          return (
            <line
              key={line.id}
              x1={line.startX}
              y1={line.startY}
              x2={line.endX}
              y2={line.endY}
              stroke={`url(#${gradientId})`}
              strokeWidth={line.strokeWidth}
              opacity={getOpacity()}
              strokeLinecap="round"
              filter={getFilterEffect()}
              className="transition-all duration-100 ease-in-out"
            />
          )
        })}
      </svg>

      {/* Additional overlay for theme transition effects */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${colors.glow} 0%, transparent 50%), 
                      radial-gradient(circle at 70% 80%, ${colors.accent} 0%, transparent 50%),
                      radial-gradient(circle at 20% 80%, ${colors.secondary} 0%, transparent 50%)`
        }}
      />
    </div>
  )
}

export default WhispyBackground
