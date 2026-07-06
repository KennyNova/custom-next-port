import { PostHog } from 'posthog-node'
import { getPostHogHost, isPostHogConfigured } from './config'

let posthogClient: PostHog | null = null

export function getPostHogClient(): PostHog | null {
  if (!isPostHogConfigured()) {
    return null
  }

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      host: getPostHogHost(),
      flushAt: 1,
      flushInterval: 0,
    })
  }

  return posthogClient
}

export function getDistinctIdFromRequest(request: Request): string | undefined {
  return (
    request.headers.get('X-POSTHOG-DISTINCT-ID') ||
    request.headers.get('x-posthog-distinct-id') ||
    undefined
  )
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const posthog = getPostHogClient()
  if (!posthog) {
    return
  }

  posthog.capture({
    distinctId,
    event,
    properties,
  })

  await posthog.shutdown()
  posthogClient = null
}
