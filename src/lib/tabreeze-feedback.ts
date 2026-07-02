import { Resend } from 'resend'

export const REPORT_TYPES = ['survey', 'bug_report'] as const
export type ReportType = (typeof REPORT_TYPES)[number]

export const MAX_BODY_BYTES = 16 * 1024
export const MAX_APP_URL_LENGTH = 2048
export const MAX_USER_AGENT_LENGTH = 1024
export const MAX_EXTENSION_VERSION_LENGTH = 64
export const MAX_DIAGNOSTICS_BYTES = 8 * 1024
export const HONEYPOT_FIELD = 'website'

const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:3000']

let resendClient: Resend | null = null

export interface TabreezeFeedbackPayload {
  reportType: ReportType
  message: string
  rating?: number
  submittedAt: string
  extensionVersion?: string | null
  appUrl: string
  userAgent: string
  diagnostics?: Record<string, unknown> | null
}

export interface ValidationResult {
  valid: boolean
  payload?: TabreezeFeedbackPayload
}

function sanitizeText(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

function isValidIsoTimestamp(value: string): boolean {
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidStringField(value: string, maxLength: number): boolean {
  const sanitized = sanitizeText(value)
  return sanitized.length > 0 && sanitized.length <= maxLength
}

function isDiagnosticsWithinLimit(diagnostics: Record<string, unknown>): boolean {
  try {
    return JSON.stringify(diagnostics).length <= MAX_DIAGNOSTICS_BYTES
  } catch {
    return false
  }
}

function getResendClient(apiKey: string): Resend {
  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

export function validatePayload(body: unknown): ValidationResult {
  if (!isPlainObject(body)) {
    return { valid: false }
  }

  const honeypot = body[HONEYPOT_FIELD]
  if (honeypot !== undefined && honeypot !== null && honeypot !== '') {
    return { valid: false }
  }

  const reportType = body.reportType
  if (typeof reportType !== 'string' || !REPORT_TYPES.includes(reportType as ReportType)) {
    return { valid: false }
  }

  if (typeof body.message !== 'string') {
    return { valid: false }
  }

  const message = sanitizeText(body.message)
  if (message.length < 3 || message.length > 4000) {
    return { valid: false }
  }

  if (body.rating !== undefined && body.rating !== null) {
    if (
      typeof body.rating !== 'number' ||
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5
    ) {
      return { valid: false }
    }
  }

  if (typeof body.submittedAt !== 'string' || !isValidIsoTimestamp(body.submittedAt)) {
    return { valid: false }
  }

  if (body.extensionVersion !== undefined && body.extensionVersion !== null) {
    if (
      typeof body.extensionVersion !== 'string' ||
      sanitizeText(body.extensionVersion).length > MAX_EXTENSION_VERSION_LENGTH
    ) {
      return { valid: false }
    }
  }

  if (
    typeof body.appUrl !== 'string' ||
    !isValidStringField(body.appUrl, MAX_APP_URL_LENGTH)
  ) {
    return { valid: false }
  }

  if (
    typeof body.userAgent !== 'string' ||
    !isValidStringField(body.userAgent, MAX_USER_AGENT_LENGTH)
  ) {
    return { valid: false }
  }

  if (body.diagnostics !== undefined && body.diagnostics !== null) {
    if (!isPlainObject(body.diagnostics) || !isDiagnosticsWithinLimit(body.diagnostics)) {
      return { valid: false }
    }
  }

  const payload: TabreezeFeedbackPayload = {
    reportType: reportType as ReportType,
    message,
    submittedAt: body.submittedAt,
    appUrl: sanitizeText(body.appUrl),
    userAgent: sanitizeText(body.userAgent),
  }

  if (body.rating !== undefined && body.rating !== null) {
    payload.rating = body.rating
  }

  if (body.extensionVersion !== undefined) {
    payload.extensionVersion =
      body.extensionVersion === null ? null : sanitizeText(body.extensionVersion)
  }

  if (body.diagnostics !== undefined) {
    payload.diagnostics = body.diagnostics
  }

  return { valid: true, payload }
}

export function getEmailSubject(reportType: ReportType): string {
  return reportType === 'survey' ? 'Tabreeze survey feedback' : 'Tabreeze bug report'
}

export function formatEmailBody(payload: TabreezeFeedbackPayload): string {
  const lines = [
    `Report type: ${payload.reportType}`,
    '',
    'Message:',
    payload.message,
    '',
    `Rating: ${payload.rating ?? 'N/A'}`,
    `Submitted at: ${payload.submittedAt}`,
    `Extension version: ${payload.extensionVersion ?? 'N/A'}`,
    `App URL: ${payload.appUrl}`,
    `User agent: ${payload.userAgent}`,
  ]

  if (payload.diagnostics) {
    lines.push('', 'Diagnostics:', JSON.stringify(payload.diagnostics, null, 2))
  }

  return lines.join('\n')
}

export async function sendFeedbackEmail(payload: TabreezeFeedbackPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.TABREEZE_FEEDBACK_TO_EMAIL
  const fromEmail = process.env.TABREEZE_FEEDBACK_FROM_EMAIL

  if (!apiKey || !toEmail || !fromEmail) {
    throw new Error('Email configuration is incomplete')
  }

  const resend = getResendClient(apiKey)

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: getEmailSubject(payload.reportType),
    text: formatEmailBody(payload),
  })

  if (error) {
    throw new Error(error.message)
  }
}

export function getAllowedOrigins(): string[] {
  const configured = process.env.TABREEZE_FEEDBACK_ALLOWED_ORIGINS
  const fromEnv = configured
    ? configured.split(',').map((o) => o.trim()).filter(Boolean)
    : []

  const devOrigins = process.env.NODE_ENV === 'development' ? DEFAULT_DEV_ORIGINS : []

  return Array.from(new Set([...fromEnv, ...devOrigins]))
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    return false
  }

  return getAllowedOrigins().includes(origin)
}

export function corsHeaders(origin: string | null): HeadersInit {
  if (!origin || !isOriginAllowed(origin)) {
    return {}
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}
