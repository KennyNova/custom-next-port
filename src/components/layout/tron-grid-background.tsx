'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/providers/theme-provider'
import { useIsConstrained } from '@/components/providers/perf-provider'

type ThemePalette = {
  grid: string
  pulse: string
  glow: string
  scanline: string
  ambientPrimary: string
  ambientSecondary: string
  veilAlpha: number
}

type GridGeometry = {
  width: number
  height: number
  centerX: number
  baseHorizonY: number
  horizontalYs: number[]
  verticalBottomXs: number[]
}

type Point = {
  x: number
  y: number
}

const MOUSE_RADIUS = 150
const MOUSE_STRENGTH = 24

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount

const rgba = (rgb: string, alpha: number) => `rgba(${rgb}, ${alpha})`

const getThemePalette = (theme: string): ThemePalette => {
  switch (theme) {
    case 'dark':
      return {
        grid: '0, 255, 255',
        pulse: '125, 223, 255',
        glow: '0, 180, 255',
        scanline: '0, 255, 255',
        ambientPrimary: '0, 120, 210',
        ambientSecondary: '0, 255, 255',
        veilAlpha: 0.32,
      }
    case 'developer':
      return {
        grid: '0, 255, 65',
        pulse: '0, 255, 65',
        glow: '0, 255, 110',
        scanline: '0, 255, 65',
        ambientPrimary: '0, 120, 40',
        ambientSecondary: '0, 255, 65',
        veilAlpha: 0.36,
      }
    case 'coffee':
      return {
        grid: '212, 165, 116',
        pulse: '245, 200, 66',
        glow: '232, 171, 84',
        scanline: '212, 165, 116',
        ambientPrimary: '140, 90, 45',
        ambientSecondary: '245, 200, 66',
        veilAlpha: 0.16,
      }
    case 'pastel':
      return {
        grid: '192, 132, 252',
        pulse: '249, 168, 212',
        glow: '216, 180, 254',
        scanline: '192, 132, 252',
        ambientPrimary: '160, 110, 220',
        ambientSecondary: '249, 168, 212',
        veilAlpha: 0.14,
      }
    default:
      return {
        grid: '29, 78, 216',
        pulse: '59, 130, 246',
        glow: '37, 99, 235',
        scanline: '59, 130, 246',
        ambientPrimary: '59, 130, 246',
        ambientSecondary: '96, 165, 250',
        veilAlpha: 0.08,
      }
  }
}

const buildGeometry = (width: number, height: number): GridGeometry => {
  const centerX = width / 2
  const baseHorizonY = height * 0.44

  const horizontalCount = 30
  const horizontalYs = Array.from({ length: horizontalCount }, (_, index) => {
    const t = (index + 1) / horizontalCount
    return baseHorizonY + Math.pow(t, 1.8) * (height - baseHorizonY + 120)
  })

  const verticalCount = 28
  const verticalBottomXs = Array.from({ length: verticalCount }, (_, index) => {
    const spread = width * 1.3
    return centerX - spread / 2 + (index / (verticalCount - 1)) * spread
  })

  return {
    width,
    height,
    centerX,
    baseHorizonY,
    horizontalYs,
    verticalBottomXs,
  }
}

const applyMouseWarp = (point: Point, mouse: Point): Point => {
  const dx = point.x - mouse.x
  const dy = point.y - mouse.y
  const distance = Math.hypot(dx, dy)

  if (distance === 0 || distance > MOUSE_RADIUS) {
    return point
  }

  const strength = Math.pow(1 - distance / MOUSE_RADIUS, 2) * MOUSE_STRENGTH
  return {
    x: point.x + (dx / distance) * strength,
    y: point.y + (dy / distance) * strength,
  }
}

const drawGridFrame = (
  ctx: CanvasRenderingContext2D,
  geometry: GridGeometry,
  mouseCurrent: Point,
  scrollY: number,
  timeMs: number,
  palette: ThemePalette
) => {
  const { width, height, centerX, baseHorizonY, horizontalYs, verticalBottomXs } = geometry
  const horizonY = clamp(baseHorizonY - scrollY * 0.14, height * 0.2, height * 0.62)
  const bottomDistance = Math.max(height - horizonY + 120, 1)

  ctx.clearRect(0, 0, width, height)

  const pulseRadius = (timeMs * (0.14 + Math.min(scrollY / 5000, 0.06))) % Math.hypot(width, height)
  const radialCenter: Point = { x: centerX, y: horizonY }

  // Horizontal perspective lines.
  for (const y of horizontalYs) {
    const t = clamp((y - horizonY) / bottomDistance, 0, 1.15)
    const baseAlpha = 0.1 + (1 - Math.min(t, 1)) * 0.26
    const baseWidth = 1 + (1 - Math.min(t, 1)) * 1.7

    const left = applyMouseWarp({ x: -90, y }, mouseCurrent)
    const right = applyMouseWarp({ x: width + 90, y }, mouseCurrent)
    const midX = (left.x + right.x) / 2
    const midY = (left.y + right.y) / 2
    const distToPulse = Math.abs(Math.hypot(midX - radialCenter.x, midY - radialCenter.y) - pulseRadius)
    const pulseBoost = clamp(1 - distToPulse / 120, 0, 1)

    ctx.beginPath()
    ctx.moveTo(left.x, left.y)
    ctx.lineTo(right.x, right.y)
    ctx.strokeStyle = rgba(palette.grid, baseAlpha + pulseBoost * 0.34)
    ctx.lineWidth = baseWidth + pulseBoost * 1.2
    ctx.shadowColor = rgba(palette.glow, 0.55)
    ctx.shadowBlur = 8 + pulseBoost * 14
    ctx.stroke()
  }

  // Faint mirrored lines above horizon for added depth.
  for (let i = 0; i < 7; i += 1) {
    const y = horizonY - (i + 1) * 26
    if (y < -40) continue
    const left = applyMouseWarp({ x: -80, y }, mouseCurrent)
    const right = applyMouseWarp({ x: width + 80, y }, mouseCurrent)

    ctx.beginPath()
    ctx.moveTo(left.x, left.y)
    ctx.lineTo(right.x, right.y)
    ctx.strokeStyle = rgba(palette.grid, 0.04 + (6 - i) * 0.01)
    ctx.lineWidth = 0.8
    ctx.shadowColor = rgba(palette.glow, 0.2)
    ctx.shadowBlur = 4
    ctx.stroke()
  }

  // Vertical lines from horizon to floor.
  for (const bottomX of verticalBottomXs) {
    const top = applyMouseWarp({ x: centerX, y: horizonY }, mouseCurrent)
    const bottom = applyMouseWarp({ x: bottomX, y: height + 100 }, mouseCurrent)
    const midX = (top.x + bottom.x) / 2
    const midY = (top.y + bottom.y) / 2
    const distToPulse = Math.abs(Math.hypot(midX - radialCenter.x, midY - radialCenter.y) - pulseRadius)
    const pulseBoost = clamp(1 - distToPulse / 150, 0, 1)

    ctx.beginPath()
    ctx.moveTo(top.x, top.y)
    ctx.lineTo(bottom.x, bottom.y)
    ctx.strokeStyle = rgba(palette.grid, 0.16 + pulseBoost * 0.28)
    ctx.lineWidth = 1.1 + pulseBoost
    ctx.shadowColor = rgba(palette.glow, 0.5)
    ctx.shadowBlur = 6 + pulseBoost * 12
    ctx.stroke()
  }

  // Sparse glow nodes at grid intersections.
  const sampledHorizontal = horizontalYs.filter((_, index) => index % 4 === 0)
  const sampledVertical = verticalBottomXs.filter((_, index) => index % 3 === 0)
  for (const y of sampledHorizontal) {
    const yRatio = clamp((y - horizonY) / bottomDistance, 0, 1.2)
    for (const bottomX of sampledVertical) {
      const rawX = centerX + (bottomX - centerX) * yRatio
      const point = applyMouseWarp({ x: rawX, y }, mouseCurrent)
      const distToPulse = Math.abs(Math.hypot(point.x - radialCenter.x, point.y - radialCenter.y) - pulseRadius)
      const pulseBoost = clamp(1 - distToPulse / 100, 0, 1)

      ctx.beginPath()
      ctx.arc(point.x, point.y, 1 + pulseBoost * 1.4, 0, Math.PI * 2)
      ctx.fillStyle = rgba(palette.pulse, 0.2 + pulseBoost * 0.58)
      ctx.shadowColor = rgba(palette.glow, 0.75)
      ctx.shadowBlur = 8 + pulseBoost * 12
      ctx.fill()
    }
  }

  ctx.shadowBlur = 0
}

const TronGridBackground = () => {
  const { theme } = useTheme()
  const isConstrained = useIsConstrained()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const geometryRef = useRef<GridGeometry | null>(null)
  const mouseTargetRef = useRef<Point>({ x: -1000, y: -1000 })
  const mouseCurrentRef = useRef<Point>({ x: -1000, y: -1000 })
  const scrollRef = useRef(0)

  useEffect(() => {
    if (isConstrained) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const palette = getThemePalette(theme)

    const resize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      geometryRef.current = buildGeometry(width, height)
    }

    const onMouseMove = (event: MouseEvent) => {
      mouseTargetRef.current = { x: event.clientX, y: event.clientY }
    }

    const onMouseLeave = () => {
      mouseTargetRef.current = { x: -1000, y: -1000 }
    }

    const onScroll = () => {
      scrollRef.current = window.scrollY
    }

    const render = (timeMs: number) => {
      mouseCurrentRef.current = {
        x: lerp(mouseCurrentRef.current.x, mouseTargetRef.current.x, 0.08),
        y: lerp(mouseCurrentRef.current.y, mouseTargetRef.current.y, 0.08),
      }

      if (geometryRef.current) {
        drawGridFrame(
          ctx,
          geometryRef.current,
          mouseCurrentRef.current,
          scrollRef.current,
          timeMs,
          palette
        )
      }

      animationFrameRef.current = window.requestAnimationFrame(render)
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameRef.current !== null) {
          window.cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        return
      }

      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(render)
      }
    }

    resize()
    onScroll()
    animationFrameRef.current = window.requestAnimationFrame(render)
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseout', onMouseLeave, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseout', onMouseLeave)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [isConstrained, theme])

  if (isConstrained) {
    return null
  }

  const palette = getThemePalette(theme)

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 38%, rgba(${palette.ambientPrimary}, 0.24) 0%, rgba(${palette.ambientPrimary}, 0.08) 35%, transparent 70%),
            radial-gradient(circle at 80% 75%, rgba(${palette.ambientSecondary}, 0.18) 0%, transparent 55%),
            linear-gradient(to bottom, rgba(2, 8, 23, ${palette.veilAlpha}) 0%, rgba(2, 8, 23, 0) 45%)
          `,
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          opacity: 0.14,
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(${palette.scanline}, 0.24) 2px,
            rgba(${palette.scanline}, 0.24) 4px
          )`,
        }}
      />
    </div>
  )
}

export default TronGridBackground
