const PLACEHOLDER_KEYS = new Set([
  'your_clerk_publishable_key',
  'your_clerk_secret_key',
  'pk_test_your_publishable_key_here',
  'sk_test_your_secret_key_here',
])

function isValidClerkKey(
  key: string | undefined,
  prefix: 'pk_' | 'sk_'
): boolean {
  if (!key || PLACEHOLDER_KEYS.has(key)) {
    return false
  }

  return key.startsWith(prefix)
}

/** Server-side: both publishable and secret keys must be real. */
export function isClerkConfigured(): boolean {
  return (
    isValidClerkKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, 'pk_') &&
    isValidClerkKey(process.env.CLERK_SECRET_KEY, 'sk_')
  )
}

/** Client-side: publishable key only (safe to expose). */
export function isClerkConfiguredClient(): boolean {
  return isValidClerkKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, 'pk_')
}
