'use client'

import { motion } from 'framer-motion'
import { Server, Box, Boxes } from 'lucide-react'

export function HomelabArchitecture() {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Server className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Proxmox VE</p>
            <p className="text-sm text-muted-foreground">Host Hypervisor</p>
          </div>
        </motion.div>

        <div className="relative flex flex-col items-center">
          <div className="w-1 bg-muted h-10" />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-sky-500/10">
              <Box className="h-6 w-6 text-sky-500" />
            </div>
            <div>
              <p className="font-semibold">CasaOS</p>
              <p className="text-sm text-muted-foreground">VM/LXC on Proxmox</p>
            </div>
          </motion.div>
        </div>

        <div className="relative flex flex-col items-center">
          <div className="w-1 bg-muted h-10" />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Boxes className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold">Docker Apps</p>
              <p className="text-sm text-muted-foreground">Services managed by CasaOS</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}


