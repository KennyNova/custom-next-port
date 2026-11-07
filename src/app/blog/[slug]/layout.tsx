import type { Metadata } from 'next'
import { getDatabase, isDatabaseAvailable } from '@/lib/db/mongodb'

type Props = { params: { slug: string }; children: React.ReactNode }

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  if (!isDatabaseAvailable()) return { title: 'Blog' }
  try {
    const db = await getDatabase()
    const post = await db
      .collection('blogPosts')
      .findOne(
        { slug: params.slug, isPublished: true },
        { projection: { title: 1, excerpt: 1, featuredImage: 1, publishedAt: 1, tags: 1 } }
      )
    if (!post) return { title: 'Post not found' }
    return {
      title: post.title,
      description: post.excerpt,
      keywords: post.tags,
      alternates: { canonical: `/blog/${params.slug}` },
      openGraph: {
        type: 'article',
        title: post.title,
        description: post.excerpt,
        publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
        images: post.featuredImage ? [post.featuredImage] : undefined,
      },
    }
  } catch {
    return { title: 'Blog' }
  }
}

export default function BlogPostLayout({ children }: Props) {
  return children
}
