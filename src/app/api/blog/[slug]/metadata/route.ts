import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const db = await getDatabase()
    const collection = db.collection('blogPosts')
    
    // Only fetch metadata fields (NOT the heavy content)
    // Note: MongoDB doesn't allow mixing inclusion and exclusion projections
    const post = await collection.findOne(
      { slug, isPublished: true },
      { 
        projection: {
          _id: 1,
          title: 1,
          slug: 1,
          excerpt: 1,
          featuredImage: 1,
          tags: 1,
          publishedAt: 1,
          updatedAt: 1,
          readingTime: 1,
          metadata: 1,
          isPublished: 1
          // Remove content: 0 since we're using inclusion projection
        }
      }
    )
    
    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }
    
    // Add cache headers for better performance
    const response = NextResponse.json(post)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    
    console.log(`📋 Served metadata for: ${slug} (${JSON.stringify(post).length} bytes)`)
    return response
  } catch (error) {
    console.error('Error fetching blog metadata:', error)
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 })
  }
}
