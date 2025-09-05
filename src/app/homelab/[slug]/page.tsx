import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getHomelabTechnologyBySlug, getDefaultHomelabOgImage } from '@/lib/homelab-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

type Props = { params: { slug: string } }

export function generateMetadata({ params }: Props): Metadata {
  const tech = getHomelabTechnologyBySlug(params.slug)
  if (!tech) return {}
  const title = `${tech.name} – Homelab`
  const description = tech.shortDescription
  const url = `/homelab/${tech.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    keywords: ['homelab', 'self-hosted', tech.name, 'Proxmox', 'CasaOS', 'Docker'].join(', '),
    url,
  }
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: getDefaultHomelabOgImage(tech.slug) }],
    },
    other: {
      'script:type:application/ld+json': JSON.stringify(jsonLd),
    },
  }
}

export default function HomelabTechPage({ params }: Props) {
  const tech = getHomelabTechnologyBySlug(params.slug)
  if (!tech) return notFound()
  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{tech.name}</h1>
        <p className="text-muted-foreground mt-2">{tech.shortDescription}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">What it is</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{tech.whatItIs}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Why I chose it</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{tech.whyChosen}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">How it fits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{tech.howItFits}</p>
          </CardContent>
        </Card>
      </div>

      {tech.keyDetails?.length ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Key details</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {tech.keyDetails.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {tech.links?.length ? (
        <div className="flex flex-wrap gap-2">
          {tech.links.map((l) => (
            <Button key={l.url} asChild variant="outline" className="text-sm">
              <a href={l.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> {l.label}
              </a>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}


