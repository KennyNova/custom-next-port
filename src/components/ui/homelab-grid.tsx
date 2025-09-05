'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Boxes, Server, HardDrive, Settings, Layers } from 'lucide-react'
import type { HomelabTechnology } from '@/types'

const iconMap: Record<string, React.ComponentType<any>> = {
  proxmox: Server,
  casaos: Settings,
  cpu: Cpu,
  docker: Boxes,
  ubuntu: Layers,
  chip: HardDrive,
}

interface HomelabGridProps {
  items: HomelabTechnology[]
  onSelect: (item: HomelabTechnology) => void
}

export function HomelabGrid({ items, onSelect }: HomelabGridProps) {
  const sorted = useMemo(() => items.slice().sort((a, b) => a.name.localeCompare(b.name)), [items])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {sorted.map((t) => {
        const Icon = iconMap[t.iconKey] ?? Settings
        return (
          <motion.button
            key={t.slug}
            onClick={() => onSelect(t)}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors text-left"
            aria-label={`Open details for ${t.name}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${t.brandColor || 'hsl(var(--primary))'}20` }}>
                <Icon className="h-6 w-6" style={{ color: t.brandColor || 'hsl(var(--primary))' }} />
              </div>
              <div>
                <p className="font-semibold leading-tight">{t.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.shortDescription}</p>
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}


