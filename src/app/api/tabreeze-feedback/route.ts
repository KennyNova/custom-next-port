import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureServerEvent, getDistinctIdFromRequest } from '@/lib/posthog/server'
import {
  corsHeaders,
  isOriginAllowed,
  MAX_BODY_BYTES,
  sendFeedbackEmail,
  validatePayload,
} from '@/lib/tabreeze-feedback'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function jsonResponse(
  body: { ok: boolean; message: string },
  status: number,
  origin: string | null
): NextResponse {
  return NextResponse.json(body, { status, headers: corsHeaders(origin) })
}

function isJsonContentType(contentType: string | null): boolean {
  if (!contentType) {
    return false
  }

  const mediaType = contentType.split(';')[0].trim().toLowerCase()
  return mediaType === 'application/json'
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (!isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 })
  }

  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (!isOriginAllowed(origin)) {
    return jsonResponse({ ok: false, message: 'Invalid payload.' }, 400, origin)
  }

  if (!isJsonContentType(request.headers.get('content-type'))) {
    return jsonResponse({ ok: false, message: 'Invalid payload.' }, 400, origin)
  }

  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const parsedLength = Number.parseInt(contentLength, 10)
    if (!Number.isNaN(parsedLength) && parsedLength > MAX_BODY_BYTES) {
      return jsonResponse({ ok: false, message: 'Invalid payload.' }, 400, origin)
    }
  }

  const rateLimit = await checkRateLimit(request)
  if (!rateLimit.success) {
    if (!rateLimit.configured) {
      console.error('Tabreeze feedback rejected: rate limiter unavailable')
      return jsonResponse(
        { ok: false, message: 'Unable to process feedback.' },
        500,
        origin
      )
    }

    console.warn('Tabreeze feedback rate limit exceeded', {
      remaining: rateLimit.remaining,
      limit: rateLimit.limit,
    })
    return jsonResponse({ ok: false, message: 'Invalid payload.' }, 400, origin)
  }

  let body: unknown
  try {
    const rawBody = await request.text()
    if (rawBody.length > MAX_BODY_BYTES) {
      return jsonResponse({ ok: false, message: 'Invalid payload.' }, 400, origin)
    }
    body = JSON.parse(rawBody)
  } catch {
    return jsonResponse({ ok: false, message: 'Invalid payload.' }, 400, origin)
  }

  const validation = validatePayload(body)
  if (!validation.valid || !validation.payload) {
    return jsonResponse({ ok: false, message: 'Invalid payload.' }, 400, origin)
  }

  try {
    await sendFeedbackEmail(validation.payload)
    await captureServerEvent(
      getDistinctIdFromRequest(request) || 'tabreeze-extension',
      'tabreeze_feedback_submitted',
      {
        report_type: validation.payload.reportType,
        source: 'api',
      }
    )
    console.log('Tabreeze feedback received', {
      reportType: validation.payload.reportType,
      submittedAt: validation.payload.submittedAt,
    })
    return jsonResponse({ ok: true, message: 'Feedback received.' }, 200, origin)
  } catch (error) {
    console.error('Tabreeze feedback email failed:', error)
    return jsonResponse(
      { ok: false, message: 'Unable to process feedback.' },
      500,
      origin
    )
  }
}