import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'
import type { Project } from '@/types'

// GitHub repository interface
interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  topics: string[]
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  pushed_at: string
}

async function fetchGitHubProjects(): Promise<Project[]> {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.warn('GITHUB_TOKEN not configured, skipping GitHub projects')
    return []
  }

  try {
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-App'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const repos: GitHubRepo[] = await response.json()

    // Convert GitHub repos to Project format
    const githubProjects: Project[] = repos
      .filter(repo => !repo.name.includes('fork') && repo.description) // Filter out forks and repos without descriptions
      .map((repo, index) => ({
        _id: `github-${repo.id}` as any,
        title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        slug: repo.name,
        description: repo.description || 'No description available',
        type: 'github' as const,
        images: [],
        technologies: repo.language ? [repo.language, ...repo.topics] : repo.topics,
        links: {
          github: repo.html_url,
          live: repo.homepage || undefined,
        },
        featured: repo.stargazers_count > 0 || repo.forks_count > 0, // Feature repos with stars or forks
        order: index,
        createdAt: new Date(repo.created_at),
        updatedAt: new Date(repo.updated_at),
      }))

    return githubProjects
  } catch (error) {
    console.error('Error fetching GitHub projects:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const featured = searchParams.get('featured')
    const includeGithub = searchParams.get('includeGithub') !== 'false'
    
    let allProjects: Project[] = []
    
    // Fetch GitHub projects if requested
    if (includeGithub && (type === 'github' || type === null)) {
      const githubProjects = await fetchGitHubProjects()
      allProjects = [...allProjects, ...githubProjects]
    }
    
    // Fetch database projects if not exclusively requesting GitHub
    if (type !== 'github') {
      const db = await getDatabase()
      const collection = db.collection<Project>('projects')
      
      // Build query for database projects
      const query: any = {}
      if (type) {
        query.type = type
      }
      if (featured === 'true') {
        query.featured = true
      }
      
      // Get projects sorted by order and creation date
      const dbProjects = await collection
        .find(query)
        .sort({ order: 1, createdAt: -1 })
        .toArray()
      
      allProjects = [...allProjects, ...dbProjects]
    }
    
    // Apply filtering if needed
    let filteredProjects = allProjects
    if (type) {
      filteredProjects = allProjects.filter(project => project.type === type)
    }
    if (featured === 'true') {
      filteredProjects = filteredProjects.filter(project => project.featured)
    }
    
    // Sort by featured first, then by order, then by creation date
    filteredProjects.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      if (a.order !== b.order) return a.order - b.order
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    
    return NextResponse.json({ projects: filteredProjects })
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
    const body = await request.json()
    const { 
      title, 
      description, 
      type, 
      images, 
      technologies, 
      links, 
      featured = false,
      order = 0
    } = body
    
    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'Title, description, and type are required' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const collection = db.collection<Omit<Project, '_id'>>('projects')
    
    const now = new Date()
    const newProject = {
      title,
      slug: title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
      description,
      type: type as Project['type'],
      images: images || [],
      technologies: technologies || [],
      links: links || {},
      featured,
      order,
      createdAt: now,
      updatedAt: now
    }
    
    const result = await collection.insertOne(newProject)
    
    return NextResponse.json({ id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}