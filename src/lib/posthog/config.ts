export function isPostHogConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN)
}

export function getPostHogHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
}

export function getPostHogUiHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || 'https://us.posthog.com'
}
