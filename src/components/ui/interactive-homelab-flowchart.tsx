'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Server, Box, Layers, Globe, Home, Monitor, Cloud, Film, Code, FileText, 
  Shield, Settings, Tv, Play, Search, Database, Music, Book, Download, 
  Gamepad2, Disc, GitBranch, Workflow, Code2, Container, ScrollText, Brain, 
  RefreshCw, StickyNote, BookOpen, Library, FileText as Notebook, DollarSign, Receipt, 
  TrendingUp, ShieldCheck, Route, KeyRound, Network, Activity, BarChart3, 
  Cpu, Zap, Blocks, CloudCog, Image, Building, Calendar, ZoomIn, ZoomOut, 
  RotateCcw, Maximize2, Info
} from 'lucide-react'
import type { HomelabNode } from '@/types'
import { FlowchartNodeModal } from './flowchart-node-modal'

// Icon mapping
const iconMap: Record<string, any> = {
  Server, Box, Layers, Globe, Home, Monitor, Cloud, Film, Code, FileText,
  Shield, Settings, Tv, Play, Search, Database, Music, Book, Download,
  Gamepad2, Disc, GitBranch, Workflow, Code2, Container, ScrollText, Brain,
  RefreshCw, StickyNote, BookOpen, Library, Notebook, DollarSign, Receipt,
  TrendingUp, ShieldCheck, Route, KeyRound, Network, Activity, BarChart3,
  Cpu, Zap, Blocks, CloudCog, Image, Building, Calendar
}

interface FlowchartNode extends HomelabNode {
  // No dragging functionality - fixed positions for clean organization
}

interface FlowchartProps {
  nodes: HomelabNode[]
  onNodeClick?: (node: HomelabNode) => void
}

interface ViewBox {
  x: number
  y: number
  width: number
  height: number
  zoom: number
}

export function InteractiveHomelabFlowchart({ nodes, onNodeClick }: FlowchartProps) {
  const [flowchartNodes] = useState<FlowchartNode[]>(nodes)
  const [viewBox, setViewBox] = useState<ViewBox>({ x: 0, y: 0, width: 1400, height: 1400, zoom: 0.8 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [showInfo, setShowInfo] = useState(false)
  const [selectedNode, setSelectedNode] = useState<HomelabNode | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle canvas pan only
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).closest('.flowchart-background')) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const dx = (e.clientX - panStart.x) / viewBox.zoom
      const dy = (e.clientY - panStart.y) / viewBox.zoom
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy
      }))
      
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [isPanning, panStart, viewBox.zoom])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Handle zoom with proper event handling to prevent page scroll
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Only prevent default and handle zoom if the mouse is over the SVG
    const target = e.target as Element
    if (target && (target === svgRef.current || target.closest('svg') === svgRef.current)) {
      e.preventDefault()
      e.stopPropagation()
      
      const delta = e.deltaY * -0.01
      const newZoom = Math.min(Math.max(0.25, viewBox.zoom + delta), 3)
      
      // Zoom towards mouse position
      const rect = svgRef.current?.getBoundingClientRect()
      if (rect) {
        const centerX = e.clientX - rect.left
        const centerY = e.clientY - rect.top
        
        const zoomRatio = newZoom / viewBox.zoom
        const newX = viewBox.x + (centerX / viewBox.zoom) * (1 - zoomRatio)
        const newY = viewBox.y + (centerY / viewBox.zoom) * (1 - zoomRatio)
        
        setViewBox(prev => ({
          ...prev,
          x: newX,
          y: newY,
          zoom: newZoom
        }))
      }
    }
  }, [viewBox])

  // Zoom controls
  const zoomIn = () => {
    const newZoom = Math.min(viewBox.zoom * 1.2, 3)
    setViewBox(prev => ({ ...prev, zoom: newZoom }))
  }

  const zoomOut = () => {
    const newZoom = Math.max(viewBox.zoom * 0.8, 0.25)
    setViewBox(prev => ({ ...prev, zoom: newZoom }))
  }

  const resetView = () => {
    setViewBox({ x: 0, y: 0, width: 1400, height: 1200, zoom: 1 })
  }

  const fitToScreen = () => {
    const container = containerRef.current
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const zoom = Math.min(rect.width / 1400, rect.height / 1400) * 0.9
    
    setViewBox({
      x: (1400 - rect.width / zoom) / 2,
      y: (1400 - rect.height / zoom) / 2,
      width: rect.width / zoom,
      height: rect.height / zoom,
      zoom
    })
  }

  // No node dragging - nodes have fixed, organized positions

  // Generate connection lines
  const generateConnections = () => {
    const connections: JSX.Element[] = []
    
    flowchartNodes.forEach(node => {
      if (node.parentId) {
        const parent = flowchartNodes.find(n => n.id === node.parentId)
        if (parent) {
          const key = `${parent.id}-${node.id}`
          connections.push(
            <motion.line
              key={key}
              x1={parent.position.x + 60}
              y1={parent.position.y + 30}
              x2={node.position.x + 60}
              y2={node.position.y + 30}
              stroke="#6B7280"
              strokeWidth="2"
              strokeDasharray="4,4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="opacity-60"
            />
          )
        }
      }
    })
    
    return connections
  }

  // Render nodes with fixed positions
  const renderNode = (node: FlowchartNode) => {
    const Icon = iconMap[node.icon] || Settings
    
    return (
      <motion.g
        key={node.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
        style={{ cursor: 'pointer' }}
      >
        <motion.rect
          x={node.position.x}
          y={node.position.y}
          width={130}
          height={65}
          rx={8}
          fill={node.color}
          fillOpacity={0.1}
          stroke={node.color}
          strokeWidth={2}
          whileHover={{ scale: 1.05, fillOpacity: 0.2 }}
          onClick={() => {
            setSelectedNode(node)
            setIsModalOpen(true)
            onNodeClick?.(node)
          }}
          className="transition-all duration-200"
        />
        
        <Icon 
          x={node.position.x + 10} 
          y={node.position.y + 10} 
          width={20} 
          height={20}
          fill={node.color}
        />
        
        <text
          x={node.position.x + 35}
          y={node.position.y + 20}
          fontSize="11"
          fontWeight="600"
          fill="currentColor"
          className="pointer-events-none select-none"
        >
          {node.name.length > 14 ? `${node.name.substring(0, 14)}...` : node.name}
        </text>
        
        <text
          x={node.position.x + 10}
          y={node.position.y + 45}
          fontSize="9"
          fill="currentColor"
          fillOpacity={0.7}
          className="pointer-events-none select-none"
        >
          {node.description.length > 22 ? `${node.description.substring(0, 22)}...` : node.description}
        </text>
      </motion.g>
    )
  }

  // Add wheel event listener to container to prevent page scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleContainerWheel = (e: WheelEvent) => {
      // Check if the wheel event is happening over the flowchart
      const target = e.target as Element
      if (target && (target === svgRef.current || target.closest('svg') === svgRef.current)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    container.addEventListener('wheel', handleContainerWheel, { passive: false })
    
    return () => {
      container.removeEventListener('wheel', handleContainerWheel)
    }
  }, [])

  return (
    <div className="relative w-full h-[600px] bg-muted/20 rounded-lg border overflow-hidden" ref={containerRef}>
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button variant="outline" size="sm" onClick={() => setShowInfo(!showInfo)}>
          <Info className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={resetView}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={fitToScreen}>
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-4 left-4 z-10"
        >
          <Card className="w-64">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Homelab Architecture</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Scroll to zoom in/out</p>
                <p>• Click nodes for details</p>
                <p>• Drag canvas to pan around</p>
                <p>• Fixed organized layout</p>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Zoom: {Math.round(viewBox.zoom * 100)}%
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width / viewBox.zoom} ${viewBox.height / viewBox.zoom}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="cursor-grab active:cursor-grabbing"
      >
        {/* Background pattern */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
          </pattern>
        </defs>
        <rect 
          x={viewBox.x - 1000} 
          y={viewBox.y - 1000} 
          width={viewBox.width / viewBox.zoom + 2000} 
          height={viewBox.height / viewBox.zoom + 2000} 
          fill="url(#grid)" 
          className="flowchart-background"
        />

        {/* Connection lines */}
        {generateConnections()}

        {/* Nodes */}
        {flowchartNodes.map(renderNode)}
      </svg>

      {/* Node Details Modal */}
      <FlowchartNodeModal
        node={selectedNode}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedNode(null)
        }}
      />
    </div>
  )
}
