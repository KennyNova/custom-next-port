import { promises as fs } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const safeId = params.id.replace(/[^a-z0-9-]/gi, '').toLowerCase()
    if (!safeId) {
      return NextResponse.json({ error: 'Invalid template id' }, { status: 400 })
    }

    const filePath = path.join(
      process.cwd(),
      'src',
      'data',
      'n8n-templates',
      `${safeId}.json`
    )

    const raw = await fs.readFile(filePath, 'utf8')
    const template = JSON.parse(raw)

    return NextResponse.json(template)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Template not found',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 404 }
    )
  }
}
