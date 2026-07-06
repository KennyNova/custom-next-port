'use client'

import { useTheme } from '@/components/providers/theme-provider'
import { useIsConstrained } from '@/components/providers/perf-provider'
import { useEffect, useRef, useState } from 'react'

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
  depth: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount

const WhispyBackground = () => {
  const { theme } = useTheme()
  const isConstrained = useIsConstrained()
  const [lines, setLines] = useState<Line[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const scrollTargetRef = useRef(0)
  const scrollCurrentRef = useRef(0)

  // Initialize dimensions (must run before early return - Rules of Hooks)
  useEffect(() => {
    if (isConstrained) return

    const updateScrollTarget = () => {
      scrollTargetRef.current = clamp(window.scrollY, 0, 700)
    }

    updateScrollTarget()
    window.addEventListener('scroll', updateScrollTarget, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateScrollTarget)
    }
  }, [isConstrained])

  useEffect(() => {
    if (isConstrained) return

    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [isConstrained])

  useEffect(() => {
    if (isConstrained || dimensions.width === 0 || dimensions.height === 0) return
    const createLines = () => {
      const newLines: Line[] = []
      const numLines = Math.floor((dimensions.width * dimensions.height) / 15000)
      for (let i = 0; i < numLines; i++) {
        const angle = Math.random() * Math.PI * 2
        // Depth controls near/far layering for parallax response.
        // Higher depth = closer to viewer.
        const depth = Math.pow(Math.random(), 0.75)
        const length = 90 + depth * 140 + Math.random() * 120
        const startX = Math.random() * dimensions.width
        const startY = Math.random() * dimensions.height
        const maxAge = 60 + Math.random() * 120
        newLines.push({
          id: i,
          startX,
          startY,
          endX: startX + Math.cos(angle) * length,
          endY: startY + Math.sin(angle) * length,
          opacity: 0.18 + depth * 0.42 + Math.random() * 0.2,
          strokeWidth: 0.8 + depth * 1.8 + Math.random() * 0.7,
          length,
          angle,
          speed: 0.35 + depth * 1.25 + Math.random() * 0.8,
          age: Math.random() * maxAge,
          maxAge,
          depth
        })
      }
      setLines(newLines)
    }
    createLines()
  }, [isConstrained, dimensions])

  useEffect(() => {
    if (isConstrained || lines.length === 0) return
    const animateLines = () => {
      scrollCurrentRef.current = lerp(scrollCurrentRef.current, scrollTargetRef.current, 0.08)

      setLines(prevLines =>
        prevLines.map(line => {
          const newAge = line.age + 1
          if (newAge > line.maxAge) {
            const angle = Math.random() * Math.PI * 2
            const depth = Math.pow(Math.random(), 0.75)
            const length = 90 + depth * 140 + Math.random() * 120
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
              age: 0,
              maxAge,
              depth,
              speed: 0.35 + depth * 1.25 + Math.random() * 0.8,
              opacity: 0.18 + depth * 0.42 + Math.random() * 0.2,
              strokeWidth: 0.8 + depth * 1.8 + Math.random() * 0.7
            }
          }
          let newStartX = line.startX + Math.cos(line.angle) * line.speed
          let newStartY = line.startY + Math.sin(line.angle) * line.speed
          if (newStartX > dimensions.width + 100) newStartX = -100
          if (newStartX < -100) newStartX = dimensions.width + 100
          if (newStartY > dimensions.height + 100) newStartY = -100
          if (newStartY < -100) newStartY = dimensions.height + 100
          const newEndX = newStartX + Math.cos(line.angle) * line.length
          const newEndY = newStartY + Math.sin(line.angle) * line.length
          return { ...line, startX: newStartX, startY: newStartY, endX: newEndX, endY: newEndY, age: newAge }
        })
      )
    }
    const interval = setInterval(animateLines, 50)
    return () => clearInterval(interval)
  }, [isConstrained, lines.length, dimensions])

  // Early return for constrained environments (after all hooks)
  if (isConstrained) {
    return null
  }

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

          const positionDepth = clamp(((line.startY + line.endY) / 2) / dimensions.height, 0, 1)
          const parallaxDepth = clamp(positionDepth * 0.35 + line.depth * 0.65, 0, 1)
          const scrollShiftY = scrollCurrentRef.current * (0.008 + parallaxDepth * 0.024)

          const x1 = line.startX
          const y1 = line.startY - scrollShiftY
          const x2 = line.endX
          const y2 = line.endY - scrollShiftY * 1.08
          
          return (
            <line
              key={line.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
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
          background: `radial-gradient(circle at 30% ${20 - scrollCurrentRef.current * 0.008}%, ${colors.glow} 0%, transparent 50%), 
                      radial-gradient(circle at 70% ${80 - scrollCurrentRef.current * 0.01}%, ${colors.accent} 0%, transparent 50%),
                      radial-gradient(circle at 20% ${80 - scrollCurrentRef.current * 0.006}%, ${colors.secondary} 0%, transparent 50%)`
        }}
      />
    </div>
  )
}

export default WhispyBackground
