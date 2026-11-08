import type { MetadataRoute } from 'next'
import { getDatabase, isDatabaseAvailable } from '@/lib/db/mongodb'
import { getHomelabTechnologies } from '@/lib/homelab-data'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600

const staticRoutes = [
  '',
  '/projects',
  '/blog',
  '/media',
  '/homelab',
  '/templates',
  '/consultation',
  '/quiz',
  '/signatures',
  '/podcast-pricing',
  '/privacy',
  '/terms',
]

async function blogEntries(): Promise<MetadataRoute.Sitemap> {
  if (!isDatabaseAvailable()) return []
  try {
    const db = await getDatabase()
    const posts = await db
      .collection('blogPosts')
      .find({ isPublished: true }, { projection: { slug: 1, updatedAt: 1, publishedAt: 1 } })
      .toArray()
    return posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt,
    }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = staticRoutes.map((route) => ({ url: `${SITE_URL}${route}` }))
  const homelab = getHomelabTechnologies().map((tech) => ({ url: `${SITE_URL}/homelab/${tech.slug}` }))
  return [...pages, ...homelab, ...(await blogEntries())]
}
