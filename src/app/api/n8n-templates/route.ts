import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'n8n-templates-index.json')
    const raw = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unable to load n8n templates index',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
