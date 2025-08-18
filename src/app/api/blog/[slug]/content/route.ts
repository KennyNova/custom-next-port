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
    
    // Only fetch the content field and minimal metadata for validation
    const post = await collection.findOne(
      { slug, isPublished: true },
      { projection: { content: 1, _id: 1, title: 1, isPublished: 1 } }
    )
    
    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }
    
    // Try to increment view count (only when content is actually loaded)
    // This may fail with read-only users, but that's okay
    try {
      await collection.updateOne(
        { slug },
        { $inc: { 'metadata.views': 1 } }
      )
    } catch (viewCountError) {
      console.warn('Could not update view count (read-only permissions):', viewCountError.message)
    }
    
    // Add cache headers for content
    const response = NextResponse.json({ 
      content: post.content,
      title: post.title // Include title for validation
    })
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    console.log(`📄 Served content for: ${slug} (${post.content?.length || 0} chars)`)
    return response
  } catch (error) {
    console.error('Error fetching blog content:', error)
    
    // Provide more specific error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isConnectionError = errorMessage.includes('MongoServer') || 
                             errorMessage.includes('connection') || 
                             errorMessage.includes('timeout')
    
    if (isConnectionError) {
      console.error('MongoDB connection issue detected:', errorMessage)
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch content',
      debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
