'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowRight, Box, Cloud, Code, FileText, Film, Globe, Home, Layers, Monitor, Server, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { casaOSApps, getHomelabHardware } from '@/lib/homelab-data'

type Layer = {
  id: string
  name: string
  icon: LucideIcon
  plain: string
  analogy: string
  // Slug of a /homelab/[slug] page, when one exists
  slug?: string
  // parentId in casaOSApps, for app groups
  appsGroup?: string
}

const specs = getHomelabHardware()

const HARDWARE: Layer = {
  id: 'hardware',
  name: 'The server',
  icon: Server,
  plain: `One physical computer that stays on all day: an ${specs.cpu} with ${specs.memory} and ${specs.storage}. Everything else in this diagram runs on this single box.`,
  analogy: 'The building everything else lives in.',
  slug: 'hardware',
}

const PROXMOX: Layer = {
  id: 'proxmox',
  name: 'Proxmox VE',
  icon: Layers,
  plain: 'Software that splits the one computer into several separate virtual computers, called VMs. Each gets its own share of memory and storage, and one can crash or be rebuilt without touching the others.',
  analogy: 'Walls that divide one building into separate apartments.',
  slug: 'proxmox',
}

const VMS: Layer[] = [
  {
    id: 'casaos',
    name: 'CasaOS',
    icon: Box,
    plain: 'An app store for the server. It installs self-hosted apps and runs each one in its own container, so apps stay out of each other\'s way. The groups below are what it runs.',
    analogy: 'The apartment where most of the household lives.',
    slug: 'casaos',
  },
  {
    id: 'coolify',
    name: 'Coolify',
    icon: Globe,
    plain: 'Where I host my own websites and projects. I point it at code and it builds the site and puts it online, the way Netlify or Heroku would, but on my hardware.',
    analogy: 'A workshop that turns code into live websites.',
    slug: 'coolify',
  },
  {
    id: 'homeassistant',
    name: 'Home Assistant',
    icon: Home,
    plain: 'Controls the smart devices in the house from one place and runs automations between them, locally instead of through each brand\'s own app.',
    analogy: 'One remote for every gadget in the house.',
    slug: 'homeassistant',
  },
  {
    id: 'windows-vm',
    name: 'Windows',
    icon: Monitor,
    plain: 'A full Windows computer running inside the server, for anything that only works on Windows.',
    analogy: 'A spare PC that takes up no desk space.',
  },
  {
    id: 'cloudstorage',
    name: 'Cloud storage',
    icon: Cloud,
    plain: 'File storage and sharing that I control, so files are reachable from any device without paying for a storage plan.',
    analogy: 'A private Dropbox.',
  },
]

const APP_GROUPS: Layer[] = [
  {
    id: 'media-group',
    name: 'Media',
    icon: Film,
    plain: 'Jellyfin streams movies, shows and music to any screen in the house. The other apps keep that library organised and add subtitles. There is also a Minecraft server and retro game emulation.',
    analogy: 'A personal streaming service.',
    appsGroup: 'media-group',
  },
  {
    id: 'dev-group',
    name: 'Dev tools',
    icon: Code,
    plain: 'My own code hosting, workflow automation with n8n, and VS Code running in the browser, plus tools to watch the containers themselves.',
    analogy: 'A private GitHub and toolbox.',
    appsGroup: 'dev-group',
  },
  {
    id: 'productivity-group',
    name: 'Productivity',
    icon: FileText,
    plain: 'Notes, a wiki, an e-book library, budgeting, invoicing and scheduling, kept on my own hardware instead of in someone else\'s cloud.',
    analogy: 'The filing cabinet and the accounts book.',
    appsGroup: 'productivity-group',
  },
  {
    id: 'network-group',
    name: 'Network',
    icon: Shield,
    plain: 'Blocks ads for every device on the network, stores passwords, and lets me reach the server securely when I am away from home.',
    analogy: 'The front door, the locks and the key cabinet.',
    appsGroup: 'network-group',
  },
  {
    id: 'admin-group',
    name: 'System',
    icon: Activity,
    plain: 'Keeps an eye on the server\'s health, and runs the shared pieces other apps lean on: a database, photo backup from my phone and file sync.',
    analogy: 'The utility room.',
    appsGroup: 'admin-group',
  },
]

const ALL_LAYERS = [HARDWARE, PROXMOX, ...VMS, ...APP_GROUPS]

function LayerButton({ layer, selected, onSelect, className = '' }: { layer: Layer; selected: boolean; onSelect: (id: string) => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(layer.id)}
      aria-pressed={selected}
      className={`flex items-center gap-2 rounded-lg border-2 p-3 text-left text-sm font-medium text-foreground transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-primary/40 ${
        selected ? 'border-primary bg-primary/10' : 'bg-card'
      } ${className}`}
    >
      <layer.icon className="h-4 w-4 flex-shrink-0 text-primary" />
      <span>{layer.name}</span>
    </button>
  )
}

function Connector() {
  return <div className="mx-auto h-5 w-0.5 bg-border" />
}

export function HomelabExplorer() {
  const [selectedId, setSelectedId] = useState(HARDWARE.id)
  const selected = ALL_LAYERS.find((layer) => layer.id === selectedId) ?? HARDWARE
  const apps = selected.appsGroup ? casaOSApps.filter((app) => app.parentId === selected.appsGroup) : []

  return (
    <Card className="border-2">
      <CardContent className="p-4 md:p-6">
        <p className="mb-4 text-xs text-muted-foreground">Click any layer to see what it does.</p>

        <LayerButton layer={HARDWARE} selected={selectedId === HARDWARE.id} onSelect={setSelectedId} className="w-full" />
        <Connector />
        <LayerButton layer={PROXMOX} selected={selectedId === PROXMOX.id} onSelect={setSelectedId} className="w-full" />
        <Connector />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {VMS.map((vm) => (
            <LayerButton key={vm.id} layer={vm} selected={selectedId === vm.id} onSelect={setSelectedId} />
          ))}
        </div>

        <div className="mt-3 rounded-lg border-2 border-dashed p-3">
          <p className="mb-2 text-xs text-muted-foreground">Apps inside CasaOS</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {APP_GROUPS.map((group) => (
              <LayerButton key={group.id} layer={group} selected={selectedId === group.id} onSelect={setSelectedId} />
            ))}
          </div>
        </div>

        <div key={selected.id} aria-live="polite" className="mt-5 animate-in fade-in-0 slide-in-from-bottom-1 border-t pt-5 duration-300">
          <div className="flex items-center gap-2">
            <selected.icon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{selected.name}</h3>
          </div>
          <p className="mt-2 text-sm">{selected.plain}</p>
          <p className="mt-2 text-sm text-muted-foreground">Think of it as {selected.analogy.charAt(0).toLowerCase() + selected.analogy.slice(1)}</p>

          {apps.length > 0 && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {apps.map((app) => (
                <li key={app.id} className="rounded-md bg-secondary px-3 py-2 text-xs text-secondary-foreground">
                  <span className="font-medium">{app.name}</span>
                  <span className="text-muted-foreground"> · {app.description}</span>
                </li>
              ))}
            </ul>
          )}

          {selected.slug && (
            <Link
              href={`/homelab/${selected.slug}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Read more
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
