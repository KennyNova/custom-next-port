export function getPostHogProjectToken(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY
  )
}

export function isPostHogConfigured(): boolean {
  return Boolean(getPostHogProjectToken())
}

export function getPostHogHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
}

export function getPostHogUiHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || 'https://us.posthog.com'
}
