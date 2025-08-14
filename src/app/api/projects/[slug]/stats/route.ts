import { NextRequest, NextResponse } from 'next/server'

interface GitHubRepoStats {
  id: number
  name: string
  full_name: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string | null
  size: number
  open_issues_count: number
  created_at: string
  updated_at: string
  pushed_at: string
}

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

    // Fetch repository stats from GitHub API
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-App'
        }
      }
    )

    if (!repoResponse.ok) {
      throw new Error(`GitHub API error: ${repoResponse.status}`)
    }

    const repoData: GitHubRepoStats = await repoResponse.json()

    // Fetch additional stats in parallel
    const [commitsResponse, contributorsResponse] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-App'
        }
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-App'
        }
      })
    ])

    // Extract commit count from headers
    const commitCount = commitsResponse.headers.get('link')
      ? parseInt(commitsResponse.headers.get('link')?.match(/page=(\d+)>; rel="last"/)?.[1] || '0')
      : 1

    // Get contributor count
    const contributors = contributorsResponse.ok ? await contributorsResponse.json() : []
    const contributorCount = Array.isArray(contributors) ? contributors.length : 0

    const stats = {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      language: repoData.language || 'Unknown',
      size: repoData.size,
      openIssues: repoData.open_issues_count,
      commits: commitCount,
      contributors: contributorCount,
      createdAt: repoData.created_at,
      updatedAt: repoData.updated_at,
      lastCommit: repoData.pushed_at
    }

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600'
      }
    })

  } catch (error) {
    console.error('Error fetching GitHub stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub stats' },
      { status: 500 }
    )
  }
}