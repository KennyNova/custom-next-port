import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, isDatabaseAvailable } from '@/lib/db/mongodb'
import type { Project } from '@/types'

export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({
        projects: [],
        message: 'Database not configured - no manual projects available'
      })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const featured = searchParams.get('featured')
    const orientation = searchParams.get('orientation') // 'vertical' | 'horizontal'
    const publishedOnly = searchParams.get('published') !== 'false'

    const db = await getDatabase()
    const collection = db.collection<Project>('projects')

    const query: Record<string, unknown> = {}
    if (type) {
      query.type = type
    }
    if (featured === 'true') {
      query.featured = true
    }
    if (orientation) {
      query.orientation = orientation
    }
    if (publishedOnly) {
      query.$or = [{ isPublished: true }, { isPublished: { $exists: false } }]
    }

    const projects = await collection
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .toArray()

    projects.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      if (a.order !== b.order) return a.order - b.order
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if database is available
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Database not configured - cannot create projects' },
        { status: 503 }
      )
    }
    const body = await request.json()
    const { 
      title, 
      description, 
      type = 'other',
      content,
      excerpt,
      tags,
      featuredImage,
      images, 
      technologies, 
      links, 
      featured = false,
      order = 0,
      orientation,
      isPublished = true,
      slug: customSlug
    } = body
    
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const collection = db.collection<Omit<Project, '_id'>>('projects')

    const baseSlug = (customSlug || title)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')

    let slug = baseSlug
    let counter = 1
    while (await collection.findOne({ slug })) {
      counter += 1
      slug = `${baseSlug}-${counter}`
    }
    
    const now = new Date()
    const newProject = {
      title,
      slug,
      description,
      type: type as Project['type'],
      content: content || '',
      excerpt: excerpt || (content ? String(content).substring(0, 200).trim() : description),
      tags: Array.isArray(tags) ? tags : [],
      featuredImage: featuredImage || '',
      isPublished,
      images: images || [],
      technologies: technologies || [],
      links: links || {},
      featured,
      order,
      orientation,
      createdAt: now,
      updatedAt: now
    }
    
    const result = await collection.insertOne(newProject)
    
    return NextResponse.json({ id: result.insertedId, slug }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}