import posthog from 'posthog-js'
import { isPostHogConfigured } from './config'

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (!isPostHogConfigured() || typeof window === 'undefined') {
    return
  }

  posthog.capture(event, properties)
}

export function captureException(
  error: unknown,
  properties?: Record<string, unknown>
): void {
  if (!isPostHogConfigured() || typeof window === 'undefined') {
    return
  }

  posthog.captureException(error, properties)
}
