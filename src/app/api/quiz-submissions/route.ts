import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getDatabase, isDatabaseAvailable } from '@/lib/db/mongodb'
import { captureServerEvent, getDistinctIdFromRequest } from '@/lib/posthog/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type QuizStatus = 'in_progress' | 'completed'

type QuizSubmissionPayload = {
  sessionId: string
  status: QuizStatus
  reason?: string
  ctaVariantId?: string
  answers: Record<string, string | string[]>
  currentQuestionId?: string | null
  currentQuestionIndex?: number
  totalQuestions?: number
  questionsAnswered?: number
  progressPercent?: number
  primaryService?: string
  servicePercentages?: Array<{ service: string; percentage: number }>
  contact?: {
    email?: string
    phone?: string
    consultationRequested?: boolean
  }
  submittedAt?: string
}

type StoredQuizSubmission = {
  sessionId: string
  status: QuizStatus
  answers: Record<string, string | string[]>
  notifications?: {
    leadEmailSentAt?: Date
  }
}

const MAX_ANSWERS = 32

function sanitizeString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (!normalized) return undefined
  return normalized.slice(0, maxLength)
}

function sanitizeAnswers(raw: unknown): Record<string, string | string[]> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {}
  }

  const source = raw as Record<string, unknown>
  const keys = Object.keys(source).slice(0, MAX_ANSWERS)
  const cleaned: Record<string, string | string[]> = {}

  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string') {
      const normalized = sanitizeString(value, 200)
      if (normalized) cleaned[key] = normalized
      continue
    }

    if (Array.isArray(value)) {
      const items = value
        .filter((item) => typeof item === 'string')
        .map((item) => sanitizeString(item, 200))
        .filter((item): item is string => Boolean(item))
        .slice(0, 20)
      if (items.length > 0) cleaned[key] = items
    }
  }

  return cleaned
}

function parsePayload(body: unknown): QuizSubmissionPayload | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return null
  }

  const raw = body as Record<string, unknown>
  const sessionId = sanitizeString(raw.sessionId, 128)
  if (!sessionId) return null

  const status = raw.status === 'completed' ? 'completed' : 'in_progress'
  const answers = sanitizeAnswers(raw.answers)
  if (Object.keys(answers).length === 0) return null

  const contactRaw = raw.contact
  let contact: QuizSubmissionPayload['contact'] | undefined
  if (typeof contactRaw === 'object' && contactRaw !== null && !Array.isArray(contactRaw)) {
    const source = contactRaw as Record<string, unknown>
    contact = {
      email: sanitizeString(source.email, 180),
      phone: sanitizeString(source.phone, 64),
      consultationRequested:
        typeof source.consultationRequested === 'boolean'
          ? source.consultationRequested
          : undefined,
    }
    if (!contact.email && !contact.phone && !contact.consultationRequested) {
      contact = undefined
    }
  }

  return {
    sessionId,
    status,
    reason: sanitizeString(raw.reason, 64),
    ctaVariantId: sanitizeString(raw.ctaVariantId, 64),
    answers,
    currentQuestionId: sanitizeString(raw.currentQuestionId, 64) ?? null,
    currentQuestionIndex:
      typeof raw.currentQuestionIndex === 'number' ? raw.currentQuestionIndex : undefined,
    totalQuestions: typeof raw.totalQuestions === 'number' ? raw.totalQuestions : undefined,
    questionsAnswered:
      typeof raw.questionsAnswered === 'number' ? raw.questionsAnswered : undefined,
    progressPercent: typeof raw.progressPercent === 'number' ? raw.progressPercent : undefined,
    primaryService: sanitizeString(raw.primaryService, 64),
    servicePercentages: Array.isArray(raw.servicePercentages)
      ? raw.servicePercentages
          .map((item) => {
            if (typeof item !== 'object' || item === null) return null
            const row = item as Record<string, unknown>
            const service = sanitizeString(row.service, 64)
            const percentage = typeof row.percentage === 'number' ? row.percentage : undefined
            if (!service || percentage === undefined) return null
            return { service, percentage: Math.max(0, Math.min(100, Math.round(percentage))) }
          })
          .filter((item): item is { service: string; percentage: number } => Boolean(item))
          .slice(0, 6)
      : [],
    contact,
    submittedAt: sanitizeString(raw.submittedAt, 64),
  }
}

function formatAnswersForEmail(answers: Record<string, string | string[]>): string {
  return Object.entries(answers)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `Q${key}: ${value.join(', ')}`
      }
      return `Q${key}: ${value}`
    })
    .join('\n')
}

async function sendLeadEmail(
  payload: QuizSubmissionPayload,
  reason: string
): Promise<{ sent: boolean; message: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.QUIZ_LEADS_TO_EMAIL
  const fromEmail = process.env.QUIZ_LEADS_FROM_EMAIL

  if (!apiKey || !toEmail || !fromEmail) {
    return { sent: false, message: 'Lead email not configured.' }
  }

  const resend = new Resend(apiKey)
  const contactEmail = payload.contact?.email || 'N/A'
  const contactPhone = payload.contact?.phone || 'N/A'
  const subject = `[Quiz Lead] ${payload.status === 'completed' ? 'Completed' : 'In Progress'} quiz`

  const text = [
    `Session ID: ${payload.sessionId}`,
    `Status: ${payload.status}`,
    `Reason: ${reason}`,
    `CTA Variant: ${payload.ctaVariantId || 'N/A'}`,
    `Progress: ${payload.progressPercent ?? 'N/A'}%`,
    `Primary Service: ${payload.primaryService || 'N/A'}`,
    `Email: ${contactEmail}`,
    `Phone: ${contactPhone}`,
    `Consultation Requested: ${payload.contact?.consultationRequested ? 'Yes' : 'No'}`,
    '',
    'Top Service Matches:',
    ...(payload.servicePercentages ?? []).map(
      (entry) => `- ${entry.service}: ${Math.round(entry.percentage)}%`
    ),
    '',
    'Answers:',
    formatAnswersForEmail(payload.answers),
  ].join('\n')

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject,
    text,
  })

  if (error) {
    return { sent: false, message: error.message }
  }

  return { sent: true, message: 'Lead email sent.' }
}

export async function POST(request: NextRequest) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json(
      { ok: false, message: 'Database is not configured for quiz submissions.' },
      { status: 503 }
    )
  }

  let payload: QuizSubmissionPayload | null = null
  try {
    const body = await request.json()
    payload = parsePayload(body)
  } catch {
    payload = null
  }

  if (!payload) {
    return NextResponse.json({ ok: false, message: 'Invalid submission payload.' }, { status: 400 })
  }

  const db = await getDatabase()
  const collection = db.collection<StoredQuizSubmission>('quiz_submissions')
  const existing = await collection.findOne({ sessionId: payload.sessionId })
  const now = new Date()

  const shouldNotifyByEmail = Boolean(payload.contact?.email || payload.contact?.phone)
  const alreadyNotified = Boolean(existing?.notifications?.leadEmailSentAt)

  let emailStatus: { sent: boolean; message: string } = {
    sent: false,
    message: 'Notification skipped.',
  }
  if (shouldNotifyByEmail && !alreadyNotified) {
    emailStatus = await sendLeadEmail(payload, payload.reason || 'autosave')
  }

  const setPayload: Record<string, unknown> = {
    status: payload.status,
    reason: payload.reason || 'autosave',
    ctaVariantId: payload.ctaVariantId,
    answers: payload.answers,
    currentQuestionId: payload.currentQuestionId ?? null,
    currentQuestionIndex: payload.currentQuestionIndex ?? null,
    totalQuestions: payload.totalQuestions ?? null,
    questionsAnswered: payload.questionsAnswered ?? Object.keys(payload.answers).length,
    progressPercent: payload.progressPercent ?? null,
    primaryService: payload.primaryService ?? null,
    servicePercentages: payload.servicePercentages ?? [],
    updatedAt: now,
    latestSubmissionAt: payload.submittedAt ? new Date(payload.submittedAt) : now,
  }

  if (payload.contact) {
    setPayload.contact = payload.contact
  }

  if (payload.status === 'completed') {
    setPayload.completedAt = now
  }

  if (emailStatus.sent) {
    setPayload['notifications.leadEmailSentAt'] = now
  }

  await collection.updateOne(
    { sessionId: payload.sessionId },
    {
      $setOnInsert: {
        sessionId: payload.sessionId,
        createdAt: now,
      },
      $set: setPayload,
    },
    { upsert: true }
  )

  await captureServerEvent(
    getDistinctIdFromRequest(request) || payload.sessionId,
    'quiz_submission_saved',
    {
      status: payload.status,
      reason: payload.reason || 'autosave',
      cta_variant: payload.ctaVariantId,
      has_email: Boolean(payload.contact?.email),
      has_phone: Boolean(payload.contact?.phone),
      consultation_requested: Boolean(payload.contact?.consultationRequested),
      questions_answered: payload.questionsAnswered ?? Object.keys(payload.answers).length,
      progress_percent: payload.progressPercent ?? null,
    }
  )

  return NextResponse.json({
    ok: true,
    emailNotified: emailStatus.sent,
    message: emailStatus.message,
  })
}
