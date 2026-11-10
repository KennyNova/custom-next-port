import { NextResponse } from 'next/server'
import { getDatabase, isDatabaseAvailable } from '@/lib/db/mongodb'
import type { Project } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Database not configured - cannot load project posts' },
        { status: 503 }
      )
    }

    const db = await getDatabase()
    const collection = db.collection<Project>('projects')

    const project = await collection.findOne({ slug: params.slug })

    if (!project || project.isPublished === false) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error fetching project by slug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}
