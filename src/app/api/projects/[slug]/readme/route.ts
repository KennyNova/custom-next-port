import { NextRequest, NextResponse } from 'next/server'
import { marked } from 'marked'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    const token = process.env.GITHUB_TOKEN

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      )
    }

    // Get the project to find the GitHub repo
    const projectsResponse = await fetch(`${request.nextUrl.origin}/api/projects`)
    const projectsData = await projectsResponse.json()
    const project = projectsData.projects.find((p: any) => p.slug === slug)

    if (!project || !project.links?.github) {
      return NextResponse.json(
        { error: 'Project or GitHub link not found' },
        { status: 404 }
      )
    }

    // Extract owner and repo from GitHub URL
    const githubUrl = project.links.github
    const [, , , owner, repo] = githubUrl.split('/')

    // Fetch README from GitHub API
    const readmeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-App'
        }
      }
    )

    if (!readmeResponse.ok) {
      if (readmeResponse.status === 404) {
        return new NextResponse('README not found', { status: 404 })
      }
      throw new Error(`GitHub API error: ${readmeResponse.status}`)
    }

    const readmeData = await readmeResponse.json()
    const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8')

    // Convert markdown to HTML
    const htmlContent = await marked(readmeContent)

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=7200'
      }
    })

  } catch (error) {
    console.error('Error fetching README:', error)
    return NextResponse.json(
      { error: 'Failed to fetch README' },
      { status: 500 }
    )
  }
}