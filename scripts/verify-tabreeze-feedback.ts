/**
 * Quick verification script for Tabreeze feedback validation/email formatting.
 * Run: npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/verify-tabreeze-feedback.ts
 * Or use node after compiling - for simplicity we test via direct import in a small runner.
 */

import {
  formatEmailBody,
  getEmailSubject,
  isOriginAllowed,
  validatePayload,
} from '../src/lib/tabreeze-feedback'

const validSurvey = {
  reportType: 'survey',
  message: 'Great extension, but weather widget freezes sometimes.',
  rating: 4,
  submittedAt: '2026-07-02T19:00:00.000Z',
  extensionVersion: '1.1.0',
  appUrl: 'chrome://newtab/',
  userAgent: 'Mozilla/5.0 Test',
  diagnostics: {
    themePreset: 'dev',
    themeAutomationEnabled: true,
  },
}

const validBug = {
  ...validSurvey,
  reportType: 'bug_report',
  rating: undefined,
}

const cases: Array<{ name: string; body: unknown; expectValid: boolean }> = [
  { name: 'valid survey', body: validSurvey, expectValid: true },
  { name: 'valid bug_report', body: validBug, expectValid: true },
  { name: 'missing message', body: { ...validSurvey, message: '' }, expectValid: false },
  { name: 'bad reportType', body: { ...validSurvey, reportType: 'other' }, expectValid: false },
  { name: 'bad rating', body: { ...validSurvey, rating: 6 }, expectValid: false },
  { name: 'bad timestamp', body: { ...validSurvey, submittedAt: 'not-a-date' }, expectValid: false },
  { name: 'honeypot filled', body: { ...validSurvey, website: 'spam' }, expectValid: false },
  { name: 'message too short', body: { ...validSurvey, message: 'hi' }, expectValid: false },
]

let passed = 0
let failed = 0

for (const testCase of cases) {
  const result = validatePayload(testCase.body)
  const ok = result.valid === testCase.expectValid
  if (ok) {
    passed++
    console.log(`PASS: ${testCase.name}`)
  } else {
    failed++
    console.error(`FAIL: ${testCase.name} (expected valid=${testCase.expectValid}, got valid=${result.valid})`)
  }
}

const surveyResult = validatePayload(validSurvey)
if (surveyResult.valid && surveyResult.payload) {
  const subject = getEmailSubject(surveyResult.payload.reportType)
  const body = formatEmailBody(surveyResult.payload)
  if (subject === 'Tabreeze survey feedback' && body.includes('Report type: survey')) {
    passed++
    console.log('PASS: email subject/body formatting')
  } else {
    failed++
    console.error('FAIL: email subject/body formatting')
  }
}

process.env.TABREEZE_FEEDBACK_ALLOWED_ORIGINS =
  'chrome-extension://abc123,http://localhost:5173'

if (
  isOriginAllowed('chrome-extension://abc123') &&
  isOriginAllowed('http://localhost:5173') &&
  !isOriginAllowed('chrome-extension://other-extension') &&
  !isOriginAllowed('https://evil.example')
) {
  passed++
  console.log('PASS: CORS origin allowlist')
} else {
  failed++
  console.error('FAIL: CORS origin allowlist')
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
