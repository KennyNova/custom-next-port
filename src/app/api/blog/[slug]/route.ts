import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'
import type { BlogPost } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    const db = await getDatabase()
    const collection = db.collection<BlogPost>('blogPosts')
    
    const post = await collection.findOne({ 
      slug, 
      isPublished: true 
    })
    
    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    // Increment view count
    await collection.updateOne(
      { _id: post._id },
      { $inc: { 'metadata.views': 1 } }
    )
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json()
    const { title, content, excerpt, featuredImage, tags, isPublished } = body
    
    const db = await getDatabase()
    const collection = db.collection<BlogPost>('blogPosts')
    
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (title) updateData.title = title
    if (content) {
      updateData.content = content
      updateData.readingTime = Math.ceil(content.split(/\s+/).length / 200)
    }
    if (excerpt) updateData.excerpt = excerpt
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage
    if (tags) updateData.tags = tags
    if (isPublished !== undefined) updateData.isPublished = isPublished
    
    const result = await collection.updateOne(
      { slug },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    const db = await getDatabase()
    const collection = db.collection<BlogPost>('blogPosts')
    
    const result = await collection.deleteOne({ slug })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}