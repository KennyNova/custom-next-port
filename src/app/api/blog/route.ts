import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'
import type { BlogPost } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tag = searchParams.get('tag')
    
    const db = await getDatabase()
    const collection = db.collection<BlogPost>('blogPosts')
    
    // Build query
    const query: any = { isPublished: true }
    if (tag && tag !== 'All') {
      query.tags = { $in: [tag] }
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit
    
    // Get posts with pagination
    const posts = await collection
      .find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    
    // Get total count for pagination info
    const total = await collection.countDocuments(query)
    
    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, excerpt, featuredImage, tags } = body
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const collection = db.collection<Omit<BlogPost, '_id'>>('blogPosts')
    
    const now = new Date()
    const newPost = {
      title,
      slug: title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      featuredImage: featuredImage || '',
      tags: tags || [],
      publishedAt: now,
      updatedAt: now,
      isPublished: false,
      readingTime: Math.ceil(content.split(/\s+/).length / 200),
      metadata: {
        views: 0,
        likes: 0
      }
    }
    
    const result = await collection.insertOne(newPost)
    
    return NextResponse.json({ id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}