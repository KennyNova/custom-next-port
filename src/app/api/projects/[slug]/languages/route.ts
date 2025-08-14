import { NextRequest, NextResponse } from 'next/server'

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

    // Fetch languages from GitHub API
    const languagesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-App'
        }
      }
    )

    if (!languagesResponse.ok) {
      throw new Error(`GitHub API error: ${languagesResponse.status}`)
    }

    const languagesData = await languagesResponse.json()

    // Calculate percentages
    const totalBytes = Object.values(languagesData).reduce((sum: number, bytes: any) => sum + bytes, 0)
    
    const languagePercentages: Record<string, number> = {}
    for (const [language, bytes] of Object.entries(languagesData)) {
      languagePercentages[language] = ((bytes as number) / totalBytes) * 100
    }

    return NextResponse.json(languagePercentages, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=7200'
      }
    })

  } catch (error) {
    console.error('Error fetching GitHub languages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub languages' },
      { status: 500 }
    )
  }
}