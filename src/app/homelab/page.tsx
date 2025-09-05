import { Metadata } from 'next'
import { useState } from 'react'
import { getHomelabHardware, getHomelabTechnologies, getDefaultHomelabOgImage } from '@/lib/homelab-data'
import { HomelabGrid } from '@/components/ui/homelab-grid'
import { HomelabModal } from '@/components/ui/homelab-modal'
import { HomelabArchitecture } from '@/components/ui/homelab-architecture'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cpu, HardDrive, Server, MemoryStick } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Homelab – Interactive Stack and Specs',
  description: 'Explore my self-hosted homelab: Proxmox VE, CasaOS, Docker apps, and hardware specs.',
  openGraph: {
    title: 'Homelab – Interactive Stack and Specs',
    description: 'Explore my self-hosted homelab: Proxmox VE, CasaOS, Docker apps, and hardware specs.',
    images: [{ url: getDefaultHomelabOgImage() }],
  },
}

export default function HomelabPage() {
  const technologies = getHomelabTechnologies()
  const specs = getHomelabHardware()
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const active = openSlug ? technologies.find((t) => t.slug === openSlug) || null : null

  return (
    <div className="container py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Homelab</h1>
        <p className="text-muted-foreground mt-2">Self-hosted, privacy-first setup: Proxmox host → CasaOS → Docker apps.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Technologies</h2>
        <HomelabGrid
          items={technologies}
          onSelect={(item) => setOpenSlug(item.slug)}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Server Specifications</h2>
        <Card>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPU</p>
                <p className="font-medium">{specs.cpu}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MemoryStick className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">RAM</p>
                <p className="font-medium">{specs.memory}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <HardDrive className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage</p>
                <p className="font-medium">{specs.storage}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Motherboard</p>
                <p className="font-medium">{specs.motherboard}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Architecture Overview</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Proxmox VE → CasaOS → Docker Apps</CardTitle>
          </CardHeader>
          <CardContent>
            <HomelabArchitecture />
          </CardContent>
        </Card>
      </section>

      <HomelabModal
        technology={active}
        isOpen={Boolean(active)}
        onClose={() => setOpenSlug(null)}
      />
    </div>
  )
}


